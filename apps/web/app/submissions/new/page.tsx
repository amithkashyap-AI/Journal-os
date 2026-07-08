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

export default async function NewSubmissionPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">New submission</CardTitle>
        <CardDescription>Drafts stay private until you submit them for review</CardDescription>
      </CardHeader>
      <CardContent>
        <SubmissionForm />
      </CardContent>
    </Card>
  );
}
