"use client";
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button";

export function ModeToggle() {
    const { setTheme, resolvedTheme } = useTheme()

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="site-theme-toggle"
            aria-label="Toggle color theme"
        >
            <Moon className="site-theme-moon" aria-hidden="true" />
            <Sun className="site-theme-sun" aria-hidden="true" />
        </Button>
    )
}
