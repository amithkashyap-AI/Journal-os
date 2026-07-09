"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "theme-slate" | "theme-emerald" | "theme-cyberpunk" | "theme-crimson" | "theme-solarized" | "theme-skyblue";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "theme-slate",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("theme-slate");

  function updateDocumentTheme(themeClass: Theme) {
    const root = document.documentElement;

    // Toggle dark mode class based on chosen theme
    if (themeClass === "theme-skyblue") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }

    root.classList.remove("theme-slate", "theme-emerald", "theme-cyberpunk", "theme-crimson", "theme-solarized", "theme-skyblue");
    root.classList.add(themeClass);
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem("rpos-theme") as Theme;
    if (savedTheme && ["theme-slate", "theme-emerald", "theme-cyberpunk", "theme-crimson", "theme-solarized", "theme-skyblue"].includes(savedTheme)) {
      // localStorage isn't available during SSR, so the persisted theme can
      // only be synced in after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeState(savedTheme);
      updateDocumentTheme(savedTheme);
    } else {
      updateDocumentTheme("theme-slate");
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("rpos-theme", newTheme);
    updateDocumentTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
