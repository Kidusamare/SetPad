import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, themeName, toggleTheme } = useTheme();

  return (
    <div style={{ 
      background: theme.background, 
      minHeight: "100vh", 
      color: theme.text, 
      padding: "2rem",
      paddingTop: "5rem",
      position: "relative",
      transition: "background-color 0.3s ease, color 0.3s ease"
    }}>
      {/* Back to Dashboard Button */}
      <button
        onClick={() => navigate("/")}
        style={{
          position: "fixed",
          top: "1rem",
          left: "1rem",
          background: theme.accentSecondary,
          color: theme.accent,
          padding: "0.7rem 1.4rem",
          border: "none",
          borderRadius: "10px",
          fontWeight: "600",
          fontSize: "1rem",
          cursor: "pointer",
          zIndex: 1000,
          transition: "background 0.2s ease"
        }}
        onMouseOver={e => e.currentTarget.style.background = theme.accentHover}
        onMouseOut={e => e.currentTarget.style.background = theme.accentSecondary}
      >
        ← Back to Dashboard
      </button>

      <h1 style={{ 
        fontSize: "2.5rem", 
        marginBottom: "2rem",
        color: theme.accent,
        textAlign: "center",
        transition: "color 0.3s ease"
      }}>
        Settings
      </h1>

      <div style={{
        maxWidth: "800px", // Increased max width for better layout
        margin: "0 auto",
        padding: "0 2rem"
      }}>
        {/* UI Settings Section */}
        <div style={{
          background: theme.cardBackground,
          borderRadius: "20px",
          padding: "2rem",
          marginBottom: "2rem",
          border: `1px solid ${theme.cardBorder}`,
          boxShadow: theme.shadow,
          transition: "background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease"
        }}>
          <h2 style={{
            fontSize: "1.8rem",
            marginBottom: "2rem",
            color: theme.accent,
            textAlign: "center",
            transition: "color 0.3s ease"
          }}>
            UI Settings
          </h2>

          {/* Theme Toggle Section */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2rem"
          }}>
            <h3 style={{
              fontSize: "1.3rem",
              marginBottom: "1rem",
              color: theme.text,
              textAlign: "center",
              transition: "color 0.3s ease"
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
                {/* Phone Menu */}
                <div style={{
                  fontSize: "80%",
                  opacity: 0.4,
                  padding: "0.8rem 1.8rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div style={{ color: themeName === "dark" ? "#fff" : "#000" }}>4:20</div>
                  <div style={{ display: "flex", marginTop: "0.5rem" }}>
                    <div style={{
                      width: 0,
                      height: 0,
                      borderStyle: "solid",
                      borderWidth: "0 6.8px 7.2px 6.8px",
                      borderColor: themeName === "dark" ? "transparent transparent white transparent" : "transparent transparent black transparent",
                      transform: "rotate(135deg)",
                      margin: "0.12rem 0.5rem"
                    }} />
                    <div style={{
                      width: "0.85rem",
                      height: "0.45rem",
                      backgroundColor: themeName === "dark" ? "#fff" : "#000"
                    }} />
                  </div>
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
              fontSize: "0.9rem",
              color: theme.textSecondary,
              transition: "color 0.3s ease",
              maxWidth: "400px",
              lineHeight: "1.5"
            }}>
              Toggle between light and dark themes for your fitness tracker. Dark mode is optimized for OLED screens.
            </p>
          </div>
        </div>

        {/* Account Settings Section */}
        <div style={{
          background: theme.cardBackground,
          borderRadius: "20px",
          padding: "2rem",
          marginBottom: "2rem",
          border: `1px solid ${theme.cardBorder}`,
          boxShadow: theme.shadow,
          transition: "background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease"
        }}>
          <h2 style={{
            fontSize: "1.8rem",
            marginBottom: "1.5rem",
            color: theme.accent,
            transition: "color 0.3s ease"
          }}>
            Account Settings
          </h2>
          <p style={{ 
            opacity: 0.7, 
            marginBottom: "1rem",
            color: theme.textSecondary,
            transition: "color 0.3s ease",
            lineHeight: "1.5"
          }}>
            More account settings will be available here soon.
          </p>
        </div>

        {/* App Information Section */}
        <div style={{
          background: theme.cardBackground,
          borderRadius: "20px",
          padding: "2rem",
          border: `1px solid ${theme.cardBorder}`,
          boxShadow: theme.shadow,
          transition: "background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease"
        }}>
          <h2 style={{
            fontSize: "1.8rem",
            marginBottom: "1.5rem",
            color: theme.accent,
            transition: "color 0.3s ease"
          }}>
            App Information
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem"
          }}>
            <div style={{
              padding: "1rem",
              background: theme.surfaceSecondary,
              borderRadius: "10px",
              border: `1px solid ${theme.borderLight}`,
              transition: "background-color 0.3s ease, border-color 0.3s ease"
            }}>
              <strong style={{ color: theme.accent, display: "block", marginBottom: "0.5rem" }}>Version</strong>
              <span style={{ color: theme.textSecondary }}>1.0.0</span>
            </div>
            <div style={{
              padding: "1rem",
              background: theme.surfaceSecondary,
              borderRadius: "10px",
              border: `1px solid ${theme.borderLight}`,
              transition: "background-color 0.3s ease, border-color 0.3s ease"
            }}>
              <strong style={{ color: theme.accent, display: "block", marginBottom: "0.5rem" }}>Built with</strong>
              <span style={{ color: theme.textSecondary }}>React, Firebase, Firestore</span>
            </div>
            <div style={{
              padding: "1rem",
              background: theme.surfaceSecondary,
              borderRadius: "10px",
              border: `1px solid ${theme.borderLight}`,
              transition: "background-color 0.3s ease, border-color 0.3s ease"
            }}>
              <strong style={{ color: theme.accent, display: "block", marginBottom: "0.5rem" }}>Deployed on</strong>
              <span style={{ color: theme.textSecondary }}>Vercel</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 