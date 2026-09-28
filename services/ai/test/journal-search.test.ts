import {describe, it, expect} from "vitest";
import {JournalSearch, cosine, parseWorks, distinctJournals} from "../src/journal-search.js";
const work = (n: number) => ({DOI:`10.1234/${n}`,title:[`Article ${n}`],"container-title":[`Journal ${n}`],ISSN:[`${n}234-567X`]});
const body = {message:{items:[work(1),work(2)]}};
describe('grounded journal matching', () => {
 it('rejects invented or malformed identifiers and duplicate articles', () => {
   expect(parseWorks({message:{items:[work(1),work(1),{...work(2),DOI:'javascript:alert(1)'},{...work(2),ISSN:[]}]}})).toHaveLength(1);
 });
 it('validates vectors rather than silently ranking broken output', () => {
   expect(cosine([1,0],[1,0])).toBe(1);
   for(const pair of [[[0,0],[1,0]],[[1],[1,0]],[[NaN],[1]]]) expect(() => cosine(pair[0]!,pair[1]!)).toThrow();
 });
 it('ranks only retrieved records using embeddings', async () => {
   const request = async (url: string | URL | Request) => new Response(JSON.stringify(String(url).includes('/works?') ? body : {embeddings:[[1,0],[0,1],[1,0]]}));
   const result = await new JournalSearch('http://local','test',request as typeof fetch).search('a research topic');
   expect(result.ranking).toBe('local-embeddings');
   expect(result.journals.map(j => j.title)).toEqual(['Journal 2','Journal 1']);
 });
 it('falls back explicitly when embedding service fails', async () => {
   const request = async (url: string | URL | Request) => String(url).includes('/works?') ? new Response(JSON.stringify(body)) : new Response('',{status:503});
   const result = await new JournalSearch('http://local','test',request as typeof fetch).search('a research topic');
   expect(result.ranking).toBe('crossref'); expect(result.model).toBeNull(); expect(result.journals).toHaveLength(2);
 });
 it('propagates a retrieval outage instead of returning invented matches', async () => {
   await expect(new JournalSearch('http://local','test', (async () => new Response('',{status:503})) as typeof fetch).search('a research topic')).rejects.toThrow();
 });
 it('deduplicates journals by ISSN', () => {
   const records = parseWorks(body); expect(distinctJournals([records[0]!,{...records[1]!,issns:records[0]!.issns}])).toHaveLength(1);
 });
});
