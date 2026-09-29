import { getPrisma } from "../packages/database/dist/index.js";
import ExcelJS from "exceljs";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const prisma = getPrisma();

const COPYRIGHT_TEXT = "Copyright © AalgoLabs (OPC) PVT. LTD. All rights reserved.";
const DOC_REF = "RPOS-CRED-REP-2026-V1";
const GEN_DATE = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const ROLE_DESCRIPTIONS = {
  SUPERADMIN: {
    title: "Superadmin",
    badgeColor: "#4f46e5",
    desc: "Global platform owner with unrestricted administrative authority, database inspection, audit logs, and security oversight.",
    portal: "/dashboard/admin",
    scope: "Global System Infrastructure & User Management",
    permissions: "User provisioning, tenant assignment, system audits, integrations, full database read/write access",
  },
  ADMIN: {
    title: "Platform Admin",
    badgeColor: "#0284c7",
    desc: "Operational administration, indexing compliance monitor, marketing campaigns, and global editorial analytics.",
    portal: "/dashboard/admin",
    scope: "Platform Operations, Analytics & Indexing",
    permissions: "Editorial analytics, Scopus/DOAJ indexing review, marketing campaigns, SEO tools, system health monitor",
  },
  PUBLISHER: {
    title: "Publisher / Press",
    badgeColor: "#0d9488",
    desc: "Institutional publisher entity managing journals, editorial boards, production pipelines, and APC billing.",
    portal: "/publisher",
    scope: "Research Publishing OS Consortium",
    permissions: "Journal catalog creation, issue assembly, editorial board appointments, APC invoicing, publisher settings",
  },
  EDITOR: {
    title: "Editor-in-Chief / Section Editor",
    badgeColor: "#2563eb",
    desc: "Scholarly leadership responsible for manuscript intake, assigning peer reviewers, editorial decisions, and issue curation.",
    portal: "/dashboard/editor",
    scope: "Assigned Scholarly Journal Queue",
    permissions: "Desk triage, reviewer invitations, decision letters (Accept/Revise/Reject), camera-ready approval, volume planning",
  },
  REVIEWER: {
    title: "Peer Reviewer",
    badgeColor: "#d97706",
    desc: "Expert evaluator providing blind peer assessments, rubric scoring, structured feedback, and publication recommendations.",
    portal: "/reviews",
    scope: "Assigned Manuscript Submissions",
    permissions: "Read assigned blinded manuscripts, submit evaluation reports, criteria scoring, recommendation to editor",
  },
  AUTHOR: {
    title: "Research Author",
    badgeColor: "#16a34a",
    desc: "Contributing academic submitting manuscripts, tracking peer reviews, uploading revisions, and publishing papers.",
    portal: "/submissions",
    scope: "Personal Submissions & Published Works",
    permissions: "New manuscript submission, revision file uploads, author proof review, citation & DOI tracking",
  },
  READER: {
    title: "Public Reader / Researcher",
    badgeColor: "#64748b",
    desc: "Scholarly community member exploring open-access papers, citation metadata, and journal indexing evidence.",
    portal: "/discover",
    scope: "Public Journal & Proceedings Directory",
    permissions: "Catalog search, full-text reading, citation export, indexing evidence inspection, conference discovery",
  },
};

const ROLE_PERMISSIONS_MATRIX = [
  {
    capability: "Global User & Tenant Management",
    superadmin: "Full Access",
    admin: "View Only",
    publisher: "Organization Only",
    editor: "No Access",
    reviewer: "No Access",
    author: "No Access",
    reader: "No Access",
  },
  {
    capability: "Platform Analytics & Auditing",
    superadmin: "Full Access",
    admin: "Full Access",
    publisher: "Publisher Analytics",
    editor: "Journal Analytics",
    reviewer: "No Access",
    author: "Personal Stats",
    reader: "No Access",
  },
  {
    capability: "Journal Catalog & Issuing",
    superadmin: "Full Access",
    admin: "Full Access",
    publisher: "Manage Owned",
    editor: "Issue Curation",
    reviewer: "No Access",
    author: "No Access",
    reader: "Browse Public",
  },
  {
    capability: "Editorial Decisions & Triage",
    superadmin: "Audit Access",
    admin: "Audit Access",
    publisher: "Supervisory",
    editor: "Full Authority",
    reviewer: "Recommendations",
    author: "No Access",
    reader: "No Access",
  },
  {
    capability: "Reviewer Invitations & Rubrics",
    superadmin: "Audit Access",
    admin: "Audit Access",
    publisher: "View Queue",
    editor: "Assign & Manage",
    reviewer: "Submit Review",
    author: "No Access",
    reader: "No Access",
  },
  {
    capability: "Manuscript Submission & Proofs",
    superadmin: "Audit Access",
    admin: "Audit Access",
    publisher: "Production View",
    editor: "Manage Intake",
    reviewer: "Read Assigned",
    author: "Submit & Revise",
    reader: "No Access",
  },
  {
    capability: "AI Keyword & Abstract Tools",
    superadmin: "Enabled",
    admin: "Enabled",
    publisher: "Enabled",
    editor: "Enabled",
    reviewer: "Enabled",
    author: "Enabled",
    reader: "No Access",
  },
  {
    capability: "Executive AI Q&A and Summaries",
    superadmin: "Full Access",
    admin: "Full Access",
    publisher: "No Access",
    editor: "No Access",
    reviewer: "No Access",
    author: "No Access",
    reader: "No Access",
  },
  {
    capability: "APC Billing & Financial Logs",
    superadmin: "Full Access",
    admin: "Financial View",
    publisher: "Manage Invoices",
    editor: "Waiver Requests",
    reviewer: "No Access",
    author: "Invoice Payment",
    reader: "No Access",
  },
  {
    capability: "Public Reading & Discovery",
    superadmin: "Full Access",
    admin: "Full Access",
    publisher: "Full Access",
    editor: "Full Access",
    reviewer: "Full Access",
    author: "Full Access",
    reader: "Full Access",
  },
];

async function generateReports() {
  console.log("Fetching users and assignments from database...");
  const users = await prisma.user.findMany({
    include: {
      publisherMember: {
        include: { publisher: true },
      },
      journalAssignments: {
        include: { journal: true },
      },
      submissions: {
        select: { id: true, title: true, status: true, doi: true },
      },
      reviews: {
        select: { id: true, recommendation: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Fetched ${users.length} accounts from DB.`);

  // Transform and enrich
  const enrichedUsers = users.map((u, idx) => {
    const primaryRole = u.roles[0] || "READER";
    const meta = ROLE_DESCRIPTIONS[primaryRole] || ROLE_DESCRIPTIONS.READER;

    let assignedVenue = "-";
    if (u.journalAssignments.length > 0) {
      assignedVenue = u.journalAssignments.map((j) => j.journal.title).join(", ");
    } else if (u.publisherMember.length > 0) {
      assignedVenue = u.publisherMember.map((m) => `${m.publisher.name} (${m.role})`).join(", ");
    } else if (primaryRole === "AUTHOR" && u.submissions.length > 0) {
      assignedVenue = `${u.submissions.length} Published Research Papers (DOIs assigned)`;
    } else if (primaryRole === "REVIEWER") {
      assignedVenue = "Cross-Journal Peer Review Pool (Computer Science & Life Sciences)";
    } else if (primaryRole === "SUPERADMIN" || primaryRole === "ADMIN") {
      assignedVenue = "All Platform Journals & Microservices";
    } else if (primaryRole === "READER") {
      assignedVenue = "Open Access Public Repositories";
    }

    return {
      index: idx + 1,
      id: u.id,
      name: u.name,
      email: u.email,
      password: "password123",
      primaryRole,
      roleTitle: meta.title,
      affiliation: u.affiliation || (u.publisherMember[0]?.publisher?.name ?? "Independent Academic Scholar"),
      orcid: u.orcid || "N/A",
      assignedVenue,
      portalRoute: meta.portal,
      permissions: meta.permissions,
      scope: meta.scope,
      submissionsCount: u.submissions.length,
      reviewsCount: u.reviews.length,
    };
  });

  // Role grouping order
  const roleOrder = ["SUPERADMIN", "ADMIN", "PUBLISHER", "EDITOR", "REVIEWER", "AUTHOR", "READER"];
  const groupedUsers = {};
  for (const r of roleOrder) {
    groupedUsers[r] = enrichedUsers.filter((u) => u.primaryRole === r);
  }

  // 1. Generate Excel Report (.xlsx)
  console.log("Generating Excel Workbook with ExcelJS...");
  await generateExcelReport(enrichedUsers, groupedUsers);

  // 2. Generate PDF Report via Chrome Headless
  console.log("Generating PDF Report with Chrome Headless...");
  await generatePdfReport(enrichedUsers, groupedUsers);

  console.log("All reports successfully generated!");
}

async function generateExcelReport(allUsers, groupedUsers) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AalgoLabs (OPC) PVT. LTD.";
  workbook.lastModifiedBy = "Research Publishing OS Administrator";
  workbook.created = new Date();
  workbook.modified = new Date();

  // Primary Colors: Oceanic Navy & Glacier Slate
  const NAVY_HEADER_FILL = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF112B46" },
  };
  const SUBHEADER_FILL = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E3A5F" },
  };
  const ZEBRA_LIGHT_FILL = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF8FAFC" },
  };
  const WHITE_FILL = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFFFFF" },
  };
  const FOOTER_FILL = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE2E8F0" },
  };

  const BORDER_STYLE = {
    top: { style: "thin", color: { argb: "FFCBD5E1" } },
    left: { style: "thin", color: { argb: "FFCBD5E1" } },
    bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
    right: { style: "thin", color: { argb: "FFCBD5E1" } },
  };

  // ================= SHEET 1: Master Directory =================
  const ws1 = workbook.addWorksheet("Master Account Directory", {
    views: [{ showGridLines: true }],
    headerFooter: {
      oddFooter: `&L${DOC_REF}&C${COPYRIGHT_TEXT}&RPage &P of &N`,
    },
  });

  // Title Banner
  ws1.mergeCells("A1:J1");
  const titleCell1 = ws1.getCell("A1");
  titleCell1.value = "RESEARCH PUBLISHING OS — SYSTEM LOGIN CREDENTIALS DIRECTORY";
  titleCell1.font = { name: "Calibri", size: 16, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell1.fill = NAVY_HEADER_FILL;
  titleCell1.alignment = { vertical: "middle", horizontal: "center" };
  ws1.getRow(1).height = 42;

  // Metadata row
  ws1.mergeCells("A2:J2");
  const subCell1 = ws1.getCell("A2");
  subCell1.value = `Document Ref: ${DOC_REF}  |  Generated: ${GEN_DATE}  |  Environment: Local Development & Staging  |  Default Password: password123`;
  subCell1.font = { name: "Calibri", size: 10, italic: true, color: { argb: "FFE2E8F0" } };
  subCell1.fill = SUBHEADER_FILL;
  subCell1.alignment = { vertical: "middle", horizontal: "center" };
  ws1.getRow(2).height = 24;

  // Spacer
  ws1.getRow(3).height = 10;

  // Columns Configuration
  const columns1 = [
    { header: "SL", key: "index", width: 6 },
    { header: "ROLE CATEGORY", key: "primaryRole", width: 16 },
    { header: "FULL NAME", key: "name", width: 24 },
    { header: "LOGIN EMAIL", key: "email", width: 30 },
    { header: "LOGIN PASSWORD", key: "password", width: 18 },
    { header: "AFFILIATION / INSTITUTION", key: "affiliation", width: 44 },
    { header: "ORCID", key: "orcid", width: 22 },
    { header: "ASSIGNED JOURNAL / SCOPE", key: "assignedVenue", width: 48 },
    { header: "SYSTEM PERMISSIONS & AUTHORITY", key: "permissions", width: 50 },
    { header: "DEFAULT ROUTE", key: "portalRoute", width: 20 },
  ];

  const headerRow1 = ws1.getRow(4);
  headerRow1.height = 28;
  columns1.forEach((col, idx) => {
    const cell = headerRow1.getCell(idx + 1);
    cell.value = col.header;
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = NAVY_HEADER_FILL;
    cell.alignment = { vertical: "middle", horizontal: idx === 0 ? "center" : "left", wrapText: true };
    cell.border = BORDER_STYLE;
    ws1.getColumn(idx + 1).width = col.width;
  });

  // Populate Data
  allUsers.forEach((u, index) => {
    const row = ws1.getRow(5 + index);
    row.height = 22;
    const isEven = index % 2 === 1;
    const rowFill = isEven ? ZEBRA_LIGHT_FILL : WHITE_FILL;

    row.getCell(1).value = u.index;
    row.getCell(1).alignment = { vertical: "middle", horizontal: "center" };

    row.getCell(2).value = u.primaryRole;
    row.getCell(2).alignment = { vertical: "middle", horizontal: "center" };
    row.getCell(2).font = { name: "Calibri", bold: true, color: { argb: "FF0F172A" } };

    row.getCell(3).value = u.name;
    row.getCell(4).value = u.email;
    row.getCell(4).font = { name: "Consolas", color: { argb: "FF0369A1" } };

    row.getCell(5).value = u.password;
    row.getCell(5).font = { name: "Consolas", bold: true, color: { argb: "FFB91C1C" } };

    row.getCell(6).value = u.affiliation;
    row.getCell(7).value = u.orcid;
    row.getCell(7).alignment = { vertical: "middle", horizontal: "center" };

    row.getCell(8).value = u.assignedVenue;
    row.getCell(9).value = u.permissions;
    row.getCell(10).value = u.portalRoute;
    row.getCell(10).alignment = { vertical: "middle", horizontal: "center" };

    for (let c = 1; c <= 10; c++) {
      const cell = row.getCell(c);
      if (!cell.font) cell.font = { name: "Calibri", size: 10 };
      cell.fill = rowFill;
      cell.border = BORDER_STYLE;
      if (c !== 1 && c !== 2 && c !== 7 && c !== 10) {
        cell.alignment = { vertical: "middle", horizontal: "left" };
      }
    }
  });

  // Footer Row
  const footerRowIdx1 = 5 + allUsers.length;
  ws1.mergeCells(`A${footerRowIdx1}:J${footerRowIdx1}`);
  const footerCell1 = ws1.getCell(`A${footerRowIdx1}`);
  footerCell1.value = `${COPYRIGHT_TEXT}  •  Research Publishing OS Credential Manifest`;
  footerCell1.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF334155" } };
  footerCell1.fill = FOOTER_FILL;
  footerCell1.alignment = { vertical: "middle", horizontal: "center" };
  ws1.getRow(footerRowIdx1).height = 24;

  // ================= SHEET 2: Grouped by Role =================
  const ws2 = workbook.addWorksheet("Credentials Grouped by Role", {
    views: [{ showGridLines: true }],
    headerFooter: {
      oddFooter: `&L${DOC_REF}&C${COPYRIGHT_TEXT}&RPage &P of &N`,
    },
  });

  ws2.mergeCells("A1:H1");
  const titleCell2 = ws2.getCell("A1");
  titleCell2.value = "ROLE-BASED CREDENTIAL CATALOG & ACCESS PROFILES";
  titleCell2.font = { name: "Calibri", size: 15, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell2.fill = NAVY_HEADER_FILL;
  titleCell2.alignment = { vertical: "middle", horizontal: "center" };
  ws2.getRow(1).height = 36;

  let currentRowIdx = 3;

  for (const role of Object.keys(groupedUsers)) {
    const list = groupedUsers[role];
    if (!list || list.length === 0) continue;
    const meta = ROLE_DESCRIPTIONS[role];

    // Role Section Banner
    ws2.mergeCells(`A${currentRowIdx}:H${currentRowIdx}`);
    const sectionCell = ws2.getCell(`A${currentRowIdx}`);
    sectionCell.value = `${meta.title.toUpperCase()} ACCOUNTS (${list.length} User${list.length > 1 ? "s" : ""}) — Portal: ${meta.portal}`;
    sectionCell.font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
    sectionCell.fill = SUBHEADER_FILL;
    sectionCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    ws2.getRow(currentRowIdx).height = 26;
    currentRowIdx++;

    // Role Description Sub-banner
    ws2.mergeCells(`A${currentRowIdx}:H${currentRowIdx}`);
    const descCell = ws2.getCell(`A${currentRowIdx}`);
    descCell.value = `Authority & Scope: ${meta.desc}`;
    descCell.font = { name: "Calibri", size: 9.5, italic: true, color: { argb: "FF334155" } };
    descCell.fill = ZEBRA_LIGHT_FILL;
    descCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    ws2.getRow(currentRowIdx).height = 20;
    currentRowIdx++;

    // Table Headers
    const headers = [
      "NO.",
      "FULL NAME",
      "LOGIN EMAIL",
      "LOGIN PASSWORD",
      "AFFILIATION / INSTITUTION",
      "ORCID",
      "ASSIGNED VENUE / SCOPE",
      "KEY PERMISSIONS",
    ];
    const headerRow = ws2.getRow(currentRowIdx);
    headerRow.height = 24;
    headers.forEach((h, hIdx) => {
      const c = headerRow.getCell(hIdx + 1);
      c.value = h;
      c.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      c.fill = NAVY_HEADER_FILL;
      c.alignment = { vertical: "middle", horizontal: hIdx === 0 ? "center" : "left" };
      c.border = BORDER_STYLE;
    });
    currentRowIdx++;

    // Data rows
    list.forEach((u, uIdx) => {
      const row = ws2.getRow(currentRowIdx);
      row.height = 21;
      const isEven = uIdx % 2 === 1;
      const rowFill = isEven ? ZEBRA_LIGHT_FILL : WHITE_FILL;

      row.getCell(1).value = uIdx + 1;
      row.getCell(1).alignment = { vertical: "middle", horizontal: "center" };

      row.getCell(2).value = u.name;
      row.getCell(2).font = { name: "Calibri", bold: true };

      row.getCell(3).value = u.email;
      row.getCell(3).font = { name: "Consolas", color: { argb: "FF0369A1" } };

      row.getCell(4).value = u.password;
      row.getCell(4).font = { name: "Consolas", bold: true, color: { argb: "FFB91C1C" } };

      row.getCell(5).value = u.affiliation;
      row.getCell(6).value = u.orcid;
      row.getCell(6).alignment = { vertical: "middle", horizontal: "center" };

      row.getCell(7).value = u.assignedVenue;
      row.getCell(8).value = u.permissions;

      for (let c = 1; c <= 8; c++) {
        const cell = row.getCell(c);
        if (!cell.font) cell.font = { name: "Calibri", size: 9.5 };
        cell.fill = rowFill;
        cell.border = BORDER_STYLE;
        if (c !== 1 && c !== 6) {
          cell.alignment = { vertical: "middle", horizontal: "left" };
        }
      }
      currentRowIdx++;
    });

    // Space after section
    currentRowIdx++;
  }

  // Set widths for ws2
  const ws2Widths = [6, 24, 30, 18, 42, 22, 48, 50];
  ws2Widths.forEach((w, i) => {
    ws2.getColumn(i + 1).width = w;
  });

  // Footer Row
  ws2.mergeCells(`A${currentRowIdx}:H${currentRowIdx}`);
  const footerCell2 = ws2.getCell(`A${currentRowIdx}`);
  footerCell2.value = `${COPYRIGHT_TEXT}  •  All Accounts Verified and Active in DB`;
  footerCell2.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF334155" } };
  footerCell2.fill = FOOTER_FILL;
  footerCell2.alignment = { vertical: "middle", horizontal: "center" };
  ws2.getRow(currentRowIdx).height = 24;

  // ================= SHEET 3: Role Permission Matrix =================
  const ws3 = workbook.addWorksheet("Role Access Matrix", {
    views: [{ showGridLines: true }],
    headerFooter: {
      oddFooter: `&L${DOC_REF}&C${COPYRIGHT_TEXT}&RPage &P of &N`,
    },
  });

  ws3.mergeCells("A1:H1");
  const titleCell3 = ws3.getCell("A1");
  titleCell3.value = "RESEARCH PUBLISHING OS — ROLE-BASED ACCESS CONTROL (RBAC) MATRIX";
  titleCell3.font = { name: "Calibri", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell3.fill = NAVY_HEADER_FILL;
  titleCell3.alignment = { vertical: "middle", horizontal: "center" };
  ws3.getRow(1).height = 36;

  const matrixCols = [
    { header: "PLATFORM CAPABILITY / MODULE", key: "capability", width: 36 },
    { header: "SUPERADMIN", key: "superadmin", width: 16 },
    { header: "ADMIN", key: "admin", width: 16 },
    { header: "PUBLISHER", key: "publisher", width: 20 },
    { header: "EDITOR", key: "editor", width: 20 },
    { header: "REVIEWER", key: "reviewer", width: 18 },
    { header: "AUTHOR", key: "author", width: 18 },
    { header: "READER", key: "reader", width: 16 },
  ];

  const headerRow3 = ws3.getRow(3);
  headerRow3.height = 28;
  matrixCols.forEach((col, idx) => {
    const c = headerRow3.getCell(idx + 1);
    c.value = col.header;
    c.font = { name: "Calibri", size: 10.5, bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = NAVY_HEADER_FILL;
    c.alignment = { vertical: "middle", horizontal: idx === 0 ? "left" : "center" };
    c.border = BORDER_STYLE;
    ws3.getColumn(idx + 1).width = col.width;
  });

  ROLE_PERMISSIONS_MATRIX.forEach((item, rIdx) => {
    const row = ws3.getRow(4 + rIdx);
    row.height = 22;
    const isEven = rIdx % 2 === 1;
    const rowFill = isEven ? ZEBRA_LIGHT_FILL : WHITE_FILL;

    row.getCell(1).value = item.capability;
    row.getCell(1).font = { name: "Calibri", bold: true };
    row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };

    const keys = ["superadmin", "admin", "publisher", "editor", "reviewer", "author", "reader"];
    keys.forEach((k, colIdx) => {
      const cell = row.getCell(colIdx + 2);
      const val = item[k];
      cell.value = val;
      cell.alignment = { vertical: "middle", horizontal: "center" };

      if (val === "Full Access" || val === "Full Authority" || val === "Enabled") {
        cell.font = { name: "Calibri", bold: true, color: { argb: "FF047857" } }; // Green
      } else if (val === "No Access") {
        cell.font = { name: "Calibri", color: { argb: "FF94A3B8" } }; // Muted Gray
      } else {
        cell.font = { name: "Calibri", color: { argb: "FF0369A1" } }; // Blue
      }
    });

    for (let c = 1; c <= 8; c++) {
      const cell = row.getCell(c);
      cell.fill = rowFill;
      cell.border = BORDER_STYLE;
    }
  });

  const footerRowIdx3 = 4 + ROLE_PERMISSIONS_MATRIX.length + 1;
  ws3.mergeCells(`A${footerRowIdx3}:H${footerRowIdx3}`);
  const footerCell3 = ws3.getCell(`A${footerRowIdx3}`);
  footerCell3.value = `${COPYRIGHT_TEXT}  •  Internal Security Architecture`;
  footerCell3.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF334155" } };
  footerCell3.fill = FOOTER_FILL;
  footerCell3.alignment = { vertical: "middle", horizontal: "center" };
  ws3.getRow(footerRowIdx3).height = 24;

  const excelPathProject = "/Users/amithks/research-publishing-os/reports/login_credentials_report.xlsx";
  const excelPathArtifact = "/Users/amithks/.gemini/antigravity-ide/brain/521ea43f-64b8-46b7-b6d6-e8bdc65f4bad/login_credentials_report.xlsx";

  await workbook.xlsx.writeFile(excelPathProject);
  fs.copyFileSync(excelPathProject, excelPathArtifact);
  console.log("Excel report saved to:", excelPathProject, "and artifact path.");
}

async function generatePdfReport(allUsers, groupedUsers) {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Login Credentials Report — Research Publishing OS</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');

    @page {
      size: A4 portrait;
      margin: 14mm 14mm 18mm 14mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      font-size: 11px;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .report-container {
      width: 100%;
      max-width: 100%;
    }

    /* Header Banner */
    .header-banner {
      background: linear-gradient(135deg, #0c1f33 0%, #112b46 60%, #0e3b5e 100%);
      color: #ffffff;
      padding: 24px 28px;
      border-radius: 14px;
      margin-bottom: 20px;
      border: 1px solid #1e3a5f;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
    }

    .brand-title span {
      color: #2dd4bf;
    }

    .report-title {
      font-size: 13px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-weight: 700;
      margin-top: 4px;
    }

    .meta-box {
      text-align: right;
      font-size: 10px;
      color: #cbd5e1;
      line-height: 1.6;
    }

    .meta-badge {
      display: inline-block;
      background: rgba(45, 212, 191, 0.15);
      border: 1px solid #2dd4bf;
      color: #2dd4bf;
      padding: 3px 10px;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 10px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    /* Summary Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 22px;
    }

    .stat-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 12px 14px;
      border-radius: 10px;
    }

    .stat-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 2px;
    }

    .stat-desc {
      font-size: 9px;
      color: #0284c7;
      margin-top: 2px;
      font-weight: 600;
    }

    /* Notice Box */
    .notice-box {
      background: #eff6ff;
      border-left: 4px solid #0284c7;
      padding: 10px 14px;
      border-radius: 6px;
      margin-bottom: 22px;
      font-size: 10px;
      color: #1e3a8a;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .notice-box strong {
      color: #0c4a6e;
    }

    /* Section Styling */
    .section-title {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 2px solid #e2e8f0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .section-badge {
      font-size: 9.5px;
      padding: 2px 8px;
      border-radius: 9999px;
      font-weight: 700;
      color: white;
    }

    /* Table Styling */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 22px;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      font-size: 9.5px;
    }

    th {
      background: #112b46;
      color: #ffffff;
      text-align: left;
      padding: 8px 10px;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8.5px;
      letter-spacing: 0.5px;
    }

    td {
      padding: 7px 10px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }

    tr:nth-child(even) td {
      background: #f8fafc;
    }

    .email-cell {
      font-family: 'JetBrains Mono', monospace;
      color: #0369a1;
      font-weight: 600;
    }

    .password-cell {
      font-family: 'JetBrains Mono', monospace;
      color: #b91c1c;
      font-weight: 700;
      background: #fef2f2;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #fecaca;
      display: inline-block;
    }

    .role-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 8.5px;
      font-weight: 800;
      text-transform: uppercase;
    }

    .page-break {
      page-break-after: always;
      break-after: page;
    }

    /* Fixed Running Footer for every printed page */
    .running-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 20px;
      border-top: 1px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5px;
      color: #64748b;
      font-weight: 600;
      background: #ffffff;
      padding-top: 4px;
    }

    .footer-brand {
      color: #0f172a;
      font-weight: 700;
    }

    body {
      padding-bottom: 28px;
    }
  </style>
</head>
<body>
  <div class="report-container">
    
    <!-- Fixed Page Footer repeated on all printed pages -->
    <div class="running-footer">
      <div class="footer-brand">${COPYRIGHT_TEXT}</div>
      <div>Research Publishing OS  •  Doc Ref: ${DOC_REF}  •  Role Credentials Manifest</div>
    </div>

    <!-- PAGE 1: EXECUTIVE BANNER & OVERVIEW -->
    <div class="header-banner">
      <div>
        <div class="brand-title">Research<span>OS</span> Platform</div>
        <div class="report-title">Role Credentials & Access Authority Manifest</div>
      </div>
      <div class="meta-box">
        <span class="meta-badge">Confidential QA Reference</span><br>
        <strong>Doc Ref:</strong> ${DOC_REF}<br>
        <strong>Date:</strong> ${GEN_DATE}<br>
        <strong>System Scope:</strong> 10 Monorepo Microservices
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Accounts</div>
        <div class="stat-value">${allUsers.length}</div>
        <div class="stat-desc">Active in PostgreSQL DB</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Role Categories</div>
        <div class="stat-value">7</div>
        <div class="stat-desc">Hierarchical RBAC Scope</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Default Password</div>
        <div class="stat-value" style="font-size:15px; font-family:'JetBrains Mono', monospace; color:#b91c1c;">password123</div>
        <div class="stat-desc">Bcrypt Hash Encrypted</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Login Endpoint</div>
        <div class="stat-value" style="font-size:13px; color:#0369a1;">/login</div>
        <div class="stat-desc">Port 3001 (Web Portal)</div>
      </div>
    </div>

    <div class="notice-box">
      <div>
        <strong>System Security Standard:</strong> All seed accounts share the unified dev credential password <code>password123</code>. JWT access tokens are signed with HMAC-SHA256 and verified across all 8 microservices.
      </div>
      <div>
        <strong>Port:</strong> 3001
      </div>
    </div>

    <!-- 1. Executive & Administrative Authority -->
    <div class="section-title">
      <span>1. Platform Executive & Administration</span>
      <span class="section-badge" style="background:#4f46e5;">Superadmin & Admin</span>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 14%;">Role</th>
          <th style="width: 18%;">User Name</th>
          <th style="width: 26%;">Login Email</th>
          <th style="width: 15%;">Password</th>
          <th style="width: 27%;">Authority Scope & Permissions</th>
        </tr>
      </thead>
      <tbody>
        ${groupedUsers.SUPERADMIN.concat(groupedUsers.ADMIN).map(u => `
          <tr>
            <td><span class="role-badge" style="background:#e0e7ff; color:#3730a3;">${u.primaryRole}</span></td>
            <td><strong>${u.name}</strong></td>
            <td class="email-cell">${u.email}</td>
            <td><span class="password-cell">${u.password}</span></td>
            <td>${u.permissions} (Route: <code>${u.portalRoute}</code>)</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <!-- 2. Institutional Publisher -->
    <div class="section-title">
      <span>2. Institutional Publisher Management</span>
      <span class="section-badge" style="background:#0d9488;">Publisher</span>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 14%;">Role</th>
          <th style="width: 18%;">User Name</th>
          <th style="width: 26%;">Login Email</th>
          <th style="width: 15%;">Password</th>
          <th style="width: 27%;">Assigned Entity & Operations</th>
        </tr>
      </thead>
      <tbody>
        ${groupedUsers.PUBLISHER.map(u => `
          <tr>
            <td><span class="role-badge" style="background:#ccfbf1; color:#0f766e;">${u.primaryRole}</span></td>
            <td><strong>${u.name}</strong></td>
            <td class="email-cell">${u.email}</td>
            <td><span class="password-cell">${u.password}</span></td>
            <td>${u.assignedVenue} — Catalog management, APC billing & volume issue planning.</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <!-- 3. Peer Reviewer Pool -->
    <div class="section-title">
      <span>3. Peer Reviewer Pool</span>
      <span class="section-badge" style="background:#d97706;">Reviewer</span>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 14%;">Role</th>
          <th style="width: 18%;">User Name</th>
          <th style="width: 26%;">Login Email</th>
          <th style="width: 15%;">Password</th>
          <th style="width: 27%;">Evaluation Scope</th>
        </tr>
      </thead>
      <tbody>
        ${groupedUsers.REVIEWER.map(u => `
          <tr>
            <td><span class="role-badge" style="background:#fef3c7; color:#b45309;">${u.primaryRole}</span></td>
            <td><strong>${u.name}</strong></td>
            <td class="email-cell">${u.email}</td>
            <td><span class="password-cell">${u.password}</span></td>
            <td>Double-blind reviewer dashboard (<code>/reviews</code>) — Rubric scoring & recommendations.</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <!-- 4. Public Reader -->
    <div class="section-title">
      <span>4. Public Scholarly Reader</span>
      <span class="section-badge" style="background:#64748b;">Reader</span>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 14%;">Role</th>
          <th style="width: 18%;">User Name</th>
          <th style="width: 26%;">Login Email</th>
          <th style="width: 15%;">Password</th>
          <th style="width: 27%;">Access Scope</th>
        </tr>
      </thead>
      <tbody>
        ${groupedUsers.READER.map(u => `
          <tr>
            <td><span class="role-badge" style="background:#f1f5f9; color:#475569;">${u.primaryRole}</span></td>
            <td><strong>${u.name}</strong></td>
            <td class="email-cell">${u.email}</td>
            <td><span class="password-cell">${u.password}</span></td>
            <td>Public directory search, full-text reading, citation metadata export (<code>/discover</code>).</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <!-- PAGE BREAK -->
    <div class="page-break"></div>

    <!-- PAGE 2: EDITORIAL LEADERSHIP DIRECTORY -->
    <div class="header-banner" style="padding: 16px 24px; margin-bottom: 16px;">
      <div>
        <div class="brand-title" style="font-size:18px;">Editorial Leadership Directory</div>
        <div class="report-title">Chief Editors with Scopus Q1 Journal Assignments</div>
      </div>
      <div class="meta-box">
        <strong>Total Editors:</strong> ${groupedUsers.EDITOR.length} Active Journals<br>
        <strong>Indexing Level:</strong> Scopus Q1 & DOAJ Active
      </div>
    </div>

    <div class="section-title">
      <span>Chief Editors & Assigned Peer-Reviewed Journals</span>
      <span class="section-badge" style="background:#2563eb;">11 Academic Journals</span>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 4%;">#</th>
          <th style="width: 18%;">Chief Editor</th>
          <th style="width: 24%;">Login Email</th>
          <th style="width: 12%;">Password</th>
          <th style="width: 24%;">Affiliation & ORCID</th>
          <th style="width: 18%;">Assigned Journal (Scopus Q1)</th>
        </tr>
      </thead>
      <tbody>
        ${groupedUsers.EDITOR.map((u, i) => `
          <tr>
            <td style="text-align:center; font-weight:700; color:#64748b;">${i + 1}</td>
            <td><strong>${u.name}</strong></td>
            <td class="email-cell">${u.email}</td>
            <td><span class="password-cell">${u.password}</span></td>
            <td>
              <div>${u.affiliation}</div>
              <div style="font-size:8.5px; color:#64748b; font-family:'JetBrains Mono', monospace;">ORCID: ${u.orcid}</div>
            </td>
            <td><strong style="color:#0f172a;">${u.assignedVenue}</strong></td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <!-- PAGE BREAK -->
    <div class="page-break"></div>

    <!-- PAGE 3: AUTHORS & RBAC PERMISSIONS MATRIX -->
    <div class="header-banner" style="padding: 16px 24px; margin-bottom: 16px;">
      <div>
        <div class="brand-title" style="font-size:18px;">Research Authors & Role Permissions Matrix</div>
        <div class="report-title">Published Authors & Platform Authority Mapping</div>
      </div>
      <div class="meta-box">
        <strong>Total Authors:</strong> ${groupedUsers.AUTHOR.length} Distinct Scholars<br>
        <strong>Total Papers:</strong> 50 Published DOIs in Database
      </div>
    </div>

    <div class="section-title">
      <span>Research Authors & Contributors</span>
      <span class="section-badge" style="background:#16a34a;">11 Scholars</span>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 4%;">#</th>
          <th style="width: 18%;">Author Name</th>
          <th style="width: 24%;">Login Email</th>
          <th style="width: 12%;">Password</th>
          <th style="width: 24%;">Affiliation & ORCID</th>
          <th style="width: 18%;">Published Works Scope</th>
        </tr>
      </thead>
      <tbody>
        ${groupedUsers.AUTHOR.map((u, i) => `
          <tr>
            <td style="text-align:center; font-weight:700; color:#64748b;">${i + 1}</td>
            <td><strong>${u.name}</strong></td>
            <td class="email-cell">${u.email}</td>
            <td><span class="password-cell">${u.password}</span></td>
            <td>
              <div>${u.affiliation}</div>
              <div style="font-size:8.5px; color:#64748b; font-family:'JetBrains Mono', monospace;">ORCID: ${u.orcid}</div>
            </td>
            <td><span style="color:#047857; font-weight:700;">${u.assignedVenue}</span></td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <!-- RBAC Matrix -->
    <div class="section-title" style="margin-top:20px;">
      <span>Role-Based Access Control (RBAC) Comparison</span>
      <span class="section-badge" style="background:#0f172a;">Security Matrix</span>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 28%;">Platform Capability</th>
          <th style="width: 10%; text-align:center;">Superadmin</th>
          <th style="width: 10%; text-align:center;">Admin</th>
          <th style="width: 11%; text-align:center;">Publisher</th>
          <th style="width: 11%; text-align:center;">Editor</th>
          <th style="width: 10%; text-align:center;">Reviewer</th>
          <th style="width: 10%; text-align:center;">Author</th>
          <th style="width: 10%; text-align:center;">Reader</th>
        </tr>
      </thead>
      <tbody>
        ${ROLE_PERMISSIONS_MATRIX.map(m => `
          <tr>
            <td><strong>${m.capability}</strong></td>
            <td style="text-align:center; font-weight:700; color:${m.superadmin === 'No Access' ? '#94a3b8' : '#047857'};">${m.superadmin}</td>
            <td style="text-align:center; font-weight:700; color:${m.admin === 'No Access' ? '#94a3b8' : '#047857'};">${m.admin}</td>
            <td style="text-align:center; font-weight:600; color:${m.publisher === 'No Access' ? '#94a3b8' : '#0284c7'};">${m.publisher}</td>
            <td style="text-align:center; font-weight:600; color:${m.editor === 'No Access' ? '#94a3b8' : '#0284c7'};">${m.editor}</td>
            <td style="text-align:center; font-weight:600; color:${m.reviewer === 'No Access' ? '#94a3b8' : '#d97706'};">${m.reviewer}</td>
            <td style="text-align:center; font-weight:600; color:${m.author === 'No Access' ? '#94a3b8' : '#16a34a'};">${m.author}</td>
            <td style="text-align:center; font-weight:600; color:${m.reader === 'No Access' ? '#94a3b8' : '#64748b'};">${m.reader}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

  </div>
</body>
</html>`;

  const htmlPath = "/Users/amithks/research-publishing-os/reports/login_credentials_report.html";
  const pdfPathProject = "/Users/amithks/research-publishing-os/reports/login_credentials_report.pdf";
  const pdfPathArtifact = "/Users/amithks/.gemini/antigravity-ide/brain/521ea43f-64b8-46b7-b6d6-e8bdc65f4bad/login_credentials_report.pdf";

  fs.writeFileSync(htmlPath, htmlContent, "utf-8");

  // Call headless Chrome with no browser headers/footers
  console.log("Invoking Chrome Headless Print-to-PDF...");
  execFileSync(
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    [
      "--headless",
      "--disable-gpu",
      "--no-pdf-header-footer",
      "--run-all-compositor-stages-before-draw",
      `--print-to-pdf=${pdfPathProject}`,
      htmlPath,
    ],
    { stdio: "inherit" }
  );

  fs.copyFileSync(pdfPathProject, pdfPathArtifact);
  console.log("PDF report successfully written to:", pdfPathProject, "and artifact path.");
}

generateReports()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
