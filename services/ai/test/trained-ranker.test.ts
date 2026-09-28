import {describe,expect,it} from 'vitest';
import {trainedScore,validateRanker} from '../src/trained-ranker.js';
const artifact={version:1,embeddingModel:'nomic-embed-text:latest',embeddingDigest:'digest',dimensions:2,weights:[1,2],promoted:true,trainedAt:'2026-09-28',labelType:'publication-venue proxy'};
describe('trained ranker',()=>{
 it('accepts only promoted weights for the exact installed embedding model',()=>{
   expect(validateRanker(artifact,'nomic-embed-text','digest')).not.toBeNull();
   for(const patch of [{promoted:false},{weights:[1]},{weights:[NaN,1]},{weights:[-1,1]},{embeddingDigest:'old'},{embeddingModel:'different'}]) expect(validateRanker({...artifact,...patch},'nomic-embed-text','digest')).toBeNull();
 });
 it('normalizes embeddings consistently with training',()=>{
   expect(trainedScore([2,0],[3,0],[1,2])).toBe(1);
   expect(trainedScore([0,2],[0,3],[1,2])).toBe(2);
   expect(()=>trainedScore([0,0],[1,0],[1,2])).toThrow();
   expect(()=>trainedScore([1],[1,2],[1,2])).toThrow();
 });
});
