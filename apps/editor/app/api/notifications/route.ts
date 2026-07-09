import { apiFetch, getToken, NOTIFICATION_API } from "../../../lib/api";

export async function GET(): Promise<Response> {
  const token = await getToken();
  if (!token) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const upstream = await apiFetch(NOTIFICATION_API, "/v1/notifications");
  return Response.json(await upstream.json(), { status: upstream.status });
}
