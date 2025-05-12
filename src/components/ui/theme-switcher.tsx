
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

interface ThemeSwitcherProps {
  className?: string;
  variant?: "default" | "ghost" | "outline" | "secondary" | "link" | "destructive";
}

export function ThemeSwitcher({ className, variant = "ghost" }: ThemeSwitcherProps) {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button
      variant={variant}
      size="icon"
      onClick={toggleTheme}
      className={className}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
