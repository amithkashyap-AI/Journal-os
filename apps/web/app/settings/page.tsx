import { redirect } from "next/navigation";
import { PageHeader, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@rpos/ui";
import { getToken } from "../../lib/api";
import { ThemeSelector } from "../../components/ThemeSelector";

export default async function SettingsPage() {
  const token = await getToken();
  if (!token) redirect("/login");

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Appearance"
        description="Choose how Research Publishing OS looks for you on this device."
      />

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
    </div>
  );
}
