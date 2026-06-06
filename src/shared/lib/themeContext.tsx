"use client";
import Cookies from "js-cookie";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type theme = "light" | "dark";

interface themeContextType {
  theme: theme;
  toggleTheme: () => void;
}

const themeContext = createContext<themeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<theme>("light");

  // useEffect for theme
  useEffect(() => {
    const storedTheme = typeof Cookies !== "undefined" ? Cookies.get("theme") as theme | null : null;
    const initialTheme = storedTheme || "light";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (typeof Cookies !== "undefined") {
      Cookies.set("theme", newTheme);
    }
    document.documentElement.setAttribute("data-theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <themeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </themeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(themeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeContext.Provider");
  }
  return context;
};
