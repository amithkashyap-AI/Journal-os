/**
 * RPOS Design System — Typography Tokens
 *
 * Inter for body/UI text, Instrument Serif for display headings.
 * Uses a modular type scale based on 1.25 ratio.
 */

// ─── Font Families ──────────────────────────────────────────────
export const fontFamily = {
  /** Primary sans-serif for body and UI */
  sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  /** Serif for display headings and hero text */
  serif: "'Instrument Serif', 'Georgia', 'Times New Roman', serif",
  /** Monospace for code and technical identifiers */
  mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
} as const;

// ─── Font Sizes (rem) ───────────────────────────────────────────
export const fontSize = {
  /** 11px — Micro labels, timestamps */
  xs: "0.6875rem",
  /** 12px — Captions, helper text */
  sm: "0.75rem",
  /** 13px — Secondary body text */
  base: "0.8125rem",
  /** 14px — Primary body text */
  md: "0.875rem",
  /** 16px — Emphasized body / small headings */
  lg: "1rem",
  /** 18px — Section headings */
  xl: "1.125rem",
  /** 20px — Card titles */
  "2xl": "1.25rem",
  /** 24px — Page headings */
  "3xl": "1.5rem",
  /** 30px — Major headings */
  "4xl": "1.875rem",
  /** 36px — Display text */
  "5xl": "2.25rem",
  /** 48px — Hero display */
  "6xl": "3rem",
  /** 60px — Large hero display */
  "7xl": "3.75rem",
} as const;

// ─── Line Heights ───────────────────────────────────────────────
export const lineHeight = {
  none: "1",
  tight: "1.2",
  snug: "1.35",
  normal: "1.5",
  relaxed: "1.625",
  loose: "1.8",
} as const;

// ─── Font Weights ───────────────────────────────────────────────
export const fontWeight = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

// ─── Letter Spacing ─────────────────────────────────────────────
export const letterSpacing = {
  tighter: "-0.03em",
  tight: "-0.015em",
  normal: "0",
  wide: "0.02em",
  wider: "0.04em",
  widest: "0.08em",
} as const;

// ─── Composite Text Styles ──────────────────────────────────────
export const textStyle = {
  /** Hero display heading — Instrument Serif */
  heroDisplay: {
    fontFamily: fontFamily.serif,
    fontSize: fontSize["7xl"],
    lineHeight: lineHeight.tight,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.tighter,
  },
  /** Large display — Instrument Serif */
  display: {
    fontFamily: fontFamily.serif,
    fontSize: fontSize["5xl"],
    lineHeight: lineHeight.tight,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.tight,
  },
  /** Page heading */
  h1: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize["3xl"],
    lineHeight: lineHeight.snug,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.tight,
  },
  /** Section heading */
  h2: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.snug,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
  },
  /** Card / subsection heading */
  h3: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.snug,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
  },
  /** Body */
  body: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.md,
    lineHeight: lineHeight.relaxed,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  /** Small body / secondary text */
  bodySmall: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.base,
    lineHeight: lineHeight.normal,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  /** Caption */
  caption: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.normal,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.wide,
  },
  /** Overline labels */
  overline: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.normal,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.widest,
  },
} as const;
