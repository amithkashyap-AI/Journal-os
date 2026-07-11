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
} from "lucide-react";
import type { PublicUser, UserRole } from "@rpos/types";
import type { JournalDto, PublisherDto } from "../lib/catalog";
import { updateUserRoles, checkServicesHealth, type ServiceStatus } from "../lib/auth-actions";
import { createJournal } from "../lib/journal-actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Label, NativeSelect, Textarea } from "@rpos/ui";

interface AdminDashboardClientProps {
  initialUsers: PublicUser[];
  initialHealth: ServiceStatus[];
  initialJournals: JournalDto[];
  initialPublishers: PublisherDto[];
}

export function AdminDashboardClient({
  initialUsers,
  initialHealth,
  initialJournals,
  initialPublishers,
}: AdminDashboardClientProps) {
  const [users, setUsers] = useState<PublicUser[]>(initialUsers);
  const [health, setHealth] = useState(initialHealth);
  const [journals, setJournals] = useState<JournalDto[]>(initialJournals);
  const [publishers] = useState<PublisherDto[]>(initialPublishers);

  const [searchTerm, setSearchTerm] = useState("");
  const [isHealthPending, setIsHealthPending] = useState(false);

  // New journal form state
  const [newJournalTitle, setNewJournalTitle] = useState("");
  const [newJournalPublisherId, setNewJournalPublisherId] = useState("");
  const [newJournalIssn, setNewJournalIssn] = useState("");
  const [newJournalDesc, setNewJournalDesc] = useState("");
  const [formError, setFormError] = useState<string>();
  const [formSuccess, setFormSuccess] = useState<string>();
  const [isJournalSubmitting, setIsJournalSubmitting] = useState(false);

  // State to track user roles currently being saved
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

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
      // Don't allow removing author if it's the last role
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

  async function handleCreateJournal(e: React.FormEvent) {
    e.preventDefault();
    setFormError(undefined);
    setFormSuccess(undefined);

    if (!newJournalTitle || !newJournalPublisherId) {
      setFormError("Title and Publisher are required.");
      return;
    }

    setIsJournalSubmitting(true);

    // The server derives the slug from the title (see @rpos/utils slugify()).
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

    setFormSuccess("Journal created successfully!");
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

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Overview Dashboard Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Registered Users</CardDescription>
            <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">{users.length}</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 text-xs text-muted-foreground">
            Platform accounts active across all portal spaces.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Catalog Journals</CardDescription>
            <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">{journals.length}</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 text-xs text-muted-foreground">
            Academic publishing tracks currently accepting submissions.
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">System Cluster Health</CardDescription>
            <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">
              {health.filter((h) => h.status === "online").length}/{health.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 text-xs text-muted-foreground">
            Microservices operating normally within the workspace cluster.
          </CardContent>
        </Card>
      </div>

      {/* Services Health Monitor */}
      <Card className="border-border/40">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/20">
          <div>
            <CardTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Activity className="size-5 text-primary" /> Microservices Monitor
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Live status ping of all system processes.
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer gap-2 transition-all active:scale-95"
            onClick={handleRefreshHealth}
            disabled={isHealthPending}
          >
            <RefreshCw className={`size-3.5 ${isHealthPending ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {health.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between p-3.5 rounded-lg border border-border/40 bg-background/50 hover:bg-background/80 transition-colors duration-150"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{service.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    {service.url}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`relative flex size-2.5`}>
                    {service.status === "online" && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    )}
                    <span
                      className={`relative inline-flex size-2.5 rounded-full ${
                        service.status === "online" ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    ></span>
                  </span>
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider ${
                      service.status === "online" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: User Admin & Catalog Add */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Account Controls */}
        <Card className="border-border/40 lg:col-span-2">
          <CardHeader className="pb-4 border-b border-border/20">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
                  <Users className="size-5 text-primary" /> User Role Manager
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Manage security access settings across the publishing ecosystem.
                </CardDescription>
              </div>
              <div className="w-full sm:w-60">
                <Input
                  placeholder="Search user name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 px-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/20 text-xs font-semibold text-muted-foreground uppercase bg-secondary/30">
                    <th className="py-3 px-6">User Info</th>
                    <th className="py-3 px-6 text-center">Active Permission Roles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-sm">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-8 text-center text-muted-foreground">
                        No users found matching "{searchTerm}"
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-secondary/10 transition-colors">
                        <td className="py-4 px-6 min-w-[200px] whitespace-nowrap">
                          <p className="font-semibold text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 font-mono">{user.email}</p>
                        </td>
                        <td className="py-4 px-6 min-w-[360px]">
                          <div className="flex flex-nowrap items-center justify-center gap-1.5 whitespace-nowrap">
                            {allAvailableRoles.map((role) => {
                              const isActive = user.roles.includes(role);
                              const isSaving = savingUserId === user.id;
                              return (
                                <button
                                  key={role}
                                  type="button"
                                  onClick={() => handleRoleToggle(user.id, role)}
                                  disabled={isSaving}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none active:scale-95 ${
                                    isActive
                                      ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                                      : "bg-background text-muted-foreground border-border/40 hover:bg-secondary/40"
                                  } ${isSaving ? "opacity-50 pointer-events-none" : ""}`}
                                >
                                  {isActive && <Check className="size-3 shrink-0" />}
                                  {role}
                                </button>
                              );
                            })}
                            {savingUserId === user.id && (
                              <Loader2 className="size-3.5 animate-spin text-muted-foreground ml-1" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Catalog Control Area */}
        <div className="space-y-6">
          {/* New Journal Form */}
          <Card className="border-border/40">
            <CardHeader className="pb-4 border-b border-border/20">
              <CardTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
                <Plus className="size-5 text-primary" /> Create Journal
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Add a new academic target journal catalog track.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCreateJournal} className="space-y-4">
                {formError && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2 animate-fade-in">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
                {formSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-fade-in">
                    <UserCheck className="size-4 shrink-0" />
                    <span>{formSuccess}</span>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-semibold">Journal Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Journal of Quantum Physics"
                    value={newJournalTitle}
                    onChange={(e) => setNewJournalTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="publisher" className="text-xs font-semibold">Publisher Affiliation</Label>
                  <NativeSelect
                    id="publisher"
                    value={newJournalPublisherId}
                    onChange={(e) => setNewJournalPublisherId(e.target.value)}
                    required
                  >
                    <option value="" disabled>-- Select Publisher --</option>
                    {publishers.map((pub) => (
                      <option key={pub.id} value={pub.id}>
                        {pub.name}
                      </option>
                    ))}
                  </NativeSelect>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="issn" className="text-xs font-semibold">ISSN (Optional)</Label>
                  <Input
                    id="issn"
                    placeholder="e.g. 1234-567X"
                    value={newJournalIssn}
                    onChange={(e) => setNewJournalIssn(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="desc" className="text-xs font-semibold">Short Description</Label>
                  <Textarea
                    id="desc"
                    placeholder="A brief scope of publishing coverage..."
                    value={newJournalDesc}
                    onChange={(e) => setNewJournalDesc(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full cursor-pointer" disabled={isJournalSubmitting}>
                  {isJournalSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-1" />
                      Creating...
                    </>
                  ) : (
                    "Create Journal"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* List of Journals */}
          <Card className="border-border/40">
            <CardHeader className="pb-4 border-b border-border/20">
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
                Current Catalog Entries
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 max-h-[220px] overflow-y-auto">
              <ul className="divide-y divide-border/20">
                {journals.map((journal) => (
                  <li key={journal.id} className="py-2.5 first:pt-0 last:pb-0">
                    <p className="font-semibold text-foreground text-xs">{journal.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground font-mono">
                        issn: {journal.issn || "N/A"}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-secondary text-secondary-foreground rounded">
                        {journal.publisherName || "Demo Publisher"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
