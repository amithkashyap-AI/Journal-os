"use client";

import { useState } from "react";
import Link from "next/link";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { 
  ArrowUpDown, 
  Search, 
  FileText, 
  Clock, 
  ArrowRight
} from "lucide-react";
import type { SubmissionStatus } from "@rpos/types";
import { StatusBadge } from "../StatusBadge";

export interface SubmissionRow {
  id: string;
  title: string;
  status: SubmissionStatus;
  createdAt: string;
  reviewsFiled: number;
  reviewsTotal: number;
}

export function SubmissionsTable({ rows }: { rows: SubmissionRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [titleFilter, setTitleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredData = rows.filter((row) => {
    const matchesTitle = row.title.toLowerCase().includes(titleFilter.toLowerCase());
    if (!matchesTitle) return false;
    if (statusFilter === "ALL") return true;
    return row.status === statusFilter;
  });

  const columns: ColumnDef<SubmissionRow>[] = [
    {
      accessorKey: "id",
      header: "Manuscript Hash",
      cell: ({ row }) => {
        const shortHash = `#MS-${row.original.id.slice(0, 6).toUpperCase()}`;
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0d2545]/80 border border-teal-500/25 font-mono text-[11px] font-semibold text-teal-300 shadow-[0_0_10px_rgba(45,212,191,0.12)]">
            <span className="size-1.5 rounded-full bg-teal-400" />
            {shortHash}
          </span>
        );
      },
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center gap-1 hover:text-teal-300 transition-colors uppercase font-mono tracking-wider text-[11px] font-semibold cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Title & Scientific Topic</span>
          <ArrowUpDown className="size-3 text-teal-400" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="space-y-0.5 max-w-md py-1">
          <Link
            href={`/submissions/${row.original.id}`}
            className="font-bold text-sm text-slate-100 hover:text-teal-300 transition-colors line-clamp-1"
          >
            {row.original.title}
          </Link>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <span>Track: Scholarly Peer Review</span>
            <span>•</span>
            <span className="text-teal-400/90">DOI: Pending Decision</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Protocol Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "reviews",
      header: "Review Rubric Progress",
      cell: ({ row }) => {
        const filed = row.original.reviewsFiled;
        const total = row.original.reviewsTotal || 3;
        const pct = Math.min(100, Math.round((filed / total) * 100));

        return (
          <div className="w-36 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-teal-300 font-semibold">{filed}/{total} Filed</span>
              <span className="text-slate-400">{pct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden border border-teal-500/20">
              <div 
                className="h-full bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400 shadow-[0_0_8px_#2dd4bf] transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center gap-1 hover:text-teal-300 transition-colors uppercase font-mono tracking-wider text-[11px] font-semibold cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span>Submitted</span>
          <ArrowUpDown className="size-3 text-teal-400" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <Clock className="size-3 text-teal-400/70" />
          <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Link
          href={`/submissions/${row.original.id}`}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-teal-300 bg-teal-500/10 border border-teal-500/25 hover:bg-teal-500/20 hover:text-white transition-all shadow-[0_0_10px_rgba(45,212,191,0.1)] group cursor-pointer"
        >
          <span>Open</span>
          <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* ─── Web3 Search & Segmented Filter Bar (100% Responsive) ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Input with Neon Ring */}
        <div className="relative w-full lg:w-80">
          <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter manuscript titles…"
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-[#0b203a]/75 border border-teal-500/20 text-slate-100 placeholder:text-slate-500 backdrop-blur-md outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all"
          />
        </div>

        {/* Filter Pills with Active Neon Highlights */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 sidebar-scroll">
          {[
            { label: "All Papers", value: "ALL" },
            { label: "Under Review", value: "UNDER_REVIEW" },
            { label: "Accepted", value: "ACCEPTED" },
            { label: "Drafts", value: "DRAFT" },
            { label: "Revisions", value: "REVISIONS_REQUESTED" },
          ].map((tab) => {
            const isSelected = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-teal-500/25 text-teal-200 border border-teal-400/50 shadow-[0_0_12px_rgba(45,212,191,0.25)]"
                    : "text-slate-400 hover:text-slate-200 border border-transparent hover:border-teal-500/20 hover:bg-[#0d2545]/40"
                }`}
              >
                {tab.label}
              </button>
            );
          })}

          <span className="text-xs text-slate-400 font-mono ml-auto pl-2 shrink-0">
            {filteredData.length} of {rows.length}
          </span>
        </div>
      </div>

      {/* ─── Desktop Web3 Table View (Visible on md+) ─── */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-teal-500/20 bg-[#0c223e]/70 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-teal-500/15 bg-[#0f2a4c]/70 text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-400">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-5 py-3.5">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-teal-500/10">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="size-6 text-teal-400/60" />
                    <p className="text-sm font-medium">No matching manuscripts found</p>
                    <p className="text-xs text-slate-500 font-mono">Adjust search query or filter pills</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr 
                  key={row.id} 
                  className="hover:bg-teal-500/[0.04] transition-colors group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─── 100% Responsive Mobile Cards View (Visible on < md) ─── */}
      <div className="md:hidden space-y-3">
        {filteredData.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-teal-500/20 bg-[#0c223e]/70 text-slate-400 text-xs font-mono">
            No matching manuscripts found
          </div>
        ) : (
          filteredData.map((row) => {
            const shortHash = `#MS-${row.id.slice(0, 6).toUpperCase()}`;
            const filed = row.reviewsFiled;
            const total = row.reviewsTotal || 3;
            const pct = Math.min(100, Math.round((filed / total) * 100));

            return (
              <div
                key={row.id}
                className="p-4 rounded-2xl border border-teal-500/20 bg-[#0c223e]/85 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.35)] space-y-3"
              >
                {/* Top Row: Hash Pill & Status Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#0d2545] border border-teal-500/25 font-mono text-[11px] font-semibold text-teal-300">
                    <span className="size-1.5 rounded-full bg-teal-400" />
                    {shortHash}
                  </span>
                  <StatusBadge status={row.status} />
                </div>

                {/* Center Title */}
                <div>
                  <Link
                    href={`/submissions/${row.id}`}
                    className="font-bold text-sm text-slate-100 hover:text-teal-300 transition-colors line-clamp-2"
                  >
                    {row.title}
                  </Link>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Peer Review Track • Crossref DOI Pending
                  </p>
                </div>

                {/* Bottom Row: Review Progress + Action */}
                <div className="pt-2 border-t border-teal-500/15 flex items-center justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-teal-300 font-semibold">{filed}/{total} Reports</span>
                      <span className="text-slate-400">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden border border-teal-500/20">
                      <div 
                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 shadow-[0_0_8px_#2dd4bf]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/submissions/${row.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-200 bg-teal-500/20 border border-teal-500/30 hover:bg-teal-500/30 shrink-0"
                  >
                    <span>View</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
