"use client";
import { createContext, useContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

export function ThemeContextProvider({ children }) {
    const [theme, setTheme] = useState("light");

    // Load theme from storage
    useEffect(() => {
        const storedTheme = localStorage.getItem("theme") || "dark";
        setTheme(storedTheme);
    }, []);

    // Apply theme to DOM when changed
    useEffect(() => {
        if (!theme) return;

        localStorage.setItem("theme", theme);

        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useThemeContext() {
    return useContext(ThemeContext);
}
