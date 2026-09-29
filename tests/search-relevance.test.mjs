import {test} from 'node:test';
import assert from 'node:assert/strict';
import {searchRelevance} from '../apps/web/lib/search-relevance.ts';
const journal = {title:'Journal of Network Security',publisherName:'Research Press',issn:'1234-567X',description:'Machine learning for wireless networks'};
test('ranks exact identity above partial title and scope matches', () => {
 assert.ok(searchRelevance(journal,journal.title) > searchRelevance(journal,'network'));
 assert.equal(searchRelevance(journal,'1234567x'),200);
 assert.equal(searchRelevance(journal,'1234-5678'),0);
 assert.ok(searchRelevance(journal,'machine learning') > 0);
});
test('ignores punctuation and common filler and avoids substring false positives', () => {
 for (const q of ['!!!','the and of','net','art']) assert.equal(searchRelevance(journal,q),0);
 assert.equal(searchRelevance(journal,'NETWORK'),searchRelevance(journal,'network'));
 assert.ok(searchRelevance(journal,'network network') > 0);
});

test('ranks journal slug, eissn, categories, indexing quartile and acronyms', () => {
  const fullJournal = {
    title: 'International Journal of Artificial Intelligence and Autonomous Systems',
    slug: 'ijaias',
    publisherName: 'EduBusiness Research Press',
    issn: '2995-1001',
    eissn: '2995-101X',
    description: 'Autonomous agents and foundation models.',
    publication: { categories: ['Computer Science', 'Artificial Intelligence'] },
    indexing: [{ source: 'SCOPUS', quartile: 'Q1', subjectCategory: 'Artificial Intelligence' }],
  };

  // Exact slug match
  assert.ok(searchRelevance(fullJournal, 'ijaias') >= 140);
  // eISSN match
  assert.equal(searchRelevance(fullJournal, '2995101x'), 200);
  // Quartile match
  assert.ok(searchRelevance(fullJournal, 'q1') >= 40);
  // Category match
  assert.ok(searchRelevance(fullJournal, 'computer science') > 0);
  // Acronym match ('ai' expands to 'artificial intelligence')
  assert.ok(searchRelevance(fullJournal, 'ai') > 0);
});

