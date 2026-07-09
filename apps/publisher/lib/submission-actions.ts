"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch, SUBMISSION_API } from "./api";

export async function performSubmissionAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("action") ?? "");

  const res = await apiFetch(SUBMISSION_API, `/v1/submissions/${id}/actions`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
  if (res.status === 401) redirect("/login");

  revalidatePath("/dashboard");
}
