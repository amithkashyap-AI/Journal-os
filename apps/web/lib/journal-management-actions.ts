"use server";
import { revalidatePath } from "next/cache";
import { apiFetch, JOURNAL_API } from "./api";
export async function manageJournal(id: string, action: string, input: Record<string,string>) {
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id)) return {error: "Invalid journal"};
  let method: string; let suffix: string; let body: Record<string,string> | undefined;
  switch(action) {
    case "metadata": method="PATCH"; suffix=""; body={title: input.title ?? "", description: input.description ?? "", ...(input.issn ? {issn: input.issn} : {})}; break;
    case "assign": method="POST"; suffix="/editors"; body={email: input.email ?? ""}; break;
    case "remove": method="DELETE"; suffix=`/editors/${encodeURIComponent(input.userId ?? "")}`; body={}; break;
    case "evidence": method="PUT"; suffix="/evidence"; body=input; break;
    case "publication": method="PUT"; suffix="/publication"; body=input; break;
    case "assessment": method="POST"; suffix="/assessment"; body={}; break;
    default: return {error: "Unknown action"};
  }
  try {
    const response=await apiFetch(JOURNAL_API, `/v1/journals/${id}${suffix}`, {method, ...(body ? {body: JSON.stringify(body)} : {headers: {"content-type": ""}})});
    if(!response.ok) { const data=await response.json(); return {error: data.error === "AI_UNAVAILABLE" ? "AI is unavailable. Check the local Ollama service and try again." : data.error === "USER_MUST_HAVE_EDITOR_ROLE" ? "First give this registered user the Editor role in owner controls." : data.error === "VALIDATION_ERROR" ? "Check the fields: use an HTTPS source, a past verification date, notes of at least 10 characters, and valid years or duration. Quartiles require Scopus, a metric year and subject; coverage requires both years in order." : data.error || "Could not save changes"}; }
    revalidatePath("/journals"); revalidatePath(`/journals/${id}`); revalidatePath("/discover"); revalidatePath(`/discover/${id}`);
    return {success: true};
  } catch { return {error: "Service unavailable. Please try again."}; }
}
