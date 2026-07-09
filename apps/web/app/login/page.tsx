import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpenText, CheckCircle2 } from "lucide-react";
import { getToken } from "../../lib/api";
import { LoginForm } from "../../components/forms/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export default async function LoginPage() {
  const token = await getToken();
  if (token) {
    redirect("/dashboard");
  }
  return (
    <div className="fixed inset-0 flex flex-col md:flex-row">
      {/* Left Pane: Branding / Splash */}
      <div className="bg-gradient-brand relative hidden flex-1 flex-col justify-between p-10 text-white md:flex">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/15" />
        <div className="absolute -top-40 -left-40 size-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 size-[600px] rounded-full bg-accent/5 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
            <BookOpenText className="size-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight">Research Publishing OS</span>
        </div>

        <div className="relative space-y-6">
          <h2 className="font-serif text-5xl leading-tight">
            Accelerate the speed of discovery.
          </h2>
          <p className="max-w-md text-base text-white/70">
            Sign in to submit manuscripts, coordinate peer review, and manage your journal's
            editorial workflow — whatever your role.
          </p>

          <div className="space-y-3 pt-4">
            {[
              "Manuscript submission and status tracking",
              "Structured peer review recommendations",
              "Editorial decisions and journal catalog management",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm text-white/90">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-white/50">
          © {new Date().getFullYear()} RPOS Platform. All rights reserved.
        </div>
      </div>

      {/* Right Pane: Login Form */}
      <div className="bg-mesh flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Logo on mobile only */}
          <div className="flex items-center gap-2.5 justify-center md:hidden">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-brand">
              <BookOpenText className="size-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">RPOS</span>
          </div>

          <Card className="glass relative overflow-hidden shadow-xl border-border/40">
            <CardHeader className="space-y-1.5 pb-5">
              <CardTitle className="text-2xl font-semibold tracking-tight">Sign in</CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Use your Research Publishing OS account credentials.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
            <CardFooter className="pt-2 border-t border-border/20">
              <p className="text-sm text-muted-foreground">
                No account?{" "}
                <Link href="/register" className="text-primary font-medium hover:underline">
                  Register
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
