import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

// Theme definitions
const themes = {
  dark: {
    name: "dark",
    background: "#000000", // Full black for OLED
    surface: "#1e1e1e",
    surfaceSecondary: "#2a2a2a",
    surfaceTertiary: "#333333",
    text: "#f5f6fa",
    textSecondary: "#bfc7d5",
    textMuted: "#888888",
    accent: "#3b82f6", // Blue accent instead of gold
    accentSecondary: "#1e3a8a", // Darker blue
    accentHover: "#2563eb", // Blue hover
    primary: "#3b82f6", // Blue for buttons
    primaryHover: "#2563eb",
    danger: "#ff4d4f",
    dangerHover: "#ff7875",
    border: "#333333",
    borderLight: "#444444",
    shadow: "0 8px 32px rgba(0,0,0,0.3)",
    shadowLight: "0 4px 16px rgba(0,0,0,0.25)",
    inputBackground: "#2a2a2a",
    inputBorder: "#333333",
    inputFocus: "#3b82f6", // Blue focus
    cardBackground: "#1e1e1e",
    cardBorder: "#333333",
    success: "#10b981",
    warning: "#f59e0b",
    info: "#3b82f6"
  },
  light: {
    name: "light",
    background: "#f8f6f1", // Soft paper-like off-white
    surface: "#fefefe", // Slightly off-white
    surfaceSecondary: "#f5f3ee", // Warmer paper tone
    surfaceTertiary: "#ebe8e0", // Even warmer for depth
    text: "#2d2d2d", // Softer dark text
    textSecondary: "#5a5a5a", // Muted gray
    textMuted: "#8a8a8a", // Light gray
    accent: "#ff6b35", // Orange accent
    accentSecondary: "#f5f3ee", // Paper-like background
    accentHover: "#e55a2b", // Darker orange
    primary: "#ff6b35", // Orange for buttons
    primaryHover: "#e55a2b",
    danger: "#dc3545",
    dangerHover: "#c82333",
    border: "#d4d0c8", // Warm border color
    borderLight: "#e8e4dc", // Lighter warm border
    shadow: "0 8px 32px rgba(0,0,0,0.08)",
    shadowLight: "0 4px 16px rgba(0,0,0,0.06)",
    inputBackground: "#fefefe", // Clean white
    inputBorder: "#d4d0c8", // Warm border
    inputFocus: "#ff6b35", // Orange focus
    cardBackground: "#fefefe", // Clean white
    cardBorder: "#d4d0c8", // Warm border
    success: "#28a745",
    warning: "#ffc107",
    info: "#17a2b8"
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("dark"); // Default to dark mode
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("fitness-tracker-theme");
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
    }
    setIsLoading(false);
  }, []);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("fitness-tracker-theme", theme);
      // Apply theme to document body for smooth transitions
      document.body.style.backgroundColor = themes[theme].background;
      document.body.style.color = themes[theme].text;
      document.body.style.transition = "background-color 0.3s ease, color 0.3s ease";
    }
  }, [theme, isLoading]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === "dark" ? "light" : "dark");
  };

  const value = {
    theme: themes[theme],
    themeName: theme,
    toggleTheme,
    isLoading
  };

  if (isLoading) {
    return (
      <div style={{ 
        background: themes.dark.background, 
        color: themes.dark.text,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        Loading...
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}; 