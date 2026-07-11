"use client";

import { useTheme } from "./ThemeProvider";
import { Check } from "lucide-react";

const THEMES = [
  {
    id: "theme-slate" as const,
    name: "Slate Midnight",
    description: "Dark slate-blue with a warm amber accent",
    colors: ["#12131a", "#1b1c24", "#3b82f6", "#f59e0b"],
  },
  {
    id: "theme-emerald" as const,
    name: "Emerald Matrix",
    description: "Dark green with a luminous teal accent",
    colors: ["#080f0a", "#0f1c12", "#10b981", "#14b8a6"],
  },
  {
    id: "theme-cyberpunk" as const,
    name: "Cyberpunk Neon",
    description: "Fluorescent pink and electric cyan",
    colors: ["#0d0714", "#170c22", "#ec4899", "#06b6d4"],
  },
  {
    id: "theme-crimson" as const,
    name: "Crimson Obsidian",
    description: "Obsidian red with golden highlights",
    colors: ["#120606", "#1e0b0b", "#ef4444", "#d97706"],
  },
  {
    id: "theme-solarized" as const,
    name: "Solarized Bronze",
    description: "Warm bronze with lime highlights",
    colors: ["#14100c", "#201a14", "#f59e0b", "#84cc16"],
  },
  {
    id: "theme-skyblue" as const,
    name: "Light Sky Blue",
    description: "Full light theme with a sky-blue accent",
    colors: ["#f0f6fc", "#ffffff", "#0ea5e9", "#e2e8f0"],
  },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {THEMES.map((t) => {
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`relative flex flex-col text-left rounded-lg p-5 border transition-colors duration-150 group cursor-pointer ${
              isActive
                ? "border-primary bg-primary/5"
                : "border-border bg-secondary/30 hover:bg-secondary/60 hover:border-border/80"
            }`}
          >
            {isActive && (
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground p-1 rounded-full">
                <Check className="size-4" />
              </div>
            )}

            <div className="flex-1 space-y-3">
              <div>
                <h4 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm">
                  {t.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
              </div>

              <div className="flex gap-1.5 p-2 rounded-lg bg-background border border-border">
                {t.colors.map((c, idx) => (
                  <div
                    key={idx}
                    className="size-5 rounded border border-border"
                    style={{ backgroundColor: c }}
                    title={`Color ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
