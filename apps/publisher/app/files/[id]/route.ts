import { redirect } from "next/navigation";
import { FILE_API, getToken } from "../../../lib/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const token = await getToken();
  if (!token) redirect("/login");

  const { id } = await params;
  const upstream = await fetch(`${FILE_API}/v1/files/${id}`, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!upstream.ok) {
    return new Response("Not found", { status: upstream.status });
  }

  const headers = new Headers();
  for (const name of ["content-type", "content-length", "content-disposition"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(upstream.body, { headers });
}
