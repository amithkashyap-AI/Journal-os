"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BookPlus, Building2 } from "lucide-react";
import { createJournal, createPublisher } from "../../lib/journal-actions";
import type { PublisherDto } from "../../lib/catalog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { NativeSelect } from "../ui/select";
import { Textarea } from "../ui/textarea";

const publisherFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  website: z.string().url("Must be a full URL").optional().or(z.literal("")),
});

type PublisherFormValues = z.infer<typeof publisherFormSchema>;

export function PublisherForm() {
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
    if (result?.error) setServerError(result.error);
    else reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="publisher-name">Publisher name</Label>
        <Input id="publisher-name" {...field("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="publisher-website">Website (optional)</Label>
        <Input id="publisher-website" placeholder="https://example.org" {...field("website")} />
        {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
      </div>
      <Button type="submit" variant="secondary" disabled={isSubmitting}>
        <Building2 /> {isSubmitting ? "Creating…" : "Create publisher"}
      </Button>
    </form>
  );
}

const journalFormSchema = z.object({
  publisherId: z.string().min(1, "Pick a publisher"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  issn: z
    .string()
    .regex(/^\d{4}-\d{3}[\dX]$/, "ISSN must look like 1234-567X")
    .optional()
    .or(z.literal("")),
  description: z.string().max(2000).optional(),
});

type JournalFormValues = z.infer<typeof journalFormSchema>;

export function JournalForm({ publishers }: { publishers: PublisherDto[] }) {
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
    if ("error" in result) setServerError(result.error);
    else reset();
  }

  if (publishers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Create a publisher first, then add journals.</p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="journal-publisher">Publisher</Label>
        <NativeSelect id="journal-publisher" defaultValue="" {...field("publisherId")}>
          <option value="" disabled>
            Select a publisher…
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
