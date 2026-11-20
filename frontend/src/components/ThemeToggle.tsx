"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme, Theme } from "@/providers/ThemeProvider";

interface ThemeToggleProps {
  variant?: "segmented" | "dropdown" | "compact";
  className?: string;
}

export function ThemeToggle({ variant = "segmented", className = "" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by rendering a neutral placeholder until mounted
  if (!mounted) {
    return (
      <div className={`flex items-center rounded-xl bg-slate-100 dark:bg-[#101010] p-1 border border-slate-200 dark:border-[#262626] h-9 w-[108px] ${className}`} />
    );
  }

  const options: { value: Theme; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "system", label: "System", icon: Laptop },
    { value: "dark", label: "Dark", icon: Moon },
  ];

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={() => {
          if (theme === "light") setTheme("dark");
          else if (theme === "dark") setTheme("system");
          else setTheme("light");
        }}
        title={`Theme: ${theme} (resolved: ${resolvedTheme})`}
        aria-label={`Current theme is ${theme}. Click to switch theme.`}
        className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[#E7ECF2] dark:border-[#262626] bg-white dark:bg-[#101010] text-[#475569] dark:text-[#D4D4D4] hover:text-[#0F172A] dark:hover:text-[#FFFFFF] hover:border-[#CBD5E1] dark:hover:border-[#333333] shadow-sm transition-all duration-200 ${className}`}
      >
        {resolvedTheme === "dark" ? (
          <Moon className="w-4 h-4 text-[#3563FF]" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </button>
    );
  }

  // Premium AMOLED Segmented Pill Selector
  return (
    <div
      role="radiogroup"
      aria-label="Color Theme"
      className={`inline-flex items-center p-1 rounded-xl bg-[#F1F5F9] dark:bg-[#101010] border border-[#E2E8F0] dark:border-[#262626] shadow-inner transition-colors duration-200 ${className}`}
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(opt.value)}
            title={`${opt.label} mode`}
            className={`relative flex items-center justify-center p-1.5 px-2 rounded-lg text-xs font-medium transition-all duration-150 ${
              isActive
                ? "bg-white dark:bg-[#171717] text-[#0F172A] dark:text-[#FFFFFF] shadow-sm border border-[#E2E8F0] dark:border-[#333333]"
                : "text-[#64748B] dark:text-[#A3A3A3] hover:text-[#0F172A] dark:hover:text-[#FFFFFF]"
            }`}
          >
            <Icon
              className={`w-3.5 h-3.5 ${
                isActive && opt.value === "light"
                  ? "text-amber-500"
                  : isActive && opt.value === "dark"
                  ? "text-[#3563FF]"
                  : isActive
                  ? "text-[#3563FF] dark:text-[#3563FF]"
                  : ""
              }`}
            />
            <span className="sr-only">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
