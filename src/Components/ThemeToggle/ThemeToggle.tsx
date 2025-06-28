"use client";
import { useTheme } from "@/lib/context/themeContext";
import { Moon, Sun } from "lucide-react";
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-4xl ${theme === "dark" ? "dark" : ""}`}
      onClick={toggleTheme}
    >
      {theme === "light" ? <Moon /> : <Sun />}
    </button>
  );
}
