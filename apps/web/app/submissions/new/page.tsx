import { redirect } from "next/navigation";
import { SubmissionForm } from "../../../components/forms/submission-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, PageHeader } from "@rpos/ui";
import { getToken } from "../../../lib/api";
import { fetchJournals } from "../../../lib/catalog";

export default async function NewSubmissionPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const journals = await fetchJournals();

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Submission"
        description="Drafts remain private and editable until you formally submit them for peer review."
      />

      <Card className="border-border/40 bg-card/60">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Manuscript Details</CardTitle>
          <CardDescription className="text-xs">
            Provide the required academic metadata for your submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubmissionForm
            journals={journals.map(({ id, title, publisherName }) => ({
              id,
              title,
              publisherName,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
