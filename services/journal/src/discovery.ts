import { createHash } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { AppOptions } from "./app.js";

const sourceHosts = {
  SCOPUS: ["scopus.com", "elsevier.com"],
  WEB_OF_SCIENCE: ["clarivate.com", "webofscience.com"],
  DOAJ: ["doaj.org"],
  GOOGLE_SCHOLAR: ["scholar.google.com"],
  CROSSREF: ["crossref.org"],
  REPEC: ["repec.org"],
  ECONPAPERS: ["econpapers.repec.org"],
};
const quartileSchema = z.preprocess(value => value === "" ? undefined : value, z.enum(["Q1", "Q2", "Q3", "Q4"]).optional());
const yearSchema = z.preprocess(value => value === "" || value == null ? null : Number(value), z.number().int().min(1800).max(new Date().getFullYear()).nullable());
const profileSchema = z.object({
  categories: z.preprocess(value => typeof value === "string" ? value.split(",").map(item => item.trim()).filter(Boolean) : value, z.array(z.string().trim().min(1).max(100)).max(20)),
  feeModel: z.enum(["FREE", "PAID", "CONDITIONAL", "UNKNOWN"]),
  accessModel: z.enum(["OPEN_ACCESS", "HYBRID", "SUBSCRIPTION", "UNKNOWN"]),
  publicationWeeks: z.preprocess(value => value === "" || value == null ? null : Number(value), z.number().int().min(1).max(520).nullable()),
  sourceUrl: z.string().url().max(2000).refine(value => { try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; } }),
  checkedAt: z.string().datetime().refine(value => new Date(value).getTime() <= Date.now(), "Verification cannot be in the future"),
  notes: z.string().trim().min(10).max(4000),
});
const evidenceSchema = z.object({
  source: z.enum(["SCOPUS", "WEB_OF_SCIENCE", "DOAJ", "GOOGLE_SCHOLAR", "CROSSREF", "REPEC", "ECONPAPERS"]),
  status: z.enum(["ACTIVE", "DISCONTINUED", "NOT_FOUND", "UNKNOWN"]),
  quartile: quartileSchema,
  coverageStartYear: yearSchema,
  coverageEndYear: yearSchema,
  indexYear: z.preprocess(value => value === "" || value === undefined ? undefined : Number(value), z.number().int().min(1996).max(new Date().getFullYear()).optional()),
  subjectCategory: z.preprocess(value => value === "" ? undefined : value, z.string().max(250).optional()),
  sourceUrl: z.string().url().max(2000),
  checkedAt: z.string().datetime().refine(value => new Date(value).getTime() <= Date.now(), "Verification cannot be in the future"),
  notes: z.string().min(10).max(4000),
}).refine(data => {
  try {
    const url = new URL(data.sourceUrl);
    return url.protocol === "https:" && !url.username && !url.password && sourceHosts[data.source].some(host => url.hostname === host || url.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}, "Use an HTTPS evidence link from the index's official website").superRefine((data, context) => {
  if ((data.coverageStartYear === null) !== (data.coverageEndYear === null) || (data.coverageStartYear !== null && data.coverageEndYear !== null && data.coverageStartYear > data.coverageEndYear)) context.addIssue({code: z.ZodIssueCode.custom, path: ["coverageEndYear"], message: "Record both coverage years in chronological order"});
  if (data.coverageStartYear !== null && data.source !== "SCOPUS") context.addIssue({code: z.ZodIssueCode.custom, path: ["coverageStartYear"], message: "Coverage years apply only to Scopus evidence"});
  if (data.quartile && data.source !== "SCOPUS") context.addIssue({code: z.ZodIssueCode.custom, path: ["quartile"], message: "Quartiles apply only to Scopus evidence"});
  if (data.quartile && (!data.indexYear || !data.subjectCategory)) context.addIssue({code: z.ZodIssueCode.custom, path: ["quartile"], message: "Scopus quartiles require the source year and subject category"});
});
const hash = (context: string) => createHash("sha256").update(context).digest("hex");

export function registerDiscoveryRoutes(app: FastifyInstance, options: AppOptions) {
  const store = options.journals;
  const isOwner = (roles: string[]) => roles.includes("SUPERADMIN") || roles.includes("ADMIN");
  async function publicProfile(id: string) {
    const profile = await store.getPublicationProfile(id);
    return profile ? (({verifiedBy: _verifiedBy, ...record}) => record)(profile) : null;
  }
  async function snapshot(id: string) {
    const journal = await store.findJournalById(id);
    if (!journal) return null;
    const evidence = (await store.listEvidence(id)).map(({verifiedBy: _verifiedBy, ...record}) => record);
    const publication = await publicProfile(id);
    const context = JSON.stringify({journal, evidence, publication});
    return {journal, evidence, publication, context};
  }
  app.get("/v1/journals/discovery", async () => {
    if (store.listDiscoveryJournals) {
      return { journals: await store.listDiscoveryJournals() };
    }
    const journals = await store.listJournals();
    return {
      journals: await Promise.all(
        journals.map(async (journal) => ({
          ...journal,
          publication: await publicProfile(journal.id),
          indexing: (await store.listEvidence(journal.id)).map(
            ({ source, status, quartile, indexYear, subjectCategory, checkedAt, coverageStartYear, coverageEndYear }) => ({
              source,
              status,
              quartile,
              indexYear,
              subjectCategory,
              checkedAt,
              coverageStartYear,
              coverageEndYear,
            }),
          ),
        })),
      ),
    };
  });
  app.get<{Params: {id: string}}>("/v1/journals/public/:id", async (request, reply) => {
    const data = await snapshot(request.params.id);
    if (!data) return reply.code(404).send({error: "NOT_FOUND"});
    const assessment = await store.getAssessment(request.params.id);
    const editors = await store.listEditors(request.params.id);
    return {journal: data.journal, evidence: data.evidence, publication: data.publication,
      assessment: assessment ? {...assessment, stale: assessment.evidenceHash !== hash(data.context)} : null,
      editors};
  });
  app.get("/v1/journals/managed", {onRequest: [app.authenticate]}, async (request) => {
    const all = await store.listJournals();
    if (isOwner(request.user.roles)) return {journals: all};
    if (!request.user.roles.includes("EDITOR")) return {journals: []};
    const flags = await Promise.all(all.map(j => store.isJournalEditor(j.id, request.user.sub)));
    return {journals: all.filter((_, i) => flags[i])};
  });
  app.get<{Params: {id: string}}>("/v1/journals/:id/editors", {onRequest: [app.authenticate]}, async (request, reply) => {
    if (!isOwner(request.user.roles)) return reply.code(403).send({error: "FORBIDDEN"});
    if (!await store.findJournalById(request.params.id)) return reply.code(404).send({error: "NOT_FOUND"});
    return {editors: await store.listEditors(request.params.id)};
  });
  app.post<{Params: {id: string}}>("/v1/journals/:id/editors", {onRequest: [app.authenticate]}, async (request, reply) => {
    if (!isOwner(request.user.roles)) return reply.code(403).send({error: "FORBIDDEN"});
    const parsed = z.object({email: z.string().email()}).safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({error: "VALIDATION_ERROR"});
    if (!await store.findJournalById(request.params.id)) return reply.code(404).send({error: "NOT_FOUND"});
    const user = await store.findUserByEmail(parsed.data.email.toLowerCase());
    if (!user || !user.roles.includes("EDITOR")) return reply.code(409).send({error: "USER_MUST_HAVE_EDITOR_ROLE"});
    await store.assignEditor(request.params.id, user.id);
    return {editors: await store.listEditors(request.params.id)};
  });
  app.delete<{Params: {id: string; userId: string}}>("/v1/journals/:id/editors/:userId", {onRequest: [app.authenticate]}, async (request, reply) => {
    if (!isOwner(request.user.roles)) return reply.code(403).send({error: "FORBIDDEN"});
    await store.removeEditor(request.params.id, request.params.userId);
    return {ok: true};
  });
  app.put<{Params: {id: string}}>("/v1/journals/:id/evidence", {onRequest: [app.authenticate]}, async (request, reply) => {
    if (!isOwner(request.user.roles)) return reply.code(403).send({error: "FORBIDDEN"});
    const parsed = evidenceSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({error: "VALIDATION_ERROR", details: parsed.error.flatten()});
    const journal = await store.findJournalById(request.params.id);
    if (!journal) return reply.code(404).send({error: "NOT_FOUND"});
    if (parsed.data.status === "ACTIVE" && !journal.issn) return reply.code(409).send({error: "ISSN_REQUIRED_FOR_VERIFICATION"});
    await store.saveEvidence({...parsed.data, checkedAt: new Date(parsed.data.checkedAt), journalId: journal.id, verifiedBy: request.user.sub});
    return {ok: true};
  });
  app.put<{Params: {id: string}}>("/v1/journals/:id/publication", {onRequest: [app.authenticate]}, async (request, reply) => {
    if (!isOwner(request.user.roles)) return reply.code(403).send({error: "FORBIDDEN"});
    const parsed = profileSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({error: "VALIDATION_ERROR", details: parsed.error.flatten()});
    if (!await store.findJournalById(request.params.id)) return reply.code(404).send({error: "NOT_FOUND"});
    await store.savePublicationProfile({...parsed.data, journalId: request.params.id, checkedAt: new Date(parsed.data.checkedAt), verifiedBy: request.user.sub});
    return {ok: true};
  });
  // Generation is an owner action. Visitors read cached assessments without
  // allocating arbitrary model requests. No user-supplied URL is fetched.
  const generating = new Set<string>();
  app.post<{Params: {id: string}}>("/v1/journals/:id/assessment", {onRequest: [app.authenticate]}, async (request, reply) => {
    if (!isOwner(request.user.roles)) return reply.code(403).send({error: "FORBIDDEN"});
    const data = await snapshot(request.params.id);
    if (!data) return reply.code(404).send({error: "NOT_FOUND"});
    if (!options.assessJournal) return reply.code(503).send({error: "AI_UNAVAILABLE"});
    if (generating.has(request.params.id)) return reply.code(409).send({error: "ASSESSMENT_IN_PROGRESS"});
    generating.add(request.params.id);
    try {
      const result = await options.assessJournal(data.context);
      await store.saveAssessment({journalId: request.params.id, ...result, evidenceHash: hash(data.context), generatedAt: new Date()});
      return {ok: true};
    } catch {
      return reply.code(503).send({error: "AI_UNAVAILABLE"});
    } finally { generating.delete(request.params.id); }
  });
}
