"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, BookPlus, Send, Inbox, BadgeCheck } from "lucide-react";
import { EmptyState } from "@rpos/ui";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { NativeSelect } from "./ui/select";
import { Textarea } from "./ui/textarea";
import type { JournalDto, PublisherDto } from "../lib/catalog";
import { createJournal, createPublisher } from "../lib/journal-actions";
import { performSubmissionAction } from "../lib/submission-actions";

interface ReadyToPublish {
  id: string;
  title: string;
  journalTitle: string;
}

interface RecentlyPublished {
  id: string;
  title: string;
  journalTitle: string;
  doi: string;
}

const publisherFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  website: z.string().url("Must be a full URL").optional().or(z.literal("")),
});
type PublisherFormValues = z.infer<typeof publisherFormSchema>;

const journalFormSchema = z.object({
  publisherId: z.string().min(1, "Pick an organization"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  issn: z
    .string()
    .regex(/^\d{4}-\d{3}[\dX]$/, "ISSN must look like 1234-567X")
    .optional()
    .or(z.literal("")),
  description: z.string().max(2000).optional(),
});
type JournalFormValues = z.infer<typeof journalFormSchema>;

function CreatePublisherCard({ onCreated }: { onCreated: (publisher: PublisherDto) => void }) {
  const [serverError, setServerError] = useState<string>();
  const {
    register: field,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PublisherFormValues>({ resolver: zodResolver(publisherFormSchema) });

  async function onSubmit(values: PublisherFormValues) {
    setServerError(undefined);
    const result = await createPublisher({
      name: values.name,
      website: values.website || undefined,
    });
    if ("error" in result) {
      setServerError(result.error);
      return;
    }
    reset();
    onCreated(result.publisher);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="size-5 text-primary" /> Create your organization
        </CardTitle>
        <CardDescription>
          Register your publishing organization to start adding journals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="org-name">Organization name</Label>
            <Input id="org-name" placeholder="e.g. Acta Press" {...field("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="org-website">Website (optional)</Label>
            <Input id="org-website" placeholder="https://example.org" {...field("website")} />
            {errors.website && (
              <p className="text-sm text-destructive">{errors.website.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            <Building2 /> {isSubmitting ? "Creating…" : "Create organization"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function CreateJournalForm({
  publishers,
  onCreated,
}: {
  publishers: PublisherDto[];
  onCreated: (journal: JournalDto) => void;
}) {
  const [serverError, setServerError] = useState<string>();
  const {
    register: field,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JournalFormValues>({ resolver: zodResolver(journalFormSchema) });

  async function onSubmit(values: JournalFormValues) {
    setServerError(undefined);
    const result = await createJournal({
      publisherId: values.publisherId,
      title: values.title,
      issn: values.issn || undefined,
      description: values.description || undefined,
    });
    if ("error" in result) {
      setServerError(result.error);
      return;
    }
    reset();
    const publisherName = publishers.find((p) => p.id === result.journal.publisherId)?.name;
    onCreated({ ...result.journal, publisherName: result.journal.publisherName ?? publisherName });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="journal-publisher">Organization</Label>
        <NativeSelect id="journal-publisher" defaultValue="" {...field("publisherId")}>
          <option value="" disabled>
            Select an organization…
          </option>
          {publishers.map((publisher) => (
            <option key={publisher.id} value={publisher.id}>
              {publisher.name}
            </option>
          ))}
        </NativeSelect>
        {errors.publisherId && (
          <p className="text-sm text-destructive">{errors.publisherId.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="journal-title">Journal title</Label>
        <Input id="journal-title" {...field("title")} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="journal-issn">ISSN (optional)</Label>
        <Input id="journal-issn" placeholder="1234-567X" {...field("issn")} />
        {errors.issn && <p className="text-sm text-destructive">{errors.issn.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="journal-description">Description (optional)</Label>
        <Textarea id="journal-description" rows={3} {...field("description")} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        <BookPlus /> {isSubmitting ? "Creating…" : "Create journal"}
      </Button>
    </form>
  );
}

export function PublisherDashboardClient({
  initialPublishers,
  initialJournals,
  initialReadyToPublish,
  initialRecentlyPublished,
}: {
  initialPublishers: PublisherDto[];
  initialJournals: JournalDto[];
  initialReadyToPublish: ReadyToPublish[];
  initialRecentlyPublished: RecentlyPublished[];
}) {
  const [publishers, setPublishers] = useState(initialPublishers);
  const [journals, setJournals] = useState(initialJournals);

  if (publishers.length === 0) {
    return (
      <div className="max-w-lg">
        <CreatePublisherCard onCreated={(publisher) => setPublishers((prev) => [...prev, publisher])} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Send className="size-5 text-primary" /> Ready to publish
            </CardTitle>
            <CardDescription>
              Accepted manuscripts across your journals, awaiting publication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {initialReadyToPublish.length === 0 ? (
              <EmptyState
                icon={<Inbox className="size-6" />}
                title="Nothing to publish yet"
                description="Accepted manuscripts will show up here once an editor approves them."
              />
            ) : (
              <ul className="divide-y divide-border/40">
                {initialReadyToPublish.map((submission) => (
                  <li
                    key={submission.id}
                    className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-sm">{submission.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {submission.journalTitle}
                      </p>
                    </div>
                    <form action={performSubmissionAction}>
                      <input type="hidden" name="id" value={submission.id} />
                      <input type="hidden" name="action" value="publish" />
                      <Button type="submit" size="sm">
                        Publish
                      </Button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {initialRecentlyPublished.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BadgeCheck className="size-5 text-primary" /> Recently published
              </CardTitle>
              <CardDescription>Live manuscripts with an assigned DOI.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border/40">
                {initialRecentlyPublished.map((submission) => (
                  <li key={submission.id} className="py-3.5 first:pt-0 last:pb-0">
                    <p className="truncate font-medium text-sm">{submission.title}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {submission.journalTitle}
                      </span>
                      <a
                        href={`https://doi.org/${submission.doi}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {submission.doi}
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your journals</CardTitle>
            <CardDescription>{journals.length} journal(s) across your organization(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {journals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No journals yet — create one using the form on the right.
              </p>
            ) : (
              <ul className="divide-y divide-border/40">
                {journals.map((journal) => (
                  <li key={journal.id} className="py-3 first:pt-0 last:pb-0">
                    <p className="font-medium text-sm">{journal.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground font-mono">
                        issn: {journal.issn ?? "N/A"}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded">
                        {journal.publisherName}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {publishers.map((publisher) => (
                <li key={publisher.id} className="text-sm">
                  <p className="font-medium">{publisher.name}</p>
                  {publisher.website && (
                    <p className="text-xs text-muted-foreground truncate">{publisher.website}</p>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookPlus className="size-4 text-primary" /> Add a journal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CreateJournalForm
              publishers={publishers}
              onCreated={(journal) => setJournals((prev) => [...prev, journal])}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
