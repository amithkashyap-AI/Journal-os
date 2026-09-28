# Research OS — Product Requirements

Updated: 2026-09-24
Status: User requirements with proposed implementation details explicitly identified below.

This document defines the intended product. WORKFLOW_ANALYSIS.md describes the existing code; it is not the target specification. Where they differ, these product requirements take precedence for future development.

## 1. Product purpose

Build a journal discovery, quality assessment, and paper submission application with three primary roles: owner/superuser, editors, and normal users. Visitors can search and evaluate journals without registering. Registration/login is required when someone wants to submit a paper.

## 2. Roles and access

| Capability | Visitor | Normal user | Editor | Superuser / owner |
| --- | --- | --- | --- | --- |
| Search journals and view public journal details | Yes | Yes | Yes | Yes |
| View journal quality analysis and indexing evidence | Yes | Yes | Yes | Yes |
| Submit a paper | Registration/login required | Yes | Yes, as an author | Yes |
| View own submissions and status | No | Yes | Yes | Yes |
| Manage assigned journals | No | No | Yes | All journals |
| Access submissions received by a journal | No | Own submissions only | Assigned journals only | All submissions |
| Manage users, editor assignments, and application settings | No | No | No | Yes |

There can be multiple editors and multiple normal users. The superuser controls the whole application. Editor access must be scoped to explicit journal assignments, including journal editing, submission records, manuscript downloads, and editorial actions. A global editor role alone must not grant access to other journals.

Proposed role mapping: use SUPERADMIN for the owner, EDITOR for editors, and AUTHOR for registered normal users internally. Display the simpler product names in the UI. Existing ADMIN, PUBLISHER, REVIEWER, and READER concepts must not be deleted or migrated without a migration plan; they need not be mandatory roles in the primary user experience.

## 3. Public discovery workflow

1. Visitor opens the public application.
2. Visitor searches journals by name, subject, keywords, or ISSN.
3. Results show journal identity, research scope, available indexing information, and assessment availability.
4. Visitor opens a journal detail page to inspect its scope, publisher, submission information, indexing evidence, and AI quality assessment.
5. Visitor selects “Submit a paper.”
6. If not authenticated, registration/login is required. Preserve the selected journal and return the user to its submission form after authentication.

Proposed search filters: subject, indexing source/status, open access, publication fees when verified, and publisher. Unknown fees or indexing must remain unknown rather than being treated as zero or false.

## 4. Indexing verification and AI quality assessment

The user explicitly requires journal quality checks and indexing information, including Scopus.

### Verified indexing facts

For each supported index, retain:

- Source name and journal identifier, preferably ISSN/eISSN plus source-specific ID.
- Status such as confirmed active, discontinued, not found, or unknown.
- Evidence/source URL, verification timestamp, and coverage dates where available.
- Method and provenance: authorized source integration, source document, or reviewed manual verification.

A journal claiming indexing on its own website is not sufficient evidence of verified coverage. “Not found” is not necessarily “not indexed.” Similarly named journals must not be merged without identity checks. Do not show a “Scopus indexed” badge based only on an AI response.

Scopus is the explicitly requested index. Other possible sources, such as Web of Science and DOAJ, are proposed extensions and require separate source integration decisions. API availability, licensing, and permitted access must be checked during implementation; this document does not claim those integrations already exist.

### AI assessment

AI should explain the journal's available evidence and limitations in readable language. Proposed assessment dimensions include scope relevance, editorial transparency, peer-review policy, publication ethics disclosures, fee transparency, and verified indexing evidence.

Each assessment should include supporting sources, assessment date, missing evidence, and uncertainty. AI output must be labeled as an assessment, not a verified indexing fact or a guarantee of journal quality or acceptance. A numerical quality score is optional and should only be added with an explicit, documented rubric; missing evidence must not be silently scored as poor quality.

Paper-to-journal matching is a possible later enhancement, not an established requirement.

## 5. Registered normal-user workflow

1. Register/login when attempting to submit a paper.
2. Complete the submission form for the selected journal.
3. Upload the manuscript and confirm submission.
4. View only their own submissions, progress, and author-facing decisions.
5. Read revision feedback, upload a revised manuscript, and resubmit when requested.
6. Receive notifications about relevant status changes.

Steps 2–6 retain and refine the existing manuscript workflow as a proposed implementation of the publishing requirement. Co-author details, declarations, required file formats, and journal-specific requirements still need product definition.

## 6. Editor workflow

1. Owner creates or assigns an editor account and grants access to specific journals.
2. Editor sees a dashboard containing only those journals and their received submissions.
3. Editor maintains permitted journal information and submission instructions.
4. Editor evaluates incoming papers, requests revisions, and records editorial decisions.
5. Editor publishes accepted work within their assigned journals.

Steps 3–5 are a proposed interpretation of “access to their journals what they publish.” Owner approval before making a journal public is not yet specified. Editors must not be able to mark external indexing as verified merely by editing a journal's marketing information.

Peer reviewers may remain an optional internal workflow; a separate reviewer account type is not required in the primary three-role product scope.

## 7. Superuser / owner workflow

The owner can manage all journals, users, editor assignments, submission workflows, and application configuration. Proposed administrative tools also include reviewing indexing evidence, triggering or scheduling verification refreshes, reviewing AI assessment inputs/results, and inspecting audit history.

Owner control must not allow external indexing facts to be silently fabricated: a manual verification should retain its evidence and record who made the change.

## 8. Proposed screens

| Area | Screens |
| --- | --- |
| Public | Journal search, results and filters, journal details, indexing evidence, AI quality assessment |
| Authentication | Registration/login with return to selected journal submission |
| Normal user | My submissions, new submission, submission detail and revision feedback |
| Editor | My journals, journal management, journal submission queue, editorial decisions |
| Owner | Application overview, all journals, user management, editor/journal assignments, indexing/AI controls |

## 9. Changes needed in the current project

| Area | Existing code | Required change |
| --- | --- | --- |
| Role experience | Seven base roles and multiple management concepts | Present three primary roles with consistent navigation and permissions |
| Editor scope | Publisher membership scopes much of editorial access | Add explicit journal-level assignments and enforce them throughout |
| Public discovery | Public journal catalog and published-article pages | Build journal-focused search, details, and evidence filters |
| Indexing | No implemented verified Scopus/indexing pipeline found | Add journal identifiers, source-backed indexing records, and verification workflow |
| AI | Abstract/keyword assistance and admin summaries | Add evidence-grounded journal assessment |
| Submission entry | Authenticated submission form | Add public journal → registration/login → selected journal submission flow |
| Author feedback | Review comments primarily shown in staff UI | Add explicit author-facing editorial feedback and revision workflow |
| File access | Global editor file-read grant | Restrict downloads to authorized journals/submissions |
| Owner access | Inconsistent SUPERADMIN transition behavior | Make owner authorization consistent across all application operations |

Proposed new data concepts: JournalEditorAssignment, JournalIndexingEvidence, JournalAssessment, and assessment/source audit records. These are design proposals, not existing database models.

## 10. Implementation sequence and acceptance checks

1. **Roles and journal isolation:** owner can assign multiple editors; each editor can access only assigned journals, submissions, and files; normal users can access only their own private records.
2. **Public journal discovery:** anonymous users can search and inspect journal pages and available quality/indexing evidence.
3. **Registration at submission:** unauthenticated submission redirects to login/register and then returns to the originally selected journal.
4. **Verified indexing:** every verified badge has a source and date; unknown/discontinued states are represented explicitly.
5. **Journal quality AI:** assessments cite supplied evidence, distinguish facts from interpretation, and disclose missing information.
6. **Editorial completion:** authors receive feedback, can revise, and can follow decisions through publication.

No implementation changes are represented as completed by this document. The existing development application does not yet satisfy the full journal discovery and assessment requirement.
