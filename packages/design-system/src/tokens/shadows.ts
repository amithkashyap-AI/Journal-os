/**
 * RPOS Design System — Shadow Tokens
 *
 * Soft colored shadows for depth and elevation.
 * Shadows use the brand indigo tint for cohesion.
 */

export const shadow = {
  /** Subtle border-like shadow for cards at rest */
  xs: "0 1px 2px 0 oklch(0.30 0.06 264 / 0.04)",
  /** Slight elevation — hovered cards, dropdowns */
  sm: "0 1px 3px 0 oklch(0.30 0.06 264 / 0.06), 0 1px 2px -1px oklch(0.30 0.06 264 / 0.04)",
  /** Standard elevation — active cards, popovers */
  md: "0 4px 6px -1px oklch(0.30 0.06 264 / 0.07), 0 2px 4px -2px oklch(0.30 0.06 264 / 0.04)",
  /** Raised — dialogs, floating panels */
  lg: "0 10px 15px -3px oklch(0.30 0.06 264 / 0.08), 0 4px 6px -4px oklch(0.30 0.06 264 / 0.04)",
  /** High elevation — modals, command palette */
  xl: "0 20px 25px -5px oklch(0.30 0.06 264 / 0.10), 0 8px 10px -6px oklch(0.30 0.06 264 / 0.04)",
  /** Maximum elevation — tooltip, toast */
  "2xl": "0 25px 50px -12px oklch(0.30 0.06 264 / 0.18)",
  /** Inset shadow — pressed buttons, input focus */
  inner: "inset 0 2px 4px 0 oklch(0.30 0.06 264 / 0.04)",
  /** No shadow */
  none: "0 0 #0000",
} as const;

/** Glow effects for primary actions and focus rings */
export const glow = {
  /** Primary button glow on hover */
  primary: "0 0 20px oklch(0.45 0.18 264 / 0.25)",
  /** Gold accent glow */
  accent: "0 0 20px oklch(0.78 0.15 85 / 0.25)",
  /** Success glow */
  success: "0 0 16px oklch(0.65 0.18 155 / 0.20)",
  /** Error glow */
  error: "0 0 16px oklch(0.60 0.22 25 / 0.20)",
} as const;
