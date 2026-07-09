import { redirect } from "next/navigation";
import { BookOpenText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rpos/ui";
import { LoginForm } from "../../components/forms/login-form";
import { getToken } from "../../lib/api";

export default async function LoginPage() {
  const token = await getToken();
  if (token) redirect("/dashboard");

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="flex items-center justify-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/15">
          <BookOpenText className="size-5 text-primary" />
        </div>
        <span className="text-lg font-bold tracking-tight">Author Portal</span>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Sign in</CardTitle>
          <CardDescription>
            Use your Research Publishing OS account to submit and track manuscripts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
