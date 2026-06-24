"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: Exclude<Theme, "system">;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined,
);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
  storageKey = "theme",
  attribute = "class",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  storageKey?: string;
  attribute?: "class";
}) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] =
    React.useState<Exclude<Theme, "system">>("light");

  React.useEffect(() => {
    const storedTheme = window.localStorage.getItem(storageKey) as Theme | null;

    if (
      storedTheme === "light" ||
      storedTheme === "dark" ||
      storedTheme === "system"
    ) {
      setTheme(storedTheme);
    }
  }, [storageKey]);

  React.useEffect(() => {
    if (!enableSystem) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light");
    };

    updateSystemTheme();
    mediaQuery.addEventListener("change", updateSystemTheme);

    return () => mediaQuery.removeEventListener("change", updateSystemTheme);
  }, [enableSystem]);

  React.useEffect(() => {
    window.localStorage.setItem(storageKey, theme);

    if (attribute !== "class") {
      return;
    }

    const root = document.documentElement;
    const resolvedTheme =
      theme === "system" && enableSystem ? systemTheme : theme;

    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [attribute, enableSystem, storageKey, systemTheme, theme]);

  const resolvedTheme =
    theme === "system" && enableSystem ? systemTheme : theme;

  const contextValue = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [resolvedTheme, theme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
