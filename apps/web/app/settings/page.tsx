import { redirect } from "next/navigation";
import type { PublicUser } from "@rpos/types";
import { PageHeader, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@rpos/ui";
import { apiFetch, AUTH_API, getToken } from "../../lib/api";
import { fetchApiKey, fetchMyPublishers } from "../../lib/catalog";
import { ThemeSelector } from "../../components/ThemeSelector";
import { ApiKeyManager } from "../../components/ApiKeyManager";

export default async function SettingsPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  const meRes = await apiFetch(AUTH_API, "/v1/auth/me");
  if (!meRes.ok) redirect("/login");
  const { user } = (await meRes.json()) as { user: PublicUser };
  const canManageApiKeys = user.roles.includes("PUBLISHER") || user.roles.includes("ADMIN");

  const publishers = canManageApiKeys ? await fetchMyPublishers() : [];
  const apiKeys = await Promise.all(publishers.map((p) => fetchApiKey(p.id)));

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your appearance and API access." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Theme</CardTitle>
          <CardDescription>
            Applies immediately and is remembered on this browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSelector />
        </CardContent>
      </Card>

      {canManageApiKeys && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">API Access</CardTitle>
            <CardDescription>
              Each organization has its own API key for programmatic access to its journals
              (<code className="text-xs">GET /api/journals/mine</code> with an{" "}
              <code className="text-xs">x-api-key</code> header).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {publishers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You don't have a publisher organization yet — create one from the Publisher
                dashboard first.
              </p>
            ) : (
              publishers.map((publisher, index) => (
                <ApiKeyManager
                  key={publisher.id}
                  publisherId={publisher.id}
                  publisherName={publisher.name}
                  initialApiKey={apiKeys[index] ?? null}
                />
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
