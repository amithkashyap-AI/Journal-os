# API-driven local search training

This trains actual **search-ranking weights**, using frozen embeddings from local Ollama. It does not fine-tune Llama or change Ollama's base model weights. The small NumPy trainer avoids downloading an additional multi-GB model.

## Run / update

From the repository root (Python 3 + NumPy and local `nomic-embed-text` required):

```sh
python3 services/ai/training/train.py
# Refresh the Crossref API snapshot and retrain:
python3 services/ai/training/train.py --refresh
```

Use `--ollama URL` and `--model NAME` for another configured local embedding service. The trainer calls Crossref's public REST API; no API key is required. It fetches at most 40 article records from each of 12 journal ISSNs (chosen from the discovery evaluation), removes duplicate DOI/title records and excludes obvious corrections/retractions/editorial listings. Metadata source URLs and retrieval times are saved.

## What is learned

A diagonal, 768-feature reranker optimizes pairwise logistic loss on normalized query/document embeddings. Same-venue article pairs provide positive **proxy** labels. Other venues provide sampled/hard negatives, which can include scientifically relevant articles. The objective is historical publication-venue recovery, not authoritative submission recommendations.

The DOI-hash split separates query records 60/20/20 into train/validation/test within each venue. Candidate articles come from the training partition; identical query/candidate DOIs are excluded from training comparisons. Normalized title duplicates are removed before splitting. Venues are shared across splits. The validation set selects the checkpoint; the test set is evaluated afterward. Repeated training on the same public benchmark is not a fresh independent evaluation.

## Promotion and rollback

`output/report.json` contains baseline and trained MRR, top-1 venue recovery, recall@5, split counts and provenance. Promotion requires validation MRR to improve by at least 0.005, and test MRR and top-1 venue recovery to be no worse than the untrained cosine baseline. This is a narrow operational gate, not statistical proof of generalization. Stronger human-reviewed, out-of-domain evaluation is still needed.

The candidate artifact is saved even if it fails. Only a passing candidate is written atomically to `output/active-ranker.json`; a failed run preserves the previous active artifact. The AI service loads active weights for each search, checks the embedding model digest and dimensions, and otherwise uses baseline cosine ranking. Delete/rename the active artifact to roll back to baseline; no Ollama model deletion is needed.

Artifacts:
- `corpus.json`: small API-sourced metadata snapshot.
- `split.json`: exact DOI membership for reproducibility.
- `embeddings-*.npy`: cached local embeddings, keyed by model digest + input text; not committed.
- `candidate-ranker.json`, `active-ranker.json`: learned weights and model identity.
- `report.json`: evaluation scope and results, including whether activated.

No accuracy percentage for real-world journal suitability can be inferred from these proxy metrics. Topic descriptions sent through app search go to Crossref; embedding and ranking computation stay local. The training corpus contains only public metadata, with no user manuscript content.

Sources: https://www.crossref.org/documentation/retrieve-metadata/rest-api/ and https://docs.ollama.com/api/embed
