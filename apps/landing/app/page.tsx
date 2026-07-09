import {
  BookOpenText,
  FileText,
  Users,
  CheckCircle2,
  BarChart3,
  Globe,
  Shield,
  ArrowRight,
  Star,
  Send,
  ClipboardCheck,
  BookCopy,
  Layers,
  Award,
  PenTool,
} from "lucide-react";
import Link from "next/link";

// ─── Navigation ──────────────────────────────────────────────────
function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-brand">
            <BookOpenText className="size-5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">RPOS</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            How It Works
          </a>
          <a href="#roles" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            For Every Role
          </a>
          <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-md hover:shadow-primary/20"
          >
            Get Started
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </nav>
    </header>
  );
}

// ─── Hero ────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2">
        <div className="h-[500px] w-[800px] rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="absolute top-40 right-0">
        <div className="h-[300px] w-[400px] rounded-full bg-gold-400/5 blur-3xl" />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-32 left-[10%] animate-float opacity-20">
        <FileText className="size-8 text-primary" />
      </div>
      <div className="absolute top-48 right-[15%] animate-float opacity-15" style={{ animationDelay: "1s" }}>
        <Users className="size-10 text-gold-500" />
      </div>
      <div className="absolute bottom-32 left-[20%] animate-float opacity-10" style={{ animationDelay: "2s" }}>
        <CheckCircle2 className="size-6 text-emerald-500" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 shadow-xs">
          <span className="flex size-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-muted-foreground">
            Now in Open Beta — Free for institutions
          </span>
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-4xl font-serif text-5xl leading-[1.1] tracking-tight md:text-7xl">
          The Operating System for{" "}
          <span className="text-gradient">Research Publishing</span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Manage journals, orchestrate peer review, and publish scholarship — all from one
          enterprise-grade platform built for the modern research ecosystem.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
          >
            Start Publishing Free
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-secondary"
          >
            See How It Works
          </a>
        </div>

        {/* Social proof */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              {["A", "B", "C", "D", "E"].map((letter) => (
                <div
                  key={letter}
                  className="flex size-6 items-center justify-center rounded-full border-2 border-background bg-brand-200 text-[9px] font-bold text-brand-700"
                >
                  {letter}
                </div>
              ))}
            </div>
            <span className="ml-1">200+ publishers onboarded</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="size-4 fill-gold-400 text-gold-400" />
            <span>4.9/5 from editorial teams</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="size-4 text-emerald-500" />
            <span>SOC 2 Type II certified</span>
          </div>
        </div>

        {/* Dashboard preview mockup */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-brand-900/10">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-rose-400/60" />
                <div className="size-3 rounded-full bg-amber-400/60" />
                <div className="size-3 rounded-full bg-emerald-400/60" />
              </div>
              <div className="mx-auto flex h-7 w-80 items-center justify-center rounded-md bg-background text-xs text-muted-foreground">
                app.rpos.io/dashboard
              </div>
            </div>
            {/* Dashboard mockup content */}
            <div className="p-6">
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Total Submissions", value: "1,247", trend: "+12%", color: "text-brand-600" },
                  { label: "Under Review", value: "89", trend: "+3%", color: "text-violet-600" },
                  { label: "Accepted", value: "342", trend: "+8%", color: "text-emerald-600" },
                  { label: "Published", value: "816", trend: "+15%", color: "text-teal-600" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-border/50 bg-background p-4">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
                    <p className={`mt-0.5 text-xs font-medium ${stat.color}`}>{stat.trend} this month</p>
                  </div>
                ))}
              </div>
              {/* Table preview */}
              <div className="mt-4 rounded-xl border border-border/50 bg-background">
                <div className="border-b border-border/50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Recent Submissions</p>
                    <div className="flex gap-2">
                      {["All", "Under Review", "Accepted"].map((filter) => (
                        <span
                          key={filter}
                          className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${
                            filter === "All"
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          {filter}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {[
                  { title: "Neural Architecture Search for Edge Computing", status: "Under Review", statusColor: "bg-violet-100 text-violet-700" },
                  { title: "Transformer Models in Climate Prediction", status: "Accepted", statusColor: "bg-emerald-100 text-emerald-700" },
                  { title: "Federated Learning in Healthcare Systems", status: "Published", statusColor: "bg-teal-100 text-teal-700" },
                ].map((item) => (
                  <div key={item.title} className="flex items-center justify-between border-b border-border/30 px-4 py-3 last:border-0">
                    <p className="text-sm">{item.title}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Features ────────────────────────────────────────────────────
const features = [
  {
    icon: <FileText className="size-5" />,
    title: "Submission Management",
    description:
      "Multi-step submission wizard with manuscript upload, metadata extraction, and author verification.",
  },
  {
    icon: <ClipboardCheck className="size-5" />,
    title: "Peer Review Orchestration",
    description:
      "Assign reviewers, track deadlines, collect structured recommendations, and manage revision cycles.",
  },
  {
    icon: <PenTool className="size-5" />,
    title: "Editorial Dashboard",
    description:
      "Full editorial workflow with Kanban boards, decision tools, and reviewer workload balancing.",
  },
  {
    icon: <BookCopy className="size-5" />,
    title: "Multi-format Publishing",
    description:
      "Publish to journals, conferences, book series, and proceedings from a unified platform.",
  },
  {
    icon: <Globe className="size-5" />,
    title: "DOI Registration",
    description:
      "Automatic DOI minting and CrossRef registration with metadata compliance validation.",
  },
  {
    icon: <BarChart3 className="size-5" />,
    title: "Analytics & Reporting",
    description:
      "Submission funnels, time-to-publish metrics, reviewer turnaround tracking, and impact analysis.",
  },
];

function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Platform Capabilities
          </p>
          <h2 className="mt-3 font-serif text-3xl tracking-tight md:text-4xl">
            Everything you need to run a publishing operation
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            From manuscript submission to final publication — RPOS provides a complete,
            integrated toolset for modern scholarly publishing.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
            >
              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative">
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700 transition-colors group-hover:bg-primary group-hover:text-primary-foreground dark:bg-brand-900/40 dark:text-brand-300">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ────────────────────────────────────────────────
const steps = [
  {
    step: "01",
    icon: <Send className="size-6" />,
    title: "Submit",
    description:
      "Authors submit manuscripts with metadata through a guided wizard. Files are validated and stored securely.",
  },
  {
    step: "02",
    icon: <Users className="size-6" />,
    title: "Review",
    description:
      "Editors assign reviewers, set deadlines, and collect structured recommendations. Authors revise and resubmit.",
  },
  {
    step: "03",
    icon: <Award className="size-6" />,
    title: "Publish",
    description:
      "Accepted manuscripts are formatted, assigned DOIs, and published to journals with full metadata compliance.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-mesh py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Simple Workflow
          </p>
          <h2 className="mt-3 font-serif text-3xl tracking-tight md:text-4xl">
            From manuscript to publication in three steps
          </h2>
        </div>

        <div className="relative mt-20">
          {/* Connection line */}
          <div className="absolute top-12 left-0 right-0 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />

          <div className="grid gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((step) => (
              <div key={step.step} className="relative text-center">
                {/* Step number circle */}
                <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-2xl border border-border bg-card shadow-md">
                  <div className="text-primary">{step.icon}</div>
                </div>
                <span className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  Step {step.step}
                </span>
                <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Roles ───────────────────────────────────────────────────────
const roles = [
  {
    role: "Authors",
    icon: <PenTool className="size-5" />,
    features: [
      "Multi-step submission wizard with validation",
      "Real-time status tracking for all manuscripts",
      "Revision management with tracked changes",
      "Co-author management and correspondence",
      "Publication history and citation tracking",
    ],
  },
  {
    role: "Editors",
    icon: <Layers className="size-5" />,
    features: [
      "Kanban-style submission management board",
      "Reviewer assignment with expertise matching",
      "Decision tools with review aggregation",
      "Workload balancing across editorial board",
      "Automated deadline reminders and escalation",
    ],
  },
  {
    role: "Reviewers",
    icon: <ClipboardCheck className="size-5" />,
    features: [
      "Assignment dashboard with due dates",
      "Integrated manuscript reader with annotations",
      "Structured review forms with recommendations",
      "Availability and expertise profile settings",
      "Review history and contribution metrics",
    ],
  },
  {
    role: "Publishers",
    icon: <BookOpenText className="size-5" />,
    features: [
      "Multi-journal management from one dashboard",
      "Editorial board configuration per journal",
      "Publication analytics and impact metrics",
      "DOI registration and metadata compliance",
      "Billing, subscriptions, and APC management",
    ],
  },
];

function Roles() {
  return (
    <section id="roles" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Built for Everyone
          </p>
          <h2 className="mt-3 font-serif text-3xl tracking-tight md:text-4xl">
            Tailored experiences for every role
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Each stakeholder gets a purpose-built portal designed for their specific
            workflow and responsibilities.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {roles.map((roleData) => (
            <div
              key={roleData.role}
              className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                  {roleData.icon}
                </div>
                <h3 className="text-lg font-semibold">{roleData.role}</h3>
              </div>
              <ul className="space-y-2.5">
                {roleData.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ─────────────────────────────────────────────────────
const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "For small journals and individual editors getting started.",
    features: [
      "Up to 3 journals",
      "100 submissions / year",
      "5 editorial team members",
      "Basic analytics",
      "Email support",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Professional",
    price: "$299",
    period: "/mo",
    description: "For established publishers with active editorial operations.",
    features: [
      "Unlimited journals",
      "Unlimited submissions",
      "Unlimited team members",
      "Advanced analytics & reports",
      "DOI registration",
      "Custom branding",
      "Priority support",
      "API access",
    ],
    cta: "Start 14-day Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For universities and large publishing houses.",
    features: [
      "Everything in Professional",
      "SSO / SAML authentication",
      "Dedicated infrastructure",
      "Custom integrations",
      "SLA guarantee",
      "Dedicated account manager",
      "On-premises option",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="bg-mesh py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Pricing
          </p>
          <h2 className="mt-3 font-serif text-3xl tracking-tight md:text-4xl">
            Plans that scale with your publishing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Start free and upgrade as your publishing operation grows.
            No hidden fees, no per-submission charges.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border bg-card p-8 transition-all duration-300 hover:shadow-lg ${
                plan.popular
                  ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                  : "border-border hover:shadow-primary/5"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
                  Most Popular
                </span>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full rounded-xl py-3 text-sm font-semibold transition-all ${
                  plan.popular
                    ? "bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:shadow-primary/20"
                    : "border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ──────────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-brand px-8 py-16 text-center md:px-16">
          {/* Decorative circles */}
          <div className="absolute -top-20 -left-20 size-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -right-20 size-80 rounded-full bg-white/5" />
          <div className="absolute top-10 right-10 size-32 rounded-full bg-gold-400/10" />

          <div className="relative">
            <h2 className="font-serif text-3xl text-white md:text-4xl">
              Ready to modernize your publishing workflow?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/70">
              Join hundreds of publishers who&apos;ve streamlined their editorial operations
              with RPOS. Start free — no credit card required.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-brand-900 shadow-lg transition-all hover:shadow-xl"
              >
                Start Publishing Free
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────
const footerLinks = {
  Product: ["Features", "Pricing", "Security", "Integrations", "Changelog"],
  Resources: ["Documentation", "API Reference", "Blog", "Community", "Webinars"],
  Company: ["About", "Careers", "Contact", "Press", "Partners"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"],
};

function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-6">
          {/* Brand column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-brand">
                <BookOpenText className="size-5 text-white" />
              </div>
              <span className="text-lg font-semibold">RPOS</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              The operating system for modern research publishing. Manage journals,
              orchestrate peer review, and publish scholarship.
            </p>
            {/* Social icons placeholder */}
            <div className="mt-6 flex gap-3">
              {["X", "LI", "GH"].map((social) => (
                <div
                  key={social}
                  className="flex size-8 items-center justify-center rounded-lg border border-border text-xs font-bold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {social}
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {category}
              </p>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} RPOS. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with ❤️ for the research community
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Roles />
      <Pricing />
      <CTABanner />
      <Footer />
    </>
  );
}
