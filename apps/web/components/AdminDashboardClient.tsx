"use client";

import { useState } from "react";
import {
  Users,
  Activity,
  RefreshCw,
  UserCheck,
  Check,
  AlertCircle,
  Plus,
  Loader2,
  ShieldPlus,
  Search,
  BookOpen,
  Server,
  CheckCircle2,
  XCircle
} from "lucide-react";
import type { PublicUser, UserRole } from "@rpos/types";
import type { JournalDto, PublisherDto } from "../lib/catalog";
import type { RoleDto } from "../lib/role-actions";
import { 
  updateUserActive, 
  updateUserRoles, 
  checkServicesHealth, 
  type ServiceStatus 
} from "../lib/auth-actions";
import { createJournal } from "../lib/journal-actions";
import { CustomRolesManager } from "./CustomRolesManager";
import { CreateAdminForm } from "./forms/create-admin-form";

interface AdminDashboardClientProps {
  initialUsers: PublicUser[];
  initialHealth: ServiceStatus[];
  initialJournals: JournalDto[];
  initialPublishers: PublisherDto[];
  initialRoles: RoleDto[];
  isSuperadmin: boolean;
}

export function AdminDashboardClient({
  initialUsers,
  initialHealth,
  initialJournals,
  initialPublishers,
  initialRoles,
  isSuperadmin,
}: AdminDashboardClientProps) {
  const [users, setUsers] = useState<PublicUser[]>(initialUsers);
  const [health, setHealth] = useState(initialHealth);
  const [journals, setJournals] = useState<JournalDto[]>(initialJournals);
  const [publishers] = useState<PublisherDto[]>(initialPublishers);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [isHealthPending, setIsHealthPending] = useState(false);

  // New journal form state
  const [newJournalTitle, setNewJournalTitle] = useState("");
  const [newJournalPublisherId, setNewJournalPublisherId] = useState("");
  const [newJournalIssn, setNewJournalIssn] = useState("");
  const [newJournalDesc, setNewJournalDesc] = useState("");
  const [formError, setFormError] = useState<string>();
  const [formSuccess, setFormSuccess] = useState<string>();
  const [isJournalSubmitting, setIsJournalSubmitting] = useState(false);

  // State to track user operations
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [updatingStatusUserId, setUpdatingStatusUserId] = useState<string | null>(null);

  const allAvailableRoles: UserRole[] = ["ADMIN", "PUBLISHER", "EDITOR", "REVIEWER", "AUTHOR", "READER"];

  async function handleRefreshHealth() {
    setIsHealthPending(true);
    try {
      const results = await checkServicesHealth();
      setHealth(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsHealthPending(false);
    }
  }

  async function handleRoleToggle(userId: string, role: UserRole) {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    let nextRoles: UserRole[];
    if (user.roles.includes(role)) {
      if (user.roles.length === 1) return;
      nextRoles = user.roles.filter((r) => r !== role);
    } else {
      nextRoles = [...user.roles, role];
    }

    setSavingUserId(userId);
    const result = await updateUserRoles(userId, nextRoles);
    setSavingUserId(null);

    if (result.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, roles: nextRoles } : u))
      );
    } else {
      alert(result.error || "Failed to update roles");
    }
  }

  async function handleAccountStatus(user: PublicUser) {
    const active = !user.active;
    if (
      !window.confirm(
        `${active ? "Reactivate" : "Suspend"} account for ${user.email}?\n${
          active
            ? "They will regain immediate access to the platform."
            : "They will be barred from signing in until reactivated."
        }`
      )
    ) {
      return;
    }
    setUpdatingStatusUserId(user.id);
    const result = await updateUserActive(user.id, active);
    setUpdatingStatusUserId(null);
    if (result.success) {
      setUsers((current) =>
        current.map((item) => (item.id === user.id ? { ...item, active } : item))
      );
    } else {
      alert(result.error || "Failed to update account status");
    }
  }

  async function handleCreateJournal(e: React.FormEvent) {
    e.preventDefault();
    setFormError(undefined);
    setFormSuccess(undefined);

    if (!newJournalTitle || !newJournalPublisherId) {
      setFormError("Journal title and publisher affiliation are required.");
      return;
    }

    setIsJournalSubmitting(true);

    const result = await createJournal({
      title: newJournalTitle,
      publisherId: newJournalPublisherId,
      issn: newJournalIssn || undefined,
      description: newJournalDesc || undefined,
    });

    setIsJournalSubmitting(false);

    if ("error" in result) {
      setFormError(result.error);
      return;
    }

    setFormSuccess("Journal track initialized successfully!");
    setNewJournalTitle("");
    setNewJournalIssn("");
    setNewJournalDesc("");
    setJournals((prev) => [
      ...prev,
      {
        ...result.journal,
        publisherName:
          result.journal.publisherName ??
          publishers.find((p) => p.id === newJournalPublisherId)?.name,
      },
    ]);
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    if (roleFilter === "ALL") return true;
    return u.roles.includes(roleFilter as UserRole);
  });

  const onlineCount = health.filter((h) => h.status === "online").length;

  return (
    <div className="space-y-8">
      {/* ─── Golden Ratio Overview Stat Widgets ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Registered Accounts */}
        <div className="rpos-card rpos-card-interactive p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Platform Accounts
            </span>
            <div className="size-8 rounded-xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400">
              <Users className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white font-mono">
              {users.length}
            </span>
            <span className="text-xs text-teal-300 font-medium">
              {users.filter((u) => u.active).length} active
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
            <span>{users.filter((u) => u.roles.includes("AUTHOR")).length} Authors</span>
            <span>•</span>
            <span>{users.filter((u) => u.roles.includes("EDITOR")).length} Editors</span>
            <span>•</span>
            <span>{users.filter((u) => u.roles.includes("ADMIN")).length} Admins</span>
          </div>
        </div>

        {/* Stat 2: Active Journals */}
        <div className="rpos-card rpos-card-interactive p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Catalog Tracks
            </span>
            <div className="size-8 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
              <BookOpen className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white font-mono">
              {journals.length}
            </span>
            <span className="text-xs text-cyan-300 font-medium">
              Across {publishers.length} publishers
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Accepting open-access & peer-reviewed papers
          </div>
        </div>

        {/* Stat 3: Microservice Cluster */}
        <div className="rpos-card rpos-card-interactive p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cluster Service Mesh
            </span>
            <div className="size-8 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Server className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white font-mono">
              {onlineCount}/{health.length}
            </span>
            <span className="rpos-badge-emerald text-[10px] py-0 px-2">
              <span className="rpos-beacon-online" />
              100% SLA
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Internal round-trip latency &lt; 15ms
          </div>
        </div>

        {/* Stat 4: Security Policies */}
        <div className="rpos-card rpos-card-interactive p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Custom RBAC Policies
            </span>
            <div className="size-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <ShieldPlus className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white font-mono">
              {initialRoles.length}
            </span>
            <span className="text-xs text-amber-300 font-medium">
              Additive Roles
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Argon2 + Token cryptographic integrity
          </div>
        </div>
      </div>

      {/* ─── Microservices Monitor Grid ─── */}
      <div className="rpos-card rounded-2xl p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 flex-wrap gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Activity className="size-5 text-teal-400" />
              <h2 className="text-lg font-bold tracking-tight text-white">
                Cluster Microservices Health
              </h2>
              <span className="rpos-badge-teal text-[10px]">
                {onlineCount} of {health.length} operational
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Direct daemon health pings across Auth, Submissions, Reviews, Notifications, and AI Gateway.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefreshHealth}
            disabled={isHealthPending}
            className="rpos-btn-secondary text-xs py-2 px-3.5"
          >
            <RefreshCw className={`size-3.5 text-teal-400 ${isHealthPending ? "animate-spin" : ""}`} />
            <span>{isHealthPending ? "Pinging..." : "Refresh Cluster Ping"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {health.map((service) => {
            const isOnline = service.status === "online";
            return (
              <div
                key={service.name}
                className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/50 hover:border-teal-500/30 transition-all flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {service.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                    {service.url}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={isOnline ? "rpos-beacon-online" : "rpos-beacon-offline"} />
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider font-mono ${
                      isOnline ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {service.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── User Role & Account Administration ─── */}
      <div className="rpos-card rounded-2xl p-6 sm:p-7 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <Users className="size-5 text-teal-400" />
              <h2 className="text-lg font-bold tracking-tight text-white">
                User Security & Role Manager
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                ({filteredUsers.length} shown)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Grant or revoke platform privileges across editorial, peer review, and administration tiers.
            </p>
          </div>

          {/* Filter Pills and Search */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
              {["ALL", "ADMIN", "EDITOR", "REVIEWER", "AUTHOR"].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRoleFilter(role)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    roleFilter === role
                      ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rpos-input pl-8 py-1.5 text-xs h-9"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="rpos-table-container">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="rpos-table-header">
                <th className="py-3 px-5">Academic User</th>
                <th className="py-3 px-5 text-center">Account Status</th>
                <th className="py-3 px-5 text-center">Assigned Permission Roles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-slate-500">
                    No users found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="rpos-table-row">
                    <td className="py-3.5 px-5 min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-teal-950/60 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold text-xs uppercase">
                          {user.name ? user.name[0] : "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{user.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-center">
                      <button
                        type="button"
                        onClick={() => handleAccountStatus(user)}
                        disabled={!isSuperadmin || updatingStatusUserId === user.id}
                        title={!isSuperadmin ? "Only a Superadmin can modify account status" : undefined}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          user.active
                            ? "bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60"
                            : "bg-red-950/50 text-red-300 border border-red-500/30 hover:bg-red-900/60"
                        } ${!isSuperadmin || updatingStatusUserId === user.id ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {updatingStatusUserId === user.id ? (
                          <>
                            <Loader2 className="size-3 animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : user.active ? (
                          <>
                            <CheckCircle2 className="size-3 text-emerald-400" />
                            <span>Active (Click to Suspend)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="size-3 text-red-400" />
                            <span>Suspended (Click to Reactivate)</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-5 min-w-[360px]">
                      <div className="flex flex-wrap items-center justify-center gap-1.5">
                        {allAvailableRoles.map((role) => {
                          const isActive = user.roles.includes(role);
                          const isSaving = savingUserId === user.id;
                          const isLocked = role === "ADMIN" && !isSuperadmin;
                          return (
                            <button
                              key={role}
                              type="button"
                              onClick={() => handleRoleToggle(user.id, role)}
                              disabled={isSaving || isLocked}
                              title={isLocked ? "Only a Superadmin can delegate Admin privileges" : undefined}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer active:scale-95 ${
                                isActive
                                  ? "bg-teal-500/20 text-teal-200 border-teal-500/40 shadow-[0_0_10px_rgba(45,212,191,0.2)]"
                                  : "bg-slate-900/70 text-slate-400 border-slate-800 hover:border-teal-500/30 hover:text-slate-200"
                              } ${isSaving || isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              {isActive && <Check className="size-2.5 stroke-[3] text-teal-300" />}
                              <span>{role}</span>
                            </button>
                          );
                        })}
                        {savingUserId === user.id && (
                          <Loader2 className="size-3.5 animate-spin text-teal-400 ml-1" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Catalog Provisioning & Active Entries (Golden Split: 1.618 : 1) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.618fr] gap-6">
        {/* Create Target Journal Track */}
        <div className="rpos-card rpos-card-elevated rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
            <Plus className="size-5 text-teal-400" />
            <div>
              <h3 className="text-base font-bold tracking-tight text-white">
                Initialize Target Journal Track
              </h3>
              <p className="text-xs text-slate-400">
                Provision a new academic catalog entry for submissions.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateJournal} className="space-y-3.5">
            {formError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0 text-red-400" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                <span>{formSuccess}</span>
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="title" className="text-xs font-semibold text-slate-300">
                Journal Title
              </label>
              <input
                id="title"
                placeholder="e.g. International Journal of Quantum Informatics"
                value={newJournalTitle}
                onChange={(e) => setNewJournalTitle(e.target.value)}
                required
                className="rpos-input text-xs py-2"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="publisher" className="text-xs font-semibold text-slate-300">
                Publisher Affiliation
              </label>
              <select
                id="publisher"
                value={newJournalPublisherId}
                onChange={(e) => setNewJournalPublisherId(e.target.value)}
                required
                className="rpos-input text-xs py-2 bg-slate-900 text-slate-200"
              >
                <option value="" disabled>-- Select Publisher --</option>
                {publishers.map((pub) => (
                  <option key={pub.id} value={pub.id}>
                    {pub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="issn" className="text-xs font-semibold text-slate-300">
                ISSN Identifier (Optional)
              </label>
              <input
                id="issn"
                placeholder="e.g. 2770-8912"
                value={newJournalIssn}
                onChange={(e) => setNewJournalIssn(e.target.value)}
                className="rpos-input text-xs py-2 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="desc" className="text-xs font-semibold text-slate-300">
                Aims & Scope Overview
              </label>
              <textarea
                id="desc"
                placeholder="Describe scientific coverage, peer review modality, and indexing targets..."
                value={newJournalDesc}
                onChange={(e) => setNewJournalDesc(e.target.value)}
                rows={3}
                className="rpos-input text-xs py-2 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isJournalSubmitting}
              className="rpos-btn-primary w-full py-2.5 mt-2 text-xs"
            >
              {isJournalSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Provisioning Track...</span>
                </>
              ) : (
                <>
                  <Plus className="size-3.5" />
                  <span>Provision Journal Catalog Track</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Current Active Journals Showcase */}
        <div className="rpos-card rounded-2xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                <BookOpen className="size-4 text-teal-400" />
                Active Journal Catalog
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {journals.length} academic journals accepting submissions & peer review.
              </p>
            </div>
            <span className="rpos-badge-teal text-[10px]">
              Crossref Ready
            </span>
          </div>

          <div className="max-h-[380px] overflow-y-auto space-y-2.5 pr-1">
            {journals.map((journal) => (
              <div
                key={journal.id}
                className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:border-teal-500/30 transition-all space-y-1.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{journal.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {journal.description || "Peer-reviewed scholarly journal"}
                    </p>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-teal-950/60 text-teal-300 border border-teal-500/25 shrink-0 font-mono">
                    {journal.publisherName || "Independent"}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-500 font-mono">
                  <span>ISSN: {journal.issn || "Pending"}</span>
                  <span>•</span>
                  <span>Slug: /{journal.slug}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Custom Additive Roles & Admin Provisioning ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rpos-card rounded-2xl p-6 sm:p-7 lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
            <ShieldPlus className="size-5 text-teal-400" />
            <div>
              <h3 className="text-base font-bold tracking-tight text-white">
                Additive Custom Roles
              </h3>
              <p className="text-xs text-slate-400">
                Grant specific operational permissions on top of default roles.
              </p>
            </div>
          </div>
          <CustomRolesManager initialRoles={initialRoles} users={users} />
        </div>

        {isSuperadmin && (
          <div className="rpos-card rpos-card-elevated rounded-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
              <UserCheck className="size-5 text-teal-400" />
              <div>
                <h3 className="text-base font-bold tracking-tight text-white">
                  Direct Admin Provisioning
                </h3>
                <p className="text-xs text-slate-400">
                  Superadmin-only: Provision a new administrative node user.
                </p>
              </div>
            </div>
            <CreateAdminForm />
          </div>
        )}
      </div>
    </div>
  );
}
