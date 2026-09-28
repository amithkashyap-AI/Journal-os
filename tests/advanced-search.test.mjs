import {test} from 'node:test';
import assert from 'node:assert/strict';
import {matchesAdvanced, validAdvancedFilters} from '../apps/web/lib/advanced-search.ts';
const filters = {index:'',quartile:'',metricYear:'',coverageYear:'',category:'',fee:'',access:'',maxWeeks:''};
const profile = {categories:['Computer Science','Security'],feeModel:'FREE',accessModel:'OPEN_ACCESS',publicationWeeks:12,sourceUrl:'https://example.org/policy',checkedAt:'2026-01-01',notes:'Reviewed policy'};
const journal = {publication:profile,indexing:[{source:'SCOPUS',status:'ACTIVE',quartile:'Q1',indexYear:2025,subjectCategory:'Computer Science',coverageStartYear:2010,coverageEndYear:2025}]};
test('combines Scopus, year, subject, fee, access and duration filters', () => {
 assert.equal(matchesAdvanced(journal,{...filters,index:'SCOPUS',quartile:'Q1',metricYear:'2025',coverageYear:'2024',category:'computer science',fee:'FREE',access:'OPEN_ACCESS',maxWeeks:'12'}),true);
 for (const patch of [{quartile:'Q2'},{metricYear:'2024'},{coverageYear:'2009'},{coverageYear:'2026'},{category:'Medicine'},{fee:'PAID'},{access:'SUBSCRIPTION'},{maxWeeks:'11'}]) assert.equal(matchesAdvanced(journal,{...filters,...patch}),false);
});
test('unknown is never treated as free, open access or fast publication', () => {
 const unknown={indexing:[]};
 for (const patch of [{fee:'FREE'},{access:'OPEN_ACCESS'},{maxWeeks:'10'}]) assert.equal(matchesAdvanced(unknown,{...filters,...patch}),false);
 assert.equal(matchesAdvanced(unknown,{...filters,fee:'UNKNOWN',access:'UNKNOWN'}),true);
});
test('requires the same evidence record for quartile, metric year and category', () => {
 const mixed={...journal,indexing:[journal.indexing[0],{...journal.indexing[0],quartile:'Q2',subjectCategory:'Medicine'}]};
 assert.equal(matchesAdvanced(mixed,{...filters,quartile:'Q1',category:'Medicine'}),false);
 assert.equal(matchesAdvanced(mixed,{...filters,index:'CROSSREF',quartile:'Q1'}),false);
});
test('discontinued coverage is searchable historically but never as currently active', () => {
 const historical={...journal,indexing:[{...journal.indexing[0],status:'DISCONTINUED'}]};
 assert.equal(matchesAdvanced(historical,{...filters,index:'SCOPUS'}),false);
 assert.equal(matchesAdvanced(historical,{...filters,index:'SCOPUS',coverageYear:'2020'}),true);
});
test('rejects malformed, negative and future numeric filters', () => {
 for (const patch of [{metricYear:'abc'},{coverageYear:'2999'},{maxWeeks:'0'},{maxWeeks:'-5'},{maxWeeks:'521'}]) assert.equal(validAdvancedFilters({...filters,...patch}),false);
});
