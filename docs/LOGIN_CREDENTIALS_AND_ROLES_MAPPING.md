# Research Publishing OS — Master Login Credentials & Role Mapping Report

> **Document Identifier:** `RPOS-CRED-MAP-2026-V1`  
> **Classification:** Internal Engineering & Operational Specification  
> **Published Date:** September 29, 2026  
> **Copyright Notice:** **Copyright © AalgoLabs (OPC) PVT. LTD. All rights reserved.**  
> **Associated Export Files:**  
> - PDF Report: [`reports/login_credentials_report.pdf`](file:///Users/amithks/research-publishing-os/reports/login_credentials_report.pdf)  
> - Excel Workbook: [`reports/login_credentials_report.xlsx`](file:///Users/amithks/research-publishing-os/reports/login_credentials_report.xlsx)  
> - Web Login Portal: [`http://localhost:3001/login`](http://localhost:3001/login)  

---

## 1. Executive Summary & Authentication Standard

Research Publishing OS (RPOS) incorporates a granular **Role-Based Access Control (RBAC)** architecture that orchestrates the lifecycle of scholarly publishing — from initial manuscript submission through double-blind peer review, copyediting, issue assembly, Scopus/DOAJ compliance verification, and open-access dissemination.

This master document details the complete credential inventory and role-capability mapping for all **26 registered accounts** currently populated in the PostgreSQL database.

### Universal Development Credentials
For local and staging development environments, all user accounts share the following baseline authentication standard:

| Authentication Parameter | Configuration Value |
| :--- | :--- |
| **Default Password** | `password123` |
| **Password Hash Algorithm** | `bcrypt` (10 rounds) |
| **Session Architecture** | JWT Bearer Token / HTTP-only secure cookie |
| **Primary Login Endpoint** | `http://localhost:3001/login` |
| **Public Landing & Catalog** | `http://localhost:3002` |
| **Backend GraphQL / REST Gateway** | `http://localhost:4000` |

---

## 2. Role Hierarchy & Workflow Architecture

The 7 system roles reflect standard scholarly publishing workflows and institutional publishing standards.

```mermaid
flowchart TD
    SA["SUPERADMIN\n(Global Owner & Infra)"]
    ADM["ADMIN\n(Platform & Indexing Ops)"]
    PUB["PUBLISHER\n(Press Consortium & Finances)"]
    ED["EDITOR\n(Editorial Leadership & Decisions)"]
    REV["REVIEWER\n(Double-Blind Peer Review)"]
    AUT["AUTHOR\n(Submissions & Revisions)"]
    REA["READER\n(Open Access Discovery)"]

    SA -->|Provisions & Audits| ADM
    SA -->|Oversees| PUB
    ADM -->|Monitors Compliance| PUB
    PUB -->|Appoints & Configures| ED
    ED -->|Assigns Manuscripts| REV
    AUT -->|Submits Manuscripts| ED
    REV -->|Submits Rubric & Advice| ED
    ED -->|Accepts & Issues| PUB
    PUB -->|Disseminates Papers| REA
```

---

## 3. Role-Based Access Control (RBAC) Permissions Matrix

The matrix below illustrates the precise permissions distributed across system features for each role:

| Capability / Microservice | Superadmin | Platform Admin | Publisher | Editor | Peer Reviewer | Author | Public Reader |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Global User & Tenant Management** | **Full Access** | View Only | Organization Only | No Access | No Access | No Access | No Access |
| **Platform Analytics & Auditing** | **Full Access** | **Full Access** | Publisher Level | Journal Level | No Access | Personal Stats | No Access |
| **Journal Catalog & Issue Assembly** | **Full Access** | **Full Access** | Manage Owned | Issue Curation | No Access | No Access | Browse Public |
| **Editorial Decisions & Desk Triage** | Audit Access | Audit Access | Supervisory | **Full Authority** | Recommendations | No Access | No Access |
| **Reviewer Invitations & Rubrics** | Audit Access | Audit Access | View Queue | **Assign & Manage** | Submit Review | No Access | No Access |
| **Manuscript Submission & Proofs** | Audit Access | Audit Access | Production View | Manage Intake | Read Assigned | **Submit & Revise** | No Access |
| **AI Keyword & Semantic Abstract Tools** | **Enabled** | **Enabled** | **Enabled** | **Enabled** | **Enabled** | **Enabled** | No Access |
| **Executive AI Q&A and Summaries** | **Full Access** | **Full Access** | No Access | No Access | No Access | No Access | No Access |
| **APC Billing & Financial Invoicing** | **Full Access** | Financial View | **Manage Invoices** | Waiver Requests | No Access | Invoice Payment | No Access |
| **Public Reading & Citation Export** | **Full Access** | **Full Access** | **Full Access** | **Full Access** | **Full Access** | **Full Access** | **Full Access** |

---

## 4. Master Credentials Directory by Role

### 4.1. Superadmin (`SUPERADMIN`)
Platform superuser with unrestricted root authority, audit trail visibility, tenant orchestration, and infrastructure oversight.

- **Portal Route:** `/dashboard/admin`
- **Scope:** Global System Infrastructure, Multi-Tenant Database, Microservices Gateway

| Index | Name | Email Address | Password | Affiliation / Organization | ORCID iD | Scope & Assignments |
| :---: | :--- | :--- | :---: | :--- | :---: | :--- |
| **01** | Superadmin User | `superadmin@rpos.dev` | `password123` | Research Publishing OS Consortium | *None* | Root System Administrator, All Tenants |

---

### 4.2. Platform Administrator (`ADMIN`)
Operational administrator managing Scopus/DOAJ compliance indexing, platform health monitoring, user verifications, and global publishing analytics.

- **Portal Route:** `/dashboard/admin`
- **Scope:** Platform Operations, Indexing Compliance, Global Editorial Analytics

| Index | Name | Email Address | Password | Affiliation / Organization | ORCID iD | Scope & Assignments |
| :---: | :--- | :--- | :---: | :--- | :---: | :--- |
| **02** | Admin User | `admin@rpos.dev` | `password123` | Research Publishing OS Consortium | *None* | Compliance Auditor & Indexing Monitor |

---

### 4.3. Publisher (`PUBLISHER`)
Institutional press administrator responsible for journal portfolio creation, volume and issue releases, editorial appointments, and Article Processing Charge (APC) accounts.

- **Portal Route:** `/publisher`
- **Scope:** Research Publishing OS Consortium (11 Journals, 10 Conferences)

| Index | Name | Email Address | Password | Affiliation / Organization | ORCID iD | Scope & Assignments |
| :---: | :--- | :--- | :---: | :--- | :---: | :--- |
| **03** | Publisher User | `publisher@rpos.dev` | `password123` | Research Publishing OS Consortium | *None* | Press Executive, Journal Portfolios & Invoicing |

---

### 4.4. Editors-in-Chief & Section Editors (`EDITOR`)
Scholarly editors with full authority over journal queues, manuscript desk screening, reviewer assignments, blind evaluation reviews, and publication decisions (Accept, Revise, Reject).

- **Portal Route:** `/dashboard/editor`
- **Scope:** Assigned Scholarly Journals and Peer Review Queues

| Index | Name | Email Address | Password | Affiliation / Institution | ORCID iD | Assigned Journal Venue |
| :---: | :--- | :--- | :---: | :--- | :---: | :--- |
| **04** | Editor User | `editor@rpos.dev` | `password123` | RPOS Editorial Board | *None* | *Journal of Demonstrable Results* |
| **05** | Dr. Sarah Chen | `editor.ai@rpos.dev` | `password123` | Massachusetts Institute of Technology (MIT), CSAIL | `0000-0002-1825-0097` | *International Journal of Artificial Intelligence & Autonomous Systems* |
| **06** | Prof. Marcus Vance | `editor.quantum@rpos.dev` | `password123` | University of Oxford, Quantum Information Institute | `0000-0002-3914-1142` | *Journal of Quantum Information and Computing* |
| **07** | Dr. Elena Rostova | `editor.biotech@rpos.dev` | `password123` | Harvard Medical School, Center for Genomic Medicine | `0000-0003-4512-8821` | *Applied Biotechnology and Genomic Medicine* |
| **08** | Prof. David Tanaka | `editor.energy@rpos.dev` | `password123` | Kyoto University, Clean Energy Technologies Lab | `0000-0001-9234-7710` | *Transactions on Sustainable Clean Energy & Grid Systems* |
| **09** | Dr. Aisha Al-Mansoor | `editor.cyber@rpos.dev` | `password123` | Stanford University, Cryptography & Network Security | `0000-0002-8845-6619` | *Journal of Advanced Cybersecurity & Cryptography* |
| **10** | Prof. Julian Weber | `editor.neuro@rpos.dev` | `password123` | ETH Zurich, Cognitive Systems & Brain Research Lab | `0000-0003-1289-5503` | *Neural Computing and Cognitive Brain Research* |
| **11** | Dr. Priya Nair | `editor.nano@rpos.dev` | `password123` | University of Cambridge, Nanomaterials Engineering | `0000-0001-6734-2291` | *Journal of Nanomaterials and Molecular Engineering* |
| **12** | Prof. Liam O'Connor | `editor.ling@rpos.dev` | `password123` | University of Edinburgh, Speech and Language Tech | `0000-0002-7719-3384` | *Computational Linguistics & Natural Language Intelligence* |
| **13** | Dr. Sofia Morales | `editor.climate@rpos.dev` | `password123` | UC Berkeley, Climate Systems & Informatics Hub | `0000-0003-6621-9940` | *Frontiers in Climate Systems & Environmental Informatics* |
| **14** | Prof. Henrik Lindqvist | `editor.biomed@rpos.dev` | `password123` | Karolinska Institute, Dept. of Biomedical Engineering | `0000-0001-5582-4417` | *Biomedical Engineering & Translational Healthcare* |

---

### 4.5. Peer Reviewers (`REVIEWER`)
Expert domain evaluators providing double-blind manuscript critiques, rubric ratings, confidential editor notes, and publication advice.

- **Portal Route:** `/reviews`
- **Scope:** Assigned Blinded Manuscript Submissions

| Index | Name | Email Address | Password | Affiliation / Institution | ORCID iD | Assigned Review Pool |
| :---: | :--- | :--- | :---: | :--- | :---: | :--- |
| **15** | Reviewer User | `reviewer@rpos.dev` | `password123` | RPOS Peer Reviewer Roster | *None* | Cross-Journal Peer Review Pool (Computer Science & Life Sciences) |

---

### 4.6. Research Authors (`AUTHOR`)
Contributing scholars who prepare and submit research manuscripts, track peer review milestones, upload camera-ready revisions, and manage publication DOIs.

- **Portal Route:** `/submissions`
- **Scope:** Personal Research Portfolios & Published Articles (50+ active published articles in DB)

| Index | Name | Email Address | Password | Affiliation / University | ORCID iD | Published Papers in System |
| :---: | :--- | :--- | :---: | :--- | :---: | :---: |
| **16** | Author User | `author@rpos.dev` | `password123` | Institute of Advanced Computer Science, MIT | `0000-0002-1825-0001` | **6 Papers** (DOIs registered) |
| **17** | Dr. Wei Chen | `author.chen@rpos.dev` | `password123` | Stanford Artificial Intelligence Laboratory | `0000-0002-9912-3451` | **5 Papers** (AI & Autonomous Systems) |
| **18** | Dr. Emily Smith | `author.smith@rpos.dev` | `password123` | Oxford Quantum Physics & Nanotechnology Centre | `0000-0003-8821-4562` | **5 Papers** (Quantum Information) |
| **19** | Prof. Rajesh Patel | `author.patel@rpos.dev` | `password123` | Harvard Medical School, Department of Genetics | `0000-0001-7734-5673` | **5 Papers** (Genomic Medicine) |
| **20** | Dr. Min-Jun Kim | `author.kim@rpos.dev` | `password123` | KAIST Energy and Environmental Engineering Institute | `0000-0002-6645-6784` | **5 Papers** (Sustainable Clean Energy) |
| **21** | Prof. Carlos Garcia | `author.garcia@rpos.dev` | `password123` | UC Berkeley Cryptography and Security Group | `0000-0003-5556-7895` | **5 Papers** (Cybersecurity & Cryptography) |
| **22** | Dr. Claire Dupont | `author.dupont@rpos.dev` | `password123` | Sorbonne University, Neuroimaging & Cognition Unit | `0000-0001-4467-8906` | **5 Papers** (Cognitive Brain Research) |
| **23** | Prof. Hans Müller | `author.muller@rpos.dev` | `password123` | Max Planck Institute for Polymer Research | `0000-0002-3378-9017` | **5 Papers** (Nanomaterials & Polymers) |
| **24** | Dr. Kenji Tanaka | `author.tanaka@rpos.dev` | `password123` | University of Tokyo, Dept. of Information Science | `0000-0003-2289-0128` | **5 Papers** (Computational Linguistics) |
| **25** | Prof. Ana Novak | `author.novak@rpos.dev` | `password123` | University of Toronto, Computer Science & Earth Science | `0000-0001-1190-1239` | **5 Papers** (Climate Informatics) |

---

### 4.7. Public Reader (`READER`)
Scholarly community consumers with access to full-text open-access publications, journal indexation proofs, and citation exports.

- **Portal Route:** `/discover`
- **Scope:** Public Catalog, Open-Access Articles & Conference Proceedings

| Index | Name | Email Address | Password | Affiliation / Organization | ORCID iD | Assigned Scope |
| :---: | :--- | :--- | :---: | :--- | :---: | :--- |
| **26** | Reader User | `reader@rpos.dev` | `password123` | Open Science Community Scholar | *None* | Public Repositories & Citation Discovery |

---

## 5. Quick Copy-Paste Authentication Sheet

Use this table for quick copy-pasting of email and password credentials during user journey testing:

| # | Role | Display Name | Login Email | Password | Target Portal |
| :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | `SUPERADMIN` | Superadmin User | `superadmin@rpos.dev` | `password123` | `http://localhost:3001/dashboard/admin` |
| 2 | `ADMIN` | Admin User | `admin@rpos.dev` | `password123` | `http://localhost:3001/dashboard/admin` |
| 3 | `PUBLISHER` | Publisher User | `publisher@rpos.dev` | `password123` | `http://localhost:3001/publisher` |
| 4 | `EDITOR` | Editor User | `editor@rpos.dev` | `password123` | `http://localhost:3001/dashboard/editor` |
| 5 | `EDITOR` | Dr. Sarah Chen | `editor.ai@rpos.dev` | `password123` | `http://localhost:3001/dashboard/editor` |
| 6 | `EDITOR` | Prof. Marcus Vance | `editor.quantum@rpos.dev` | `password123` | `http://localhost:3001/dashboard/editor` |
| 7 | `EDITOR` | Dr. Elena Rostova | `editor.biotech@rpos.dev` | `password123` | `http://localhost:3001/dashboard/editor` |
| 8 | `EDITOR` | Prof. David Tanaka | `editor.energy@rpos.dev` | `password123` | `http://localhost:3001/dashboard/editor` |
| 9 | `EDITOR` | Dr. Aisha Al-Mansoor | `editor.cyber@rpos.dev` | `password123` | `http://localhost:3001/dashboard/editor` |
| 10 | `EDITOR` | Prof. Julian Weber | `editor.neuro@rpos.dev` | `password123` | `http://localhost:3001/dashboard/editor` |
| 11 | `EDITOR` | Dr. Priya Nair | `editor.nano@rpos.dev` | `password123` | `http://localhost:3001/dashboard/editor` |
| 12 | `EDITOR` | Prof. Liam O'Connor | `editor.ling@rpos.dev` | `password123` | `http://localhost:3001/dashboard/editor` |
| 13 | `EDITOR` | Dr. Sofia Morales | `editor.climate@rpos.dev` | `password123` | `http://localhost:3001/dashboard/editor` |
| 14 | `EDITOR` | Prof. Henrik Lindqvist | `editor.biomed@rpos.dev` | `password123` | `http://localhost:3001/dashboard/editor` |
| 15 | `REVIEWER` | Reviewer User | `reviewer@rpos.dev` | `password123` | `http://localhost:3001/reviews` |
| 16 | `AUTHOR` | Author User | `author@rpos.dev` | `password123` | `http://localhost:3001/submissions` |
| 17 | `AUTHOR` | Dr. Wei Chen | `author.chen@rpos.dev` | `password123` | `http://localhost:3001/submissions` |
| 18 | `AUTHOR` | Dr. Emily Smith | `author.smith@rpos.dev` | `password123` | `http://localhost:3001/submissions` |
| 19 | `AUTHOR` | Prof. Rajesh Patel | `author.patel@rpos.dev` | `password123` | `http://localhost:3001/submissions` |
| 20 | `AUTHOR` | Dr. Min-Jun Kim | `author.kim@rpos.dev` | `password123` | `http://localhost:3001/submissions` |
| 21 | `AUTHOR` | Prof. Carlos Garcia | `author.garcia@rpos.dev` | `password123` | `http://localhost:3001/submissions` |
| 22 | `AUTHOR` | Dr. Claire Dupont | `author.dupont@rpos.dev` | `password123` | `http://localhost:3001/submissions` |
| 23 | `AUTHOR` | Prof. Hans Müller | `author.muller@rpos.dev` | `password123` | `http://localhost:3001/submissions` |
| 24 | `AUTHOR` | Dr. Kenji Tanaka | `author.tanaka@rpos.dev` | `password123` | `http://localhost:3001/submissions` |
| 25 | `AUTHOR` | Prof. Ana Novak | `author.novak@rpos.dev` | `password123` | `http://localhost:3001/submissions` |
| 26 | `READER` | Reader User | `reader@rpos.dev` | `password123` | `http://localhost:3001/discover` |

---

## 6. How to Run / Re-Generate Credential Reports

To update or re-generate the PDF and Excel documents directly from the live database:

```bash
# Set PostgreSQL database URL and PATH
export PATH="/opt/homebrew/bin:$PATH"
export DATABASE_URL="postgresql://rpos:rpos_dev_password@localhost:5432/rpos?schema=public"

# Run automated report generation script
node scripts/generate-credential-reports.mjs
```

Generated outputs will be saved to:
1. `reports/login_credentials_report.xlsx` — 3-sheet formatted Excel workbook
2. `reports/login_credentials_report.pdf` — Publication-ready styled PDF
3. `reports/login_credentials_report.html` — Clean HTML source
4. `docs/LOGIN_CREDENTIALS_AND_ROLES_MAPPING.md` — Markdown reference guide

---

## 7. Legal Notice & Copyright

> **CONFIDENTIALITY & PROPRIETARY NOTICE**  
> This specification, the contained login credentials, RBAC architecture, and associated documentation are the intellectual property of **AalgoLabs (OPC) PVT. LTD.**  
> Any unauthorized distribution, duplication, or reproduction without prior written authorization is strictly prohibited.  
>  
> **Copyright © AalgoLabs (OPC) PVT. LTD. All rights reserved.**
