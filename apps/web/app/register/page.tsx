import Link from "next/link";
import { BookOpenText, CheckCircle2 } from "lucide-react";
import { RegisterForm } from "../../components/forms/register-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@rpos/ui";

export default function RegisterPage() {
  return (
    <div className="fixed inset-0 flex flex-col md:flex-row">
      {/* Left Pane: Branding / Splash */}
      <div className="relative hidden flex-1 flex-col justify-between bg-primary p-10 text-primary-foreground md:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-white/10">
            <BookOpenText className="size-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight">Research Publishing OS</span>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">
            Accelerate the speed of discovery.
          </h2>
          <p className="max-w-md text-base text-primary-foreground/70">
            Submit your research, coordinate peer review, and connect with editors of top-tier
            academic journals on the most comprehensive publishing operating system.
          </p>

          <div className="space-y-3 pt-4">
            {[
              "Guided multi-step manuscript submission wizard",
              "Structured peer review recommendations",
              "Academic profile with ORCID integration",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm text-primary-foreground/90">
                <CheckCircle2 className="size-4" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} RPOS Platform. All rights reserved.
        </div>
      </div>

      {/* Right Pane: Register Form */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto bg-background p-6">
        <div className="w-full max-w-md space-y-6 py-8">
          {/* Logo on mobile only */}
          <div className="flex items-center gap-2.5 justify-center md:hidden">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
              <BookOpenText className="size-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">RPOS</span>
          </div>

          <Card className="border-border/40">
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
