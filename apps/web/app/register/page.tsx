import Link from "next/link";
import { BookOpenText, CheckCircle2 } from "lucide-react";
import { RegisterForm } from "../../components/forms/register-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@rpos/ui";

export default function RegisterPage() {
  return (
    <div className="fixed inset-0 flex flex-col md:flex-row bg-background">
      {/* Left Pane: Branding / Neon Splash */}
      <div className="bg-gradient-brand relative hidden flex-1 flex-col justify-between overflow-hidden p-10 text-white md:flex">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-accent/25" />
        <div className="absolute -top-40 -left-40 size-[500px] animate-float rounded-full bg-primary/25 blur-3xl" />
        <div
          className="absolute -bottom-40 -right-40 size-[600px] animate-float rounded-full bg-accent/20 blur-3xl"
          style={{ animationDelay: "1.5s" }}
        />

        <div className="relative flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 shadow-[var(--shadow-glow)] backdrop-blur-md ring-1 ring-white/20">
            <BookOpenText className="size-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight">Research Publishing OS</span>
        </div>

        <div className="relative space-y-6">
          <h2 className="text-gradient font-serif text-5xl leading-tight">
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
                <CheckCircle2 className="size-4 text-accent" />
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
      <div className="bg-mesh relative flex flex-1 items-center justify-center overflow-y-auto overflow-x-hidden p-6">
        <div
          className="absolute top-1/4 right-1/4 size-[400px] animate-float rounded-full bg-primary/10 blur-3xl"
          style={{ animationDelay: "0.75s" }}
        />
        <div className="relative w-full max-w-md space-y-6 py-8">
          {/* Logo on mobile only */}
          <div className="flex items-center gap-2.5 justify-center md:hidden">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-brand">
              <BookOpenText className="size-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">RPOS</span>
          </div>

          {/* Gradient-bordered glass card */}
          <div className="rounded-xl bg-gradient-to-br from-primary via-accent/60 to-primary p-px shadow-[var(--shadow-glow)]">
            <Card className="glass rounded-[calc(0.75rem-1px)] border-0">
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
    </div>
  );
}
