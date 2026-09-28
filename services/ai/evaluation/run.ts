import {writeFile, mkdir} from 'node:fs/promises';
import {JournalSearch} from '../src/journal-search.js';
const topics = ['machine learning for wireless network intrusion detection', 'solar cell efficiency and perovskite materials', 'biodiversity conservation in tropical forests'];
const search = new JournalSearch(process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434', process.env.OLLAMA_EMBEDDING_MODEL ?? 'nomic-embed-text');
const cases = [];
const dataset = [];
for (const topic of topics) {
 const started = Date.now();
 try {
  const result = await search.search(topic);
  cases.push({topic, elapsedMs:Date.now()-started, ranking:result.ranking, count:result.journals.length, hasSourceLinks:result.journals.every(j=>j.sourceUrl.startsWith('https://doi.org/')), error:null});
  for(const journal of result.journals) dataset.push({query:topic, candidate:journal, relevance:null, reviewedBy:null, source:'Crossref REST API', retrievedAt:new Date().toISOString()});
 } catch(error) {cases.push({topic,elapsedMs:Date.now()-started,error:String(error)});}
 console.log(JSON.stringify(cases.at(-1)));
}
await mkdir('services/ai/evaluation/output',{recursive:true});
await writeFile('services/ai/evaluation/output/report.json',JSON.stringify({generatedAt:new Date().toISOString(),scope:'Operational smoke checks only. No human relevance labels; accuracy is not measured.',cases},null,2));
await writeFile('services/ai/evaluation/output/candidates.jsonl',dataset.map(row=>JSON.stringify(row)).join('\n')+'\n');
