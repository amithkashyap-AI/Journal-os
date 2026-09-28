"""Train a diagonal embedding reranker from API-sourced publication-venue proxy labels.
No LLM weights are modified. Run from the repository root; uses Python + NumPy.
"""
import argparse, datetime, hashlib, json, os, re, time, urllib.request
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'output'
OUT.mkdir(exist_ok=True)
parser = argparse.ArgumentParser()
parser.add_argument('--refresh', action='store_true', help='Fetch a fresh Crossref snapshot; cached embeddings remain reusable by content hash')
parser.add_argument('--ollama', default=os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434'))
parser.add_argument('--model', default=os.getenv('OLLAMA_EMBEDDING_MODEL', 'nomic-embed-text'))
args = parser.parse_args()
# Public journal identifiers from the earlier API discovery snapshot, across three fields.
ISSNS = ['1112-5209','0929-6212','1022-0038','1530-8669','2214-7853','0925-3467','0264-1275','2589-2347','0888-8892','0960-3115','0006-8101','0006-3207']

def request(url, body=None):
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, data=json.dumps(body).encode() if body is not None else None, headers={'Accept':'application/json','Content-Type':'application/json','User-Agent':'ResearchPublishingOS/0.1 (local training metadata snapshot)'})
            with urllib.request.urlopen(req, timeout=90) as response:
                return json.load(response)
        except Exception:
            if attempt == 2: raise
            time.sleep(2 ** attempt)

def normalized(text):
    return re.sub(r'\W+', ' ', text.casefold()).strip()

corpus_path = OUT / 'corpus.json'
if args.refresh or not corpus_path.exists():
    records, dois, titles = [], set(), set()
    for issn in ISSNS:
        url = f'https://api.crossref.org/journals/{issn}/works?filter=type:journal-article&rows=40&sort=published&order=desc&select=DOI,title,container-title,ISSN,publisher'
        body = request(url)
        for work in body['message']['items']:
            title = (work.get('title') or [''])[0]
            journal = (work.get('container-title') or [''])[0]
            doi = work.get('DOI','').lower()
            if not title or not journal or len(title.split()) < 5 or not re.match(r'^10\.\d{4,9}/\S+$', doi): continue
            if doi in dois or normalized(title) in titles: continue
            if any(term in title.lower() for term in ['retraction', 'correction to:', 'erratum', 'editorial board']): continue
            dois.add(doi); titles.add(normalized(title))
            records.append({'doi':doi,'title':title,'journal':journal,'venue':issn,'sourceUrl':url,'labelType':'publication-venue-proxy'})
        print(f'Fetched {issn}: {len(records)} total articles', flush=True)
    corpus_path.write_text(json.dumps({'retrievedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'records':records},indent=2))
corpus = json.loads(corpus_path.read_text())
records = corpus['records']
# Stable DOI-hash split within each venue; query DOIs and normalized titles are disjoint.
train, valid, test = [], [], []
for venue in ISSNS:
    indices = [i for i,r in enumerate(records) if r['venue']==venue]
    indices.sort(key=lambda i:hashlib.sha256(records[i]['doi'].encode()).hexdigest())
    if len(indices)<15: continue
    n=len(indices); a=int(n*.6); b=int(n*.8)
    train.extend(indices[:a]); valid.extend(indices[a:b]); test.extend(indices[b:])
if min(len(train),len(valid),len(test))<30: raise RuntimeError('Insufficient independent query records to train/evaluate')

tags=request(args.ollama+'/api/tags')['models']
model=next((m for m in tags if m['name'] in [args.model,args.model+':latest']),None)
if model is None: raise RuntimeError('Required embedding model is not installed')
texts=[f"search_query: {r['title']}" for r in records]+[f"search_document: {r['title'][:1500]}. Journal: {r['journal'][:300]}" for r in records]
key=hashlib.sha256(json.dumps([model['digest'],texts]).encode()).hexdigest()
cache=OUT/f'embeddings-{key}.npy'
if cache.exists(): vectors=np.load(cache,allow_pickle=False)
else:
    batches=[]
    for start in range(0,len(texts),24):
        response=request(args.ollama+'/api/embed',{'model':args.model,'input':texts[start:start+24],'truncate':False,'keep_alive':'10m'})
        batch=np.asarray(response['embeddings'],dtype=np.float32)
        if batch.ndim!=2 or len(batch)!=len(texts[start:start+24]) or not np.isfinite(batch).all(): raise RuntimeError('Invalid embeddings')
        batches.append(batch)
        print(f'Embedded {min(start+24,len(texts))}/{len(texts)}',flush=True)
    vectors=np.concatenate(batches); np.save(cache,vectors)
norms=np.linalg.norm(vectors,axis=1,keepdims=True)
if not np.isfinite(vectors).all() or (norms==0).any(): raise RuntimeError('Invalid vectors')
vectors=vectors/norms
q,d=np.split(vectors,2)
labels=np.asarray([r['venue'] for r in records])
pool=np.asarray(train)

def metrics(weights, queries):
    scores=(q[queries]*weights)@d[pool].T
    rr=[]; hits=[]; top=[]
    for row,idx in zip(scores,queries):
        ranking=pool[np.argsort(-row,kind='stable')]
        ranking=ranking[ranking!=idx]
        # Journal-level metrics: the first/highest article represents a journal.
        venues=list(dict.fromkeys(labels[ranking]))
        rank=venues.index(labels[idx])+1
        rr.append(1/rank); hits.append(rank<=5); top.append(rank==1)
    return {'mrr':float(np.mean(rr)),'top1VenueRecovery':float(np.mean(top)),'recallAt5':float(np.mean(hits)),'queries':len(queries)}

rng=np.random.default_rng(42)
features=[]
for idx in train:
    positives=[j for j in train if j!=idx and labels[j]==labels[idx]]
    negatives=[j for j in train if labels[j]!=labels[idx]]
    # Include hard negatives from embedding-nearest articles, plus random negatives.
    hard=sorted(negatives,key=lambda j:-float(q[idx]@d[j]))[:8]
    for pos in rng.choice(positives,size=min(4,len(positives)),replace=False):
        for neg in hard+list(rng.choice(negatives,size=4,replace=False)):
            features.append(q[idx]*(d[pos]-d[neg]))
x=np.asarray(features,dtype=np.float32)
w=np.ones(x.shape[1],dtype=np.float32); m=np.zeros_like(w); v=np.zeros_like(w)
baseline_valid=metrics(w,valid)
best=w.copy(); best_mrr=baseline_valid['mrr']; best_step=0
for step in range(1,201):
    logits=np.clip(x@w*10,-30,30)
    grad=-(x.T@(1/(1+np.exp(logits))))/len(x)*10 + .002*(w-1)
    m=.9*m+.1*grad;v=.999*v+.001*grad*grad
    w=np.clip(w-.025*(m/(1-.9**step))/(np.sqrt(v/(1-.999**step))+1e-8),.1,4)
    if step%10==0:
        current=metrics(w,valid)
        if current['mrr']>best_mrr: best=w.copy();best_mrr=current['mrr'];best_step=step
trained_valid=metrics(best,valid); baseline_test=metrics(np.ones_like(w),test); trained_test=metrics(best,test)
# Frozen validation-selected model evaluated once on test. No test-set tuning.
promote=(best_step>0 and trained_valid['mrr']>=baseline_valid['mrr']+.005 and trained_test['mrr']>=baseline_test['mrr'] and trained_test['top1VenueRecovery']>=baseline_test['top1VenueRecovery'])
report={'generatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'method':'pairwise logistic diagonal embedding reranker','labelType':'publication-venue proxy, not human suitability judgments','scope':'Closed 12-venue corpus across 3 fields; does not measure open-world search accuracy. Query DOI/title split; same venues appear in each split. Test candidates are training articles.','corpusArticles':len(records),'trainingQueries':len(train),'pairCount':len(x),'validationQueries':len(valid),'testQueries':len(test),'selectedStep':best_step,'baselineValidation':baseline_valid,'trainedValidation':trained_valid,'baselineTest':baseline_test,'trainedTest':trained_test,'promoted':bool(promote),'modelDigest':model['digest'],'corpusSha256':hashlib.sha256(corpus_path.read_bytes()).hexdigest()}
artifact={'version':1,'embeddingModel':model['name'],'embeddingDigest':model['digest'],'dimensions':len(best),'weights':best.tolist(),'promoted':bool(promote),'trainedAt':report['generatedAt'],'labelType':report['labelType']}
(OUT/'candidate-ranker.json').write_text(json.dumps(artifact,indent=2))
(OUT/'report.json').write_text(json.dumps(report,indent=2))
(OUT/'split.json').write_text(json.dumps({name:[records[i]['doi'] for i in indices] for name,indices in [('train',train),('validation',valid),('test',test)]},indent=2))
if promote:
    temporary=OUT/'active-ranker.tmp'; temporary.write_text(json.dumps(artifact)); temporary.replace(OUT/'active-ranker.json')
print(json.dumps(report,indent=2),flush=True)
