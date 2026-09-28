import { apiFetch, getToken, NOTIFICATION_API } from "../../../lib/api";

export async function GET(): Promise<Response> {
  const token = await getToken();
  if (!token) return Response.json({ notifications: [] }, { status: 200 });

  try {
    const upstream = await apiFetch(NOTIFICATION_API, "/v1/notifications");
    if (!upstream.ok) {
      return Response.json({ notifications: [] }, { status: 200 });
    }
    const data = await upstream.json();
    return Response.json(data, { status: 200 });
  } catch {
    return Response.json({ notifications: [] }, { status: 200 });
  }
}
