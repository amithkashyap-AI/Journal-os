"use client";

import { useRef, useState, useTransition } from "react";
import { Upload } from "lucide-react";
import { uploadManuscript } from "../../lib/file-actions";
import { Button, Input } from "@rpos/ui";

export function ManuscriptUpload({
  submissionId,
  hasManuscript,
}: {
  submissionId: string;
  hasManuscript: boolean;
}) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(undefined);
    startTransition(async () => {
      const result = await uploadManuscript(formData);
      if (result?.error) setError(result.error);
      else formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-2">
      <input type="hidden" name="submissionId" value={submissionId} />
      <div className="flex items-center gap-2">
        <Input
          type="file"
          name="file"
          accept=".pdf,.doc,.docx,.txt"
          className="max-w-xs"
          required
        />
        <Button type="submit" variant="secondary" disabled={pending}>
          <Upload />{" "}
          {pending ? "Uploading…" : hasManuscript ? "Replace manuscript" : "Upload manuscript"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
