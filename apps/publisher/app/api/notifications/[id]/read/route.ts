import { apiFetch, getToken, NOTIFICATION_API } from "../../../../../lib/api";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const token = await getToken();
  if (!token) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;
  // apiFetch always sends a JSON content-type; Fastify rejects that with an
  // empty body, so send an explicit empty object.
  const upstream = await apiFetch(NOTIFICATION_API, `/v1/notifications/${id}/read`, {
    method: "POST",
    body: "{}",
  });
  return Response.json(await upstream.json(), { status: upstream.status });
}
