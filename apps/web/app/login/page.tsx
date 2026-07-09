import { redirect } from "next/navigation";
import { getToken } from "../../lib/api";
import Link from "next/link";
import { BookOpenText, CheckCircle2 } from "lucide-react";
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
    <div className="fixed inset-0 flex flex-col md:flex-row bg-[#12131a]">
      {/* Left Pane: Branding / Splash */}
      <div className="relative hidden flex-1 flex-col justify-between p-12 text-white md:flex bg-[#0b0c10] border-r border-[#1f2430]">
        {/* Decorative elements simulating CMM neon mesh */}
        <div className="absolute inset-0 bg-radial-gradient from-primary/10 via-transparent to-accent/5 opacity-80" />
        <div className="absolute -top-40 -left-40 size-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 size-[600px] rounded-full bg-accent/5 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
            <BookOpenText className="size-5 text-[#3b82f6]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Research Publishing OS</span>
        </div>

        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/10 text-xs font-semibold text-[#f59e0b]">
            ★ CMM Engine Active
          </div>
          <h2 className="text-5xl font-extrabold leading-tight tracking-tight text-white">
            Superadmin Command Console
          </h2>
          <p className="max-w-md text-sm text-[#a0aec0] leading-relaxed">
            Monitor, orchestrate, and customize every dimension of the publishing ecosystem. Access all 35 modules from a unified command panel.
          </p>

          <div className="space-y-3 pt-4 border-t border-[#1f2430]">
            {[
              "35 core publishing modules ready",
              "AI Center assistant scoring engine",
              "Real-time microservice diagnostics",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-xs text-[#a0aec0]">
                <CheckCircle2 className="size-4 text-[#10b981]" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-muted-foreground">
          © {new Date().getFullYear()} RPOS Platform. All rights reserved.
        </div>
      </div>

      {/* Right Pane: Login Form */}
      <div className="flex flex-1 items-center justify-center p-6 bg-[#12131a]">
        <div className="w-full max-w-md space-y-6">
          {/* Logo on mobile only */}
          <div className="flex items-center gap-2.5 justify-center md:hidden">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
              <BookOpenText className="size-5 text-[#3b82f6]" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">RPOS</span>
          </div>

          <Card className="relative overflow-hidden bg-[#1b1c24] border border-[#2d3748] shadow-2xl rounded-2xl p-6">
            <CardHeader className="space-y-1.5 pb-4 px-0">
              <CardTitle className="text-2xl font-bold tracking-tight text-white">Console Sign In</CardTitle>
              <CardDescription className="text-[#a0aec0] text-xs">
                Authorize administrative credentials to access the tree console.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <LoginForm />
            </CardContent>
            <CardFooter className="pt-4 px-0 border-t border-[#2d3748] flex justify-between items-center">
              <p className="text-xs text-[#a0aec0]">
                No account?{" "}
                <Link href="/register" className="text-[#3b82f6] font-semibold hover:underline">
                  Register tenant
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
