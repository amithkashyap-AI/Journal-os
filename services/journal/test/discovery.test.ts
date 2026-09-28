import {afterEach, beforeEach, describe, expect, it} from "vitest";
import {buildApp} from "../src/app.js";
import {InMemoryJournalStore} from "../src/store.js";
import type {FastifyInstance} from "fastify";
import type {UserRole} from "@rpos/types";
describe("journal discovery and assignment", () => {
  let app: FastifyInstance; let store: InMemoryJournalStore; let id: string; let otherId: string;
  beforeEach(async () => {
    store=new InMemoryJournalStore();
    const publisher=await store.createPublisher({name: "Test Press", slug: "test"});
    id=(await store.createJournal({publisherId: publisher.id, title: "Test Journal", slug: "one", issn: "1234-5678"})).id;
    otherId=(await store.createJournal({publisherId: publisher.id, title: "Other Journal", slug: "two"})).id;
    store.setUser({id:"editor",name:"Editor",email:"editor@test.dev",roles:["EDITOR"]});
    app=buildApp({journals:store,jwtSecret:"test-secret-at-least-16",assessJournal: async context => ({text: context.includes("SCOPUS") ? "Source evidence present; quality unknown." : "Insufficient evidence.",model:"test-model"})});
    await app.ready();
  });
  afterEach(async () => {await app.close();});
  const auth=(roles: UserRole[],sub="owner") => ({authorization:`Bearer ${app.jwt.sign({sub,email:`${sub}@test.dev`,roles})}`});
  it("serves journal details anonymously without inventing indexing or quality",async () => {
    const res=await app.inject({method:"GET",url:`/v1/journals/public/${id}`});
    expect(res.statusCode).toBe(200); expect(res.json().evidence).toEqual([]); expect(res.json().assessment).toBeNull();
  });
  it("assigns and revokes an editor for only one journal in the same publisher",async () => {
    const assigned=await app.inject({method:"POST",url:`/v1/journals/${id}/editors`,headers:auth(["SUPERADMIN"]),payload:{email:"editor@test.dev"}});
    expect(assigned.statusCode).toBe(200);
    const headers=auth(["EDITOR"],"editor");
    expect((await app.inject({method:"GET",url:"/v1/journals/managed",headers})).json().journals.map((j: {id:string}) => j.id)).toEqual([id]);
    expect((await app.inject({method:"PATCH",url:`/v1/journals/${id}`,headers,payload:{title:"Updated title"}})).statusCode).toBe(200);
    expect((await app.inject({method:"PATCH",url:`/v1/journals/${otherId}`,headers,payload:{title:"Not allowed"}})).statusCode).toBe(403);
    expect((await app.inject({method:"POST",url:`/v1/journals/${otherId}/editors`,headers,payload:{email:"editor@test.dev"}})).statusCode).toBe(403);
    await app.inject({method:"DELETE",url:`/v1/journals/${id}/editors/editor`,headers:auth(["SUPERADMIN"])});
    expect((await app.inject({method:"PATCH",url:`/v1/journals/${id}`,headers,payload:{title:"Not allowed"}})).statusCode).toBe(403);
  });
  const record=() => ({source:"SCOPUS",status:"ACTIVE",sourceUrl:"https://www.scopus.com/sources",checkedAt:"2026-01-01T00:00:00.000Z",notes:"Matched the source entry using the journal ISSN."});
  it("restricts indexing evidence to owners and official source links",async () => {
    const url=`/v1/journals/${id}/evidence`;
    expect((await app.inject({method:"PUT",url,headers:auth(["EDITOR"],"editor"),payload:record()})).statusCode).toBe(403);
    for(const sourceUrl of ["", "not-a-url", "https://", "https://scopus.com.evil.example/a","javascript:alert(1)","http://scopus.com/a"]){
      expect((await app.inject({method:"PUT",url,headers:auth(["SUPERADMIN"]),payload:{...record(),sourceUrl}})).statusCode).toBe(400);
    }
    expect((await app.inject({method:"PUT",url,headers:auth(["SUPERADMIN"]),payload:record()})).statusCode).toBe(200);
    expect((await app.inject({method:"PUT",url,headers:auth(["SUPERADMIN"]),payload:{...record(), source:"GOOGLE_SCHOLAR", sourceUrl:"https://scholar.google.com/citations?view_op=search_authors"}})).statusCode).toBe(200);
    expect((await app.inject({method:"GET",url:`/v1/journals/public/${id}`})).json().evidence[0]).not.toHaveProperty("verifiedBy");
  });
  it("marks cached AI assessments stale after evidence changes",async () => {
    const headers=auth(["SUPERADMIN"]);
    expect((await app.inject({method:"POST",url:`/v1/journals/${id}/assessment`,headers,payload:{}})).statusCode).toBe(200);
    const details=() => app.inject({method:"GET",url:`/v1/journals/public/${id}`});
    expect((await details()).json().assessment.stale).toBe(false);
    await app.inject({method:"PUT",url:`/v1/journals/${id}/evidence`,headers,payload:record()});
    expect((await details()).json().assessment.stale).toBe(true);
    expect((await app.inject({method:"POST",url:`/v1/journals/${id}/assessment`,payload:{}})).statusCode).toBe(401);
  });
  it.each([
    ["CROSSREF", "https://search.crossref.org/"],
    ["REPEC", "https://ideas.repec.org/"],
    ["ECONPAPERS", "https://econpapers.repec.org/article/"],
  ])("saves and exposes %s evidence with official links only", async (source, sourceUrl) => {
    const url = `/v1/journals/${id}/evidence`;
    const headers = auth(["SUPERADMIN"]);
    const payload = {...record(), source, sourceUrl};
    expect((await app.inject({method: "PUT", url, headers, payload})).statusCode).toBe(200);
    const listing = (await app.inject({method: "GET", url: "/v1/journals/discovery"})).json();
    expect(listing.journals.find((journal: {id: string}) => journal.id === id).indexing).toEqual(expect.arrayContaining([expect.objectContaining({source, status: "ACTIVE"})]));
    const details = (await app.inject({method: "GET", url: `/v1/journals/public/${id}`})).json();
    expect(details.evidence).toEqual(expect.arrayContaining([expect.objectContaining({source, sourceUrl})]));
    for (const invalidUrl of ["not-a-url", sourceUrl.replace(".org", ".org.evil.example"), "https://www.scopus.com/sources"]) {
      expect((await app.inject({method: "PUT", url, headers, payload: {...payload, sourceUrl: invalidUrl}})).statusCode).toBe(400);
    }
    expect((await app.inject({method: "PUT", url, headers, payload: {...payload, quartile: "Q1", indexYear: 2026, subjectCategory: "Economics"}})).statusCode).toBe(400);
  });
  it("validates and exposes reviewed publication policy without reviewer identity", async () => {
    const headers=auth(["SUPERADMIN"]);
    const url=`/v1/journals/${id}/publication`;
    const payload={categories:"Computer Science, Security",feeModel:"FREE",accessModel:"OPEN_ACCESS",publicationWeeks:"12",sourceUrl:"https://publisher.example/policies",checkedAt:"2026-01-01T00:00:00.000Z",notes:"Publisher reports typical submission to publication time."};
    expect((await app.inject({method:"PUT",url,headers:auth(["EDITOR"]),payload})).statusCode).toBe(403);
    for (const patch of [{publicationWeeks:"0"},{publicationWeeks:"-1"},{sourceUrl:"invalid"},{feeModel:"CHEAP"},{checkedAt:"2999-01-01T00:00:00.000Z"}]) {
      expect((await app.inject({method:"PUT",url,headers,payload:{...payload,...patch}})).statusCode).toBe(400);
    }
    await app.inject({method:"POST",url:`/v1/journals/${id}/assessment`,headers,payload:{}});
    expect((await app.inject({method:"PUT",url,headers,payload})).statusCode).toBe(200);
    const details=(await app.inject({method:"GET",url:`/v1/journals/public/${id}`})).json();
    expect(details.publication).toMatchObject({categories:["Computer Science","Security"],feeModel:"FREE",publicationWeeks:12});
    expect(details.publication).not.toHaveProperty("verifiedBy");
    expect(details.assessment.stale).toBe(true);
    const listing=(await app.inject({method:"GET",url:"/v1/journals/discovery"})).json();
    expect(listing.journals.find((j:{id:string})=>j.id===id).publication).toEqual(details.publication);
    expect((await app.inject({method:"PUT",url,headers,payload:{...payload,publicationWeeks:"",feeModel:"UNKNOWN"}})).statusCode).toBe(200);
    expect((await app.inject({method:"GET",url:`/v1/journals/public/${id}`})).json().publication.publicationWeeks).toBeNull();
  });
  it("rejects reversed, incomplete and future Scopus coverage years", async () => {
    const url=`/v1/journals/${id}/evidence`; const headers=auth(["SUPERADMIN"]);
    for (const patch of [{coverageStartYear:2025,coverageEndYear:2020},{coverageStartYear:2020},{coverageStartYear:2020,coverageEndYear:2999}]) {
      expect((await app.inject({method:"PUT",url,headers,payload:{...record(),...patch}})).statusCode).toBe(400);
    }
    expect((await app.inject({method:"PUT",url,headers,payload:{...record(),coverageStartYear:2010,coverageEndYear:2025}})).statusCode).toBe(200);
    expect((await app.inject({method:"GET",url:`/v1/journals/public/${id}`})).json().evidence[0]).toMatchObject({coverageStartYear:2010,coverageEndYear:2025});
  });

});
