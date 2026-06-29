"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeProviderProps = React.PropsWithChildren<{
  attribute?: "class";
  defaultTheme?: Theme;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
}>;

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const THEME_STORAGE_KEY = "theme";

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined,
);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getResolvedTheme(theme: Theme, systemTheme: ResolvedTheme) {
  return theme === "system" ? systemTheme : theme;
}

function readStoredTheme(storageKey: string, fallbackTheme: Theme): Theme {
  if (typeof window === "undefined") {
    return fallbackTheme;
  }

  const storedTheme = window.localStorage.getItem(storageKey);

  return storedTheme === "light" ||
    storedTheme === "dark" ||
    storedTheme === "system"
    ? storedTheme
    : fallbackTheme;
}

export function ThemeProvider(props: ThemeProviderProps) {
  const {
    children,
    defaultTheme = "system",
    enableSystem = true,
    disableTransitionOnChange = false,
    storageKey = THEME_STORAGE_KEY,
  } = props;

  const [theme, setTheme] = React.useState<Theme>(() =>
    readStoredTheme(storageKey, defaultTheme),
  );
  const [systemTheme, setSystemTheme] = React.useState<ResolvedTheme>(() =>
    getSystemTheme(),
  );

  React.useEffect(() => {
    if (!enableSystem || typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () =>
      setSystemTheme(mediaQuery.matches ? "dark" : "light");

    updateSystemTheme();
    mediaQuery.addEventListener("change", updateSystemTheme);

    return () => mediaQuery.removeEventListener("change", updateSystemTheme);
  }, [enableSystem]);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const resolvedTheme = getResolvedTheme(theme, systemTheme);
    const root = document.documentElement;

    if (disableTransitionOnChange) {
      const style = document.createElement("style");
      style.appendChild(
        document.createTextNode(
          "*,*::before,*::after{transition:none!important}",
        ),
      );
      document.head.appendChild(style);

      requestAnimationFrame(() => {
        document.head.removeChild(style);
      });
    }

    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
    window.localStorage.setItem(storageKey, theme);
  }, [disableTransitionOnChange, storageKey, systemTheme, theme]);

  const contextValue = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme: getResolvedTheme(theme, systemTheme),
      systemTheme,
      setTheme,
    }),
    [systemTheme, theme],
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
