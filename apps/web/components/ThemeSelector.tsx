"use client";

import { useTheme } from "./ThemeProvider";
import { Check } from "lucide-react";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      id: "theme-slate" as const,
      name: "Slate Midnight (CMM)",
      description: "Coin Market Manager dark slate-blue style",
      bgClass: "bg-[#12131a]",
      primaryClass: "bg-[#3b82f6]",
      accentClass: "bg-[#f59e0b]",
      borderClass: "border-[#2d3748]",
      colors: ["#12131a", "#1b1c24", "#3b82f6", "#f59e0b"],
    },
    {
      id: "theme-emerald" as const,
      name: "Emerald Matrix",
      description: "Matrix dark green and luminous emerald",
      bgClass: "bg-[#080f0a]",
      primaryClass: "bg-[#10b981]",
      accentClass: "bg-[#14b8a6]",
      borderClass: "border-[#1b3220]",
      colors: ["#080f0a", "#0f1c12", "#10b981", "#14b8a6"],
    },
    {
      id: "theme-cyberpunk" as const,
      name: "Cyberpunk Neon",
      description: "Fluorescent cyan and electric neon purple",
      bgClass: "bg-[#0d0714]",
      primaryClass: "bg-[#ec4899]",
      accentClass: "bg-[#06b6d4]",
      borderClass: "border-[#2e1845]",
      colors: ["#0d0714", "#170c22", "#ec4899", "#06b6d4"],
    },
    {
      id: "theme-crimson" as const,
      name: "Crimson Obsidian",
      description: "Sleek obsidian red and golden accents",
      bgClass: "bg-[#120606]",
      primaryClass: "bg-[#ef4444]",
      accentClass: "bg-[#d97706]",
      borderClass: "border-[#371313]",
      colors: ["#120606", "#1e0b0b", "#ef4444", "#d97706"],
    },
    {
      id: "theme-solarized" as const,
      name: "Solarized Bronze",
      description: "Warm bronze chocolate with lime highlights",
      bgClass: "bg-[#14100c]",
      primaryClass: "bg-[#f59e0b]",
      accentClass: "bg-[#84cc16]",
      borderClass: "border-[#33281e]",
      colors: ["#14100c", "#201a14", "#f59e0b", "#84cc16"],
    },
    {
      id: "theme-skyblue" as const,
      name: "Light Sky Blue",
      description: "Full white and light blue sky canvas",
      bgClass: "bg-[#f0f6fc]",
      primaryClass: "bg-[#0ea5e9]",
      accentClass: "bg-[#0ea5e9]",
      borderClass: "border-[#e2e8f0]",
      colors: ["#f0f6fc", "#ffffff", "#0ea5e9", "#e2e8f0"],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {themes.map((t) => {
          const isActive = theme === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`relative flex flex-col text-left rounded-xl p-5 border transition-all duration-300 group cursor-pointer ${
                isActive
                  ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300"
              }`}
            >
              {isActive && (
                <div className="absolute top-4 right-4 bg-primary text-white p-1 rounded-full">
                  <Check className="size-4" />
                </div>
              )}

              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors text-sm">
                    {t.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{t.description}</p>
                </div>

                {/* Color swatches preview */}
                <div className="flex gap-1.5 p-2 rounded-lg bg-white border border-gray-200">
                  {t.colors.map((c, idx) => (
                    <div
                      key={idx}
                      className="size-5 rounded border border-gray-200"
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
    </div>
  );
}
