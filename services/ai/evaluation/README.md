# Local journal search evaluation

Run from the repository root:

```sh
node --env-file=.env services/ai/node_modules/tsx/dist/cli.mjs services/ai/evaluation/run.ts
```

The pipeline retrieves up to 30 journal articles from Crossref, validates DOI/ISSN metadata, embeds the topic and article titles locally with `nomic-embed-text`, and returns up to eight distinct journals. It never asks a language model to invent journal records. Failure to embed is labeled as Crossref-only ranking. Crossref metadata is depositor supplied, not proof of quality or suitability. Retrieval is limited to the candidate set; relevant journals can be missed.

`output/report.json` measures availability, source links and latency, **not recommendation accuracy**. `output/candidates.jsonl` is a public-metadata review dataset. All relevance labels deliberately start as null. It contains no private manuscript data. Synthetic smoke-test topics are not a scientific benchmark.

## Before fine-tuning

Have domain reviewers label query/journal pairs (0 irrelevant, 1 partially relevant, 2 relevant), including difficult negatives, and record reviewer identity and disagreements. Collect a larger, representative set across research fields. Split by topic and journal before training to prevent leakage. Keep an untouched human-reviewed test set. Report precision@5, recall against the curated candidate pool, nDCG@5, and performance by field, plus service-failure rates. Do not treat DOI presence or similarity scores as correctness labels.

Fine-tune an embedding/reranking model in a compatible training framework only after labels exist, then compare it against this baseline. Ollama serves/imports models; changing prompts or temperature does not train weights. A generative model trained to memorize journals becomes stale and cannot establish current indexing, fees or acceptance probability.

Sources: https://api.crossref.org/swagger-ui/index.html and https://docs.ollama.com/api/embed
