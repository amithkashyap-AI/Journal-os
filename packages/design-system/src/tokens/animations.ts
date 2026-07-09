/**
 * RPOS Design System — Animation Tokens
 *
 * Motion design for micro-interactions, transitions, and loading states.
 */

// ─── Duration ───────────────────────────────────────────────────
export const duration = {
  /** Instant feedback — button active state, checkbox toggle */
  instant: "75ms",
  /** Fast — hover effects, color changes */
  fast: "150ms",
  /** Default — most transitions */
  normal: "200ms",
  /** Moderate — panel slide, accordion, sidebar */
  moderate: "300ms",
  /** Slow — page transitions, modals, drawers */
  slow: "400ms",
  /** Emphasis — hero animations, onboarding */
  emphasis: "600ms",
  /** Extra slow — complex orchestrated animations */
  dramatic: "800ms",
} as const;

// ─── Easing Curves ──────────────────────────────────────────────
export const easing = {
  /** Standard ease — most transitions */
  default: "cubic-bezier(0.25, 0.1, 0.25, 1.0)",
  /** Ease in — elements leaving the screen */
  in: "cubic-bezier(0.4, 0, 1, 1)",
  /** Ease out — elements entering the screen */
  out: "cubic-bezier(0, 0, 0.2, 1)",
  /** Ease in-out — elements moving on screen */
  inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  /** Spring — playful bounce for toggles, badges */
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  /** Smooth — sidebar, panel resize */
  smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

// ─── Keyframe Definitions ───────────────────────────────────────
export const keyframes = {
  fadeIn: {
    from: { opacity: "0" },
    to: { opacity: "1" },
  },
  fadeOut: {
    from: { opacity: "1" },
    to: { opacity: "0" },
  },
  slideInFromRight: {
    from: { transform: "translateX(100%)", opacity: "0" },
    to: { transform: "translateX(0)", opacity: "1" },
  },
  slideInFromLeft: {
    from: { transform: "translateX(-100%)", opacity: "0" },
    to: { transform: "translateX(0)", opacity: "1" },
  },
  slideInFromBottom: {
    from: { transform: "translateY(16px)", opacity: "0" },
    to: { transform: "translateY(0)", opacity: "1" },
  },
  slideInFromTop: {
    from: { transform: "translateY(-16px)", opacity: "0" },
    to: { transform: "translateY(0)", opacity: "1" },
  },
  scaleIn: {
    from: { transform: "scale(0.95)", opacity: "0" },
    to: { transform: "scale(1)", opacity: "1" },
  },
  shimmer: {
    from: { backgroundPosition: "-200% 0" },
    to: { backgroundPosition: "200% 0" },
  },
  pulse: {
    "0%, 100%": { opacity: "1" },
    "50%": { opacity: "0.5" },
  },
  spin: {
    from: { transform: "rotate(0deg)" },
    to: { transform: "rotate(360deg)" },
  },
  float: {
    "0%, 100%": { transform: "translateY(0)" },
    "50%": { transform: "translateY(-8px)" },
  },
} as const;

// ─── Composite Animations ───────────────────────────────────────
export const animation = {
  /** Content entering a page */
  pageEnter: `slideInFromBottom ${duration.moderate} ${easing.smooth}`,
  /** Card appearing */
  cardEnter: `scaleIn ${duration.normal} ${easing.out}`,
  /** Sidebar sliding in */
  sidebarEnter: `slideInFromLeft ${duration.moderate} ${easing.smooth}`,
  /** Toast notification appearing */
  toastEnter: `slideInFromRight ${duration.moderate} ${easing.spring}`,
  /** Modal entering */
  modalEnter: `scaleIn ${duration.slow} ${easing.smooth}`,
  /** Skeleton loading shimmer */
  shimmer: `shimmer 1.5s ${easing.inOut} infinite`,
  /** Pulsing indicator */
  pulse: `pulse 2s ${easing.inOut} infinite`,
  /** Spinner */
  spin: `spin 1s linear infinite`,
  /** Floating decorative element */
  float: `float 3s ${easing.inOut} infinite`,
} as const;
