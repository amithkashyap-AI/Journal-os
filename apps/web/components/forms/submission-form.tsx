"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FilePlus } from "lucide-react";
import { createSubmission } from "../../lib/submission-actions";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  journalId: z.string().min(1, "Journal is required"),
  title: z.string().min(3, "Title must be at least 3 characters").max(500),
  abstract: z.string().min(10, "Abstract must be at least 10 characters").max(10000),
  keywords: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function SubmissionForm() {
  const [serverError, setServerError] = useState<string>();
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { journalId: "journal-demo" },
  });

  async function onSubmit(values: FormValues) {
    setServerError(undefined);
    const result = await createSubmission({
      journalId: values.journalId,
      title: values.title,
      abstract: values.abstract,
      keywords: (values.keywords ?? "")
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    });
    if (result?.error) setServerError(result.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="journalId">Journal ID</Label>
        <Input id="journalId" {...field("journalId")} />
        {errors.journalId && <p className="text-sm text-destructive">{errors.journalId.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...field("title")} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="abstract">Abstract</Label>
        <Textarea id="abstract" rows={8} {...field("abstract")} />
        {errors.abstract && <p className="text-sm text-destructive">{errors.abstract.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="keywords">Keywords (comma-separated)</Label>
        <Input id="keywords" placeholder="machine learning, peer review" {...field("keywords")} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        <FilePlus /> {isSubmitting ? "Saving…" : "Save draft"}
      </Button>
    </form>
  );
}
