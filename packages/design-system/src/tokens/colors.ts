/**
 * RPOS Design System — Color Tokens
 *
 * Deep indigo + warm gold palette designed for scholarly publishing.
 * All values use OKLCH for perceptual uniformity and Tailwind CSS v4 compatibility.
 */

// ─── Brand Colors ────────────────────────────────────────────────
export const brand = {
  /** Deep indigo — primary brand, scholarly authority */
  indigo: {
    50: "oklch(0.97 0.014 264)",
    100: "oklch(0.93 0.032 264)",
    200: "oklch(0.86 0.065 264)",
    300: "oklch(0.76 0.105 264)",
    400: "oklch(0.65 0.155 264)",
    500: "oklch(0.54 0.19 264)",
    600: "oklch(0.45 0.18 264)",
    700: "oklch(0.37 0.155 264)",
    800: "oklch(0.30 0.12 264)",
    900: "oklch(0.24 0.09 264)",
    950: "oklch(0.18 0.065 264)",
  },

  /** Warm gold — premium accent, distinction */
  gold: {
    50: "oklch(0.98 0.02 85)",
    100: "oklch(0.95 0.05 85)",
    200: "oklch(0.90 0.09 85)",
    300: "oklch(0.83 0.13 85)",
    400: "oklch(0.78 0.15 85)",
    500: "oklch(0.72 0.155 85)",
    600: "oklch(0.63 0.145 85)",
    700: "oklch(0.53 0.12 85)",
    800: "oklch(0.44 0.09 85)",
    900: "oklch(0.36 0.07 85)",
    950: "oklch(0.26 0.05 85)",
  },
} as const;

// ─── Semantic Colors (Submission Workflow) ───────────────────────
export const semantic = {
  /** Draft — neutral gray */
  draft: "oklch(0.556 0 0)",
  /** Submitted — sky blue */
  submitted: "oklch(0.60 0.16 240)",
  /** Under Review — violet */
  underReview: "oklch(0.55 0.17 285)",
  /** Revisions Requested — amber */
  revisionsRequested: "oklch(0.75 0.16 65)",
  /** Accepted — emerald */
  accepted: "oklch(0.65 0.18 155)",
  /** Rejected — rose */
  rejected: "oklch(0.60 0.20 22)",
  /** Published — deep teal */
  published: "oklch(0.62 0.14 175)",
  /** Withdrawn — warm gray */
  withdrawn: "oklch(0.50 0.01 0)",
} as const;

// ─── Review Recommendation Colors ───────────────────────────────
export const recommendation = {
  accept: "oklch(0.65 0.18 155)",
  minorRevision: "oklch(0.72 0.14 140)",
  majorRevision: "oklch(0.75 0.16 65)",
  reject: "oklch(0.60 0.20 22)",
} as const;

// ─── System Colors ──────────────────────────────────────────────
export const system = {
  success: "oklch(0.65 0.18 155)",
  warning: "oklch(0.80 0.16 75)",
  error: "oklch(0.60 0.22 25)",
  info: "oklch(0.65 0.15 240)",
} as const;

// ─── Light Theme Primitives ─────────────────────────────────────
export const light = {
  background: "oklch(0.985 0.002 250)",
  foreground: "oklch(0.145 0.005 264)",
  card: "oklch(1 0 0)",
  cardForeground: "oklch(0.145 0.005 264)",
  popover: "oklch(1 0 0)",
  popoverForeground: "oklch(0.145 0.005 264)",
  primary: "oklch(0.45 0.18 264)",
  primaryForeground: "oklch(0.985 0 0)",
  secondary: "oklch(0.965 0.005 264)",
  secondaryForeground: "oklch(0.24 0.04 264)",
  muted: "oklch(0.965 0.005 264)",
  mutedForeground: "oklch(0.50 0.02 264)",
  accent: "oklch(0.78 0.15 85)",
  accentForeground: "oklch(0.24 0.06 85)",
  destructive: "oklch(0.577 0.245 27.325)",
  destructiveForeground: "oklch(0.985 0 0)",
  border: "oklch(0.915 0.008 264)",
  input: "oklch(0.915 0.008 264)",
  ring: "oklch(0.45 0.18 264)",
  sidebarBackground: "oklch(0.975 0.004 264)",
  sidebarForeground: "oklch(0.30 0.04 264)",
  sidebarBorder: "oklch(0.92 0.008 264)",
  sidebarAccent: "oklch(0.95 0.01 264)",
  sidebarMuted: "oklch(0.55 0.02 264)",
} as const;

// ─── Dark Theme Primitives ──────────────────────────────────────
export const dark = {
  background: "oklch(0.145 0.012 264)",
  foreground: "oklch(0.96 0.005 264)",
  card: "oklch(0.19 0.015 264)",
  cardForeground: "oklch(0.96 0.005 264)",
  popover: "oklch(0.19 0.015 264)",
  popoverForeground: "oklch(0.96 0.005 264)",
  primary: "oklch(0.62 0.17 264)",
  primaryForeground: "oklch(0.985 0 0)",
  secondary: "oklch(0.24 0.02 264)",
  secondaryForeground: "oklch(0.93 0.01 264)",
  muted: "oklch(0.24 0.02 264)",
  mutedForeground: "oklch(0.65 0.02 264)",
  accent: "oklch(0.75 0.15 85)",
  accentForeground: "oklch(0.18 0.04 85)",
  destructive: "oklch(0.704 0.191 22.216)",
  destructiveForeground: "oklch(0.985 0 0)",
  border: "oklch(1 0 0 / 10%)",
  input: "oklch(1 0 0 / 15%)",
  ring: "oklch(0.62 0.17 264)",
  sidebarBackground: "oklch(0.16 0.014 264)",
  sidebarForeground: "oklch(0.85 0.01 264)",
  sidebarBorder: "oklch(1 0 0 / 8%)",
  sidebarAccent: "oklch(0.22 0.02 264)",
  sidebarMuted: "oklch(0.55 0.02 264)",
} as const;
