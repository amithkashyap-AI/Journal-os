import { redirect } from "next/navigation";
import { SubmissionForm } from "../../../components/forms/submission-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { getToken } from "../../../lib/api";
import { fetchJournals } from "../../../lib/catalog";

export default async function NewSubmissionPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const journals = await fetchJournals();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">New submission</CardTitle>
        <CardDescription>Drafts stay private until you submit them for review</CardDescription>
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
  );
}
