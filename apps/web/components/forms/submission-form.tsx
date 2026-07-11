"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FilePlus, Sparkles, Check, X } from "lucide-react";
import { createSubmission } from "../../lib/submission-actions";
import { suggestKeywords, tightenAbstract } from "../../lib/ai-actions";
import { Button, Input, Label, NativeSelect, Textarea } from "@rpos/ui";

const formSchema = z.object({
  journalId: z.string().min(1, "Pick a journal"),
  title: z.string().min(3, "Title must be at least 3 characters").max(500),
  abstract: z.string().min(10, "Abstract must be at least 10 characters").max(10000),
  keywords: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export interface JournalOption {
  id: string;
  title: string;
  publisherName?: string;
}

export function SubmissionForm({ journals }: { journals: JournalOption[] }) {
  const [serverError, setServerError] = useState<string>();
  const [isSuggestingKeywords, setIsSuggestingKeywords] = useState(false);
  const [keywordsError, setKeywordsError] = useState<string>();
  const [isTightening, setIsTightening] = useState(false);
  const [tightenError, setTightenError] = useState<string>();
  const [tightenedAbstract, setTightenedAbstract] = useState<string>();
  const {
    register: field,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  async function handleSuggestKeywords() {
    const { title, abstract } = getValues();
    setKeywordsError(undefined);
    if (!title || title.length < 3 || !abstract || abstract.length < 10) {
      setKeywordsError("Add a title and abstract first.");
      return;
    }
    setIsSuggestingKeywords(true);
    const result = await suggestKeywords(title, abstract);
    setIsSuggestingKeywords(false);
    if ("error" in result) {
      setKeywordsError(result.error);
      return;
    }
    setValue("keywords", result.keywords.join(", "));
  }

  async function handleTightenAbstract() {
    const { abstract } = getValues();
    setTightenError(undefined);
    if (!abstract || abstract.length < 10) {
      setTightenError("Write an abstract first.");
      return;
    }
    setIsTightening(true);
    const result = await tightenAbstract(abstract);
    setIsTightening(false);
    if ("error" in result) {
      setTightenError(result.error);
      return;
    }
    setTightenedAbstract(result.abstract);
  }

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

  if (journals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No journals are accepting submissions yet. Ask an administrator to create one.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="journalId">Journal</Label>
        <NativeSelect id="journalId" defaultValue="" {...field("journalId")}>
          <option value="" disabled>
            Select a journal…
          </option>
          {journals.map((journal) => (
            <option key={journal.id} value={journal.id}>
              {journal.title}
              {journal.publisherName ? ` — ${journal.publisherName}` : ""}
            </option>
          ))}
        </NativeSelect>
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isTightening}
          onClick={handleTightenAbstract}
        >
          <Sparkles className="size-3.5" />
          {isTightening ? "Thinking… (can take a moment)" : "Tighten abstract"}
        </Button>
        {tightenError && <p className="text-sm text-destructive">{tightenError}</p>}
        {tightenedAbstract && (
          <div className="space-y-2 rounded-md border border-border/60 bg-secondary/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">AI suggestion</p>
            <p className="text-sm">{tightenedAbstract}</p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setValue("abstract", tightenedAbstract);
                  setTightenedAbstract(undefined);
                }}
              >
                <Check className="size-3.5" /> Accept
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setTightenedAbstract(undefined)}>
                <X className="size-3.5" /> Discard
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="keywords">Keywords (comma-separated)</Label>
        <Input id="keywords" placeholder="machine learning, peer review" {...field("keywords")} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSuggestingKeywords}
          onClick={handleSuggestKeywords}
        >
          <Sparkles className="size-3.5" />
          {isSuggestingKeywords ? "Thinking… (can take a moment)" : "Suggest keywords"}
        </Button>
        {keywordsError && <p className="text-sm text-destructive">{keywordsError}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        <FilePlus /> {isSubmitting ? "Saving…" : "Save draft"}
      </Button>
    </form>
  );
}
