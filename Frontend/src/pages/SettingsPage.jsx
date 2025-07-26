import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

export default function SettingsPage() {
  const { themeName, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState("");

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      setCurrentTime(timeString);
    };

    updateTime(); // Set initial time
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  
  return (
    <div style={{ 
      background: "var(--gradient-backdrop)", 
      minHeight: "100vh", 
      color: "var(--primary-100)", 
      padding: "2rem",
      paddingTop: "5rem",
      position: "relative"
    }}>
      
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        gap: "var(--space-4)",
        marginBottom: "var(--space-8)"
      }}>
        <div style={{
          background: "var(--gradient-primary)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ width: "32px", height: "32px" }}>
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </div>
        <h1 style={{ 
          fontSize: "var(--font-size-4xl)", 
          margin: 0,
          color: "var(--accent-primary)",
          fontWeight: 700,
          letterSpacing: "-0.02em"
        }}>
          Settings
        </h1>
      </div>

      <div style={{
        maxWidth: "800px", // Increased max width for better layout
        margin: "0 auto",
        padding: "0 2rem"
      }}>
        {/* UI Settings Section */}
        <div style={{
          background: "var(--glass-bg)",
          borderRadius: "var(--radius-2xl)",
          padding: "var(--space-8)",
          marginBottom: "var(--space-8)",
          border: "1px solid var(--glass-border)",
          backdropFilter: "var(--glass-backdrop)",
          WebkitBackdropFilter: "var(--glass-backdrop)",
          boxShadow: "var(--shadow-lg)"
        }}>
          <h2 style={{
            fontSize: "var(--font-size-2xl)",
            marginBottom: "var(--space-8)",
            color: "var(--accent-primary)",
            textAlign: "center",
            fontWeight: 600
          }}>
            UI Settings
          </h2>

          {/* Theme Toggle Section */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-8)"
          }}>
            <h3 style={{
              fontSize: "var(--font-size-xl)",
              marginBottom: "var(--space-4)",
              color: "var(--primary-100)",
              textAlign: "center",
              fontWeight: 500
            }}>
              Theme Preference
            </h3>

            {/* Theme Toggle Card */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "1rem"
            }}>
              <div style={{
                position: "relative",
                width: "18rem",
                height: "17rem",
                backgroundColor: themeName === "dark" ? "#26242E" : "#fff",
                boxShadow: "0 4px 35px rgba(0,0,0,.1)",
                borderRadius: "40px",
                display: "flex",
                flexDirection: "column",
                transition: "background-color 0.3s ease"
              }}>
                {/* Current Time Display */}
                <div style={{
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: themeName === "dark" ? "#fff" : "#000",
                  padding: "1rem 0",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center"
                }}>
                  {currentTime}
                </div>

                {/* Content */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  margin: "auto",
                  textAlign: "center",
                  width: "70%",
                  transform: "translateY(5%)"
                }}>
                  {/* Circle */}
                  <div style={{
                    position: "relative",
                    borderRadius: "100%",
                    width: "8rem",
                    height: "8rem",
                    background: themeName === "dark" 
                      ? "linear-gradient(40deg, #8983F7, #A3DAFB 70%)"
                      : "linear-gradient(40deg, #FF0080, #FF8C00 70%)",
                    margin: "auto",
                    transition: "background 0.6s cubic-bezier(0.645, 0.045, 0.355, 1)"
                  }}>
                    <div style={{
                      position: "absolute",
                      borderRadius: "100%",
                      right: 0,
                      width: "6rem",
                      height: "6rem",
                      background: themeName === "dark" ? "#26242E" : "#fff",
                      transform: themeName === "dark" ? "scale(1)" : "scale(0)",
                      transformOrigin: "top right",
                      transition: "transform 0.6s cubic-bezier(0.645, 0.045, 0.355, 1)"
                    }} />
                  </div>

                  {/* Toggle Switch */}
                  <label 
                    htmlFor="theme-switch"
                    style={{
                      height: "2.8rem",
                      width: "100%",
                      backgroundColor: "rgba(0,0,0,.1)",
                      borderRadius: "100px",
                      position: "relative",
                      margin: "1.8rem 0 4rem 0",
                      cursor: "pointer",
                      display: "block"
                    }}
                  >
                    <input
                      id="theme-switch"
                      type="checkbox"
                      checked={themeName === "dark"}
                      onChange={toggleTheme}
                      style={{ display: "none" }}
                    />
                    <div style={{
                      position: "absolute",
                      width: "50%",
                      height: "2.8rem",
                      backgroundColor: themeName === "dark" ? "#34323D" : "#fff",
                      boxShadow: "0 2px 15px rgba(0,0,0,.15)",
                      borderRadius: "100px",
                      transform: themeName === "dark" ? "translateX(100%)" : "translateX(0%)",
                      transition: "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                    }} />
                    <div style={{
                      fontSize: "90%",
                      fontWeight: "bold",
                      color: themeName === "dark" ? "#fff" : "#000",
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0 1.2rem",
                      userSelect: "none",
                      boxSizing: "border-box"
                    }}>
                      <span style={{ opacity: themeName === "dark" ? 0.5 : 1 }}>Light</span>
                      <span style={{ opacity: themeName === "dark" ? 1 : 0.5 }}>Dark</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <p style={{
              textAlign: "center",
              opacity: 0.7,
              fontSize: "var(--font-size-sm)",
              color: "var(--primary-400)",
              maxWidth: "400px",
              lineHeight: "1.5"
            }}>
              Toggle between light and dark themes for your fitness tracker. Dark mode is optimized for OLED screens.
            </p>
          </div>
        </div>

        {/* App Information Section */}
        <div style={{
          background: "var(--glass-bg)",
          borderRadius: "var(--radius-2xl)",
          padding: "var(--space-8)",
          border: "1px solid var(--glass-border)",
          backdropFilter: "var(--glass-backdrop)",
          WebkitBackdropFilter: "var(--glass-backdrop)",
          boxShadow: "var(--shadow-lg)"
        }}>
          <h2 style={{
            fontSize: "var(--font-size-2xl)",
            marginBottom: "var(--space-6)",
            color: "var(--accent-primary)",
            fontWeight: 600
          }}>
            App Information
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--space-4)"
          }}>
            <div style={{
              padding: "var(--space-4)",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--glass-border)"
            }}>
              <strong style={{ color: "var(--accent-primary)", display: "block", marginBottom: "var(--space-2)" }}>Version</strong>
              <span style={{ color: "var(--primary-300)" }}>1.0.0</span>
            </div>
            <div style={{
              padding: "var(--space-4)",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--glass-border)"
            }}>
              <strong style={{ color: "var(--accent-primary)", display: "block", marginBottom: "var(--space-2)" }}>Built with</strong>
              <span style={{ color: "var(--primary-300)" }}>React, FastAPI</span>
            </div>
            <div style={{
              padding: "var(--space-4)",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--glass-border)"
            }}>
              <strong style={{ color: "var(--accent-primary)", display: "block", marginBottom: "var(--space-2)" }}>Deployed on</strong>
              <span style={{ color: "var(--primary-300)" }}>Local</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 