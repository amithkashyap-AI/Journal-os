import Link from "next/link";
import { BookOpenText, CheckCircle2 } from "lucide-react";
import { RegisterForm } from "../../components/forms/register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export default function RegisterPage() {
  return (
    <div className="fixed inset-0 flex flex-col md:flex-row">
      {/* Left Pane: Branding / Splash */}
      <div className="bg-gradient-brand relative hidden flex-1 flex-col justify-between p-10 text-white md:flex">
        {/* Decorative elements */}
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
            Submit your research, coordinate peer review, and connect with editors of top-tier
            academic journals on the most comprehensive publishing operating system.
          </p>

          <div className="space-y-3 pt-4">
            {[
              "Guided multi-step manuscript submission wizard",
              "Structured peer review recommendations",
              "Academic profile with ORCID integration",
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

      {/* Right Pane: Register Form */}
      <div className="bg-mesh flex flex-1 items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 py-8">
          {/* Logo on mobile only */}
          <div className="flex items-center gap-2.5 justify-center md:hidden">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-brand">
              <BookOpenText className="size-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">RPOS</span>
          </div>

          <Card className="glass relative overflow-hidden shadow-xl border-border/40">
            <CardHeader className="space-y-1.5 pb-5">
              <CardTitle className="text-2xl font-semibold tracking-tight">Create account</CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Register as an author or reviewer to participate in the peer review lifecycle.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegisterForm />
            </CardContent>
            <CardFooter className="pt-2 border-t border-border/20">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
