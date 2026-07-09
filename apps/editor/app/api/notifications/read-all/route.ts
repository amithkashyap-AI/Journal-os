import { apiFetch, getToken, NOTIFICATION_API } from "../../../../lib/api";

export async function POST(): Promise<Response> {
  const token = await getToken();
  if (!token) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });

  // apiFetch always sends a JSON content-type; Fastify rejects that with an
  // empty body, so send an explicit empty object.
  const upstream = await apiFetch(NOTIFICATION_API, "/v1/notifications/read-all", {
    method: "POST",
    body: "{}",
  });
  return Response.json(await upstream.json(), { status: upstream.status });
}
