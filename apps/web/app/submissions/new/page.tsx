import { redirect } from "next/navigation";
import { getToken } from "../../../lib/api";
import { createSubmission } from "../../../lib/submission-actions";

export default async function NewSubmissionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const token = await getToken();
  if (!token) redirect("/login");
  const { error } = await searchParams;

  return (
    <div className="container">
      <div className="card">
        <h1>New submission</h1>
        {error === "validation" && (
          <p className="error">
            Check your input: title min 3 chars, abstract min 10 chars, journal required.
          </p>
        )}
        {error === "failed" && <p className="error">Submission failed — please try again.</p>}
        <form action={createSubmission}>
          <div className="form-field">
            <label htmlFor="journalId">Journal ID</label>
            <input id="journalId" name="journalId" required defaultValue="journal-demo" />
          </div>
          <div className="form-field">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" required minLength={3} maxLength={500} />
          </div>
          <div className="form-field">
            <label htmlFor="abstract">Abstract</label>
            <textarea id="abstract" name="abstract" required minLength={10} rows={8} />
          </div>
          <div className="form-field">
            <label htmlFor="keywords">Keywords (comma-separated)</label>
            <input id="keywords" name="keywords" placeholder="machine learning, peer review" />
          </div>
          <button type="submit" className="btn">
            Save draft
          </button>
        </form>
      </div>
    </div>
  );
}
