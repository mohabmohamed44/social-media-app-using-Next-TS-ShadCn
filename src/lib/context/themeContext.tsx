"use client";
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
    const storedTheme = localStorage.getItem("theme") as theme;
    if (storedTheme) {
      setTheme(storedTheme);
    }
    document.documentElement.setAttribute("data-theme", storedTheme || "light");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    setTheme(newTheme);
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
