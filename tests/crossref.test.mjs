import {test} from 'node:test';
import assert from 'node:assert/strict';
import {searchCrossrefJournals} from '../apps/web/lib/crossref.ts';

const journal = {title: 'International Journal of Computer Network and Information Security', publisher: 'MECS', ISSN: ['2074-9090', '2074-9104']};
test('searches the full title without a potentially ambiguous abbreviation', async () => {
  const result = await searchCrossrefJournals(`${journal.title}(IJCNIS).`, async url => {
    assert.equal(new URL(url).searchParams.get('query'), journal.title);
    return Response.json({message: {items: [journal]}});
  });
  assert.equal(result[0].title, journal.title);
  assert.deepEqual(result[0].issns, journal.ISSN);
  assert.equal(result[0].sourceUrl, 'https://api.crossref.org/journals/2074-9090');
});
test('looks up exact ISSNs and handles a missing record', async () => {
  const result = await searchCrossrefJournals('20749104', async url => {
    assert.equal(url, 'https://api.crossref.org/journals/2074-9104');
    return Response.json({message: journal});
  });
  assert.equal(result.length, 1);
  assert.deepEqual(await searchCrossrefJournals('0000-0000', async () => new Response(null, {status: 404})), []);
});
test('does not report an upstream outage as zero matches', async () => {
  await assert.rejects(searchCrossrefJournals('IJCNIS', async () => new Response(null, {status: 503})));
  await assert.rejects(searchCrossrefJournals('IJCNIS', async () => Response.json({message: {}})));
});
test('skips empty queries and malformed records', async () => {
  assert.deepEqual(await searchCrossrefJournals('...', async () => {throw new Error('Should not fetch');}), []);
  assert.deepEqual(await searchCrossrefJournals('test', async () => Response.json({message: {items: [null, {}, {title: 'Bad', ISSN: ['invalid']}]}})), []);
});
test('ranks exact titles first and keeps different ISSNs separate even with identical titles', async () => {
  const result = await searchCrossrefJournals(`${journal.title}(IJCNIS)`, async () => Response.json({message: {items: [
    {...journal, title: 'International Journal of Communication Networks and Information Security', ISSN: ['2073-607X']},
    journal,
    {...journal, publisher: 'Another publisher', ISSN: ['1234-5678']},
  ]}}));
  assert.equal(result.length, 3);
  assert.deepEqual(result.map(record => record.match), ['title', 'title', 'similar']);
});
test('groups overlapping ISSNs including duplicate print and online records', async () => {
  const result = await searchCrossrefJournals(journal.title, async () => Response.json({message: {items: [
    {...journal, ISSN: ['2074-9090']},
    {...journal, ISSN: ['2074-9104']},
    {...journal, title: `${journal.title} (IJCNIS)`},
  ]}}));
  assert.equal(result.length, 1);
  assert.deepEqual(result[0].issns.sort(), journal.ISSN);
  assert.equal(result[0].match, 'title');
});
test('normalizes punctuation and ampersands without treating reordered titles as exact', async () => {
  const result = await searchCrossrefJournals('Journal of Computers & Security', async () => Response.json({message: {items: [
    {...journal, title: 'Journal of Computers and Security'},
    {...journal, title: 'Journal of Security and Computers', ISSN: ['1234-5678']},
  ]}}));
  assert.deepEqual(result.map(record => record.match), ['title', 'similar']);
});

test('supports searching conference proceedings and venueType filtering', async () => {
  const conference = {
    DOI: '10.1109/cvpr.2023.0001',
    title: ['Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition'],
    'container-title': ['CVPR 2023 Proceedings'],
    event: { name: 'IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR 2023)', location: 'Vancouver, Canada' },
    ISBN: ['978-1-6654-8742-0'],
    ISSN: ['2575-7075'],
    publisher: 'IEEE',
    type: 'proceedings-article'
  };

  let queriedBibliographic = '';
  const result = await searchCrossrefJournals('CVPR', async (url) => {
    queriedBibliographic = new URL(url).searchParams.get('query.bibliographic') ?? '';
    if (String(url).includes('proceedings-article')) {
      return Response.json({ message: { items: [conference] } });
    }
    return Response.json({ message: { items: [] } });
  }, { venueType: 'conference' });

  assert.equal(result.length, 1);
  assert.equal(result[0].venueType, 'conference');
  assert.equal(result[0].title, 'IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR 2023)');
  assert.equal(result[0].location, 'Vancouver, Canada');
  assert.deepEqual(result[0].isbns, ['978-1-6654-8742-0']);
  assert.equal(queriedBibliographic, 'CVPR Computer Vision and Pattern Recognition');
});


