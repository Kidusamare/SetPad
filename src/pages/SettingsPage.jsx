import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { auth } from "../utils/auth";
import { 
  updatePassword, 
  deleteUser, 
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut 
} from "firebase/auth";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, themeName, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState("");
  const [user, setUser] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [deleteForm, setDeleteForm] = useState({
    password: "",
    confirmText: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showBackButton, setShowBackButton] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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

  // Get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Scroll detection for back button
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show button if at top of page or scrolling up
      const isAtTop = currentScrollY < 50;
      const isScrollingUp = currentScrollY < lastScrollY;
      
      setShowBackButton(isAtTop || isScrollingUp);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ text: "New passwords don't match", type: "error" });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setMessage({ text: "Password must be at least 6 characters", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, passwordForm.currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordForm.newPassword);
      setMessage({ text: "Password updated successfully!", type: "success" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    }
    setLoading(false);
  };

  const handleAccountDeletion = async (e) => {
    e.preventDefault();
    if (deleteForm.confirmText !== "DELETE") {
      setMessage({ text: "Please type DELETE to confirm", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, deleteForm.password);
      await reauthenticateWithCredential(user, credential);
      await deleteUser(user);
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    }
    setLoading(false);
  };

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
          transition: "all 0.3s ease",
          opacity: showBackButton ? 1 : 0,
          transform: showBackButton ? "translateY(0)" : "translateY(-10px)",
          pointerEvents: showBackButton ? "auto" : "none"
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

          {/* Message Display */}
          {message.text && (
            <div style={{
              padding: "1rem",
              borderRadius: "10px",
              marginBottom: "1.5rem",
              background: message.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
              border: `1px solid ${message.type === "success" ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
              color: message.type === "success" ? "#22c55e" : "#ef4444"
            }}>
              {message.text}
            </div>
          )}

          {/* User Information */}
          {user && (
            <div style={{
              background: theme.surfaceSecondary,
              padding: "1.5rem",
              borderRadius: "12px",
              marginBottom: "2rem",
              border: `1px solid ${theme.borderLight}`
            }}>
              <h3 style={{
                fontSize: "1.2rem",
                marginBottom: "1rem",
                color: theme.accent,
                transition: "color 0.3s ease"
              }}>
                Account Information
              </h3>
              <div style={{
                display: "grid",
                gap: "0.8rem"
              }}>
                <div>
                  <strong style={{ color: theme.textSecondary, fontSize: "0.9rem" }}>Email:</strong>
                  <div style={{ color: theme.text, fontSize: "1rem" }}>{user.email}</div>
                </div>
                <div>
                  <strong style={{ color: theme.textSecondary, fontSize: "0.9rem" }}>Account Created:</strong>
                  <div style={{ color: theme.text, fontSize: "1rem" }}>
                    {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "Unknown"}
                  </div>
                </div>
                <div>
                  <strong style={{ color: theme.textSecondary, fontSize: "0.9rem" }}>Last Sign In:</strong>
                  <div style={{ color: theme.text, fontSize: "1rem" }}>
                    {user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : "Unknown"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Password Change Section */}
          <div style={{
            background: theme.surfaceSecondary,
            padding: "1.5rem",
            borderRadius: "12px",
            marginBottom: "2rem",
            border: `1px solid ${theme.borderLight}`
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: showPasswordForm ? "1rem" : 0
            }}>
              <h3 style={{
                fontSize: "1.2rem",
                color: theme.accent,
                margin: 0,
                transition: "color 0.3s ease"
              }}>
                Change Password
              </h3>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                style={{
                  background: theme.accentSecondary,
                  color: theme.accent,
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  transition: "background 0.2s ease"
                }}
                onMouseOver={e => e.currentTarget.style.background = theme.accentHover}
                onMouseOut={e => e.currentTarget.style.background = theme.accentSecondary}
              >
                {showPasswordForm ? "Cancel" : "Change"}
              </button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} style={{ marginTop: "1rem" }}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: theme.textSecondary,
                    fontSize: "0.9rem"
                  }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.8rem",
                      borderRadius: "8px",
                      border: `1px solid ${theme.inputBorder}`,
                      background: theme.inputBackground,
                      color: theme.text,
                      fontSize: "1rem"
                    }}
                    required
                  />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: theme.textSecondary,
                    fontSize: "0.9rem"
                  }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.8rem",
                      borderRadius: "8px",
                      border: `1px solid ${theme.inputBorder}`,
                      background: theme.inputBackground,
                      color: theme.text,
                      fontSize: "1rem"
                    }}
                    required
                  />
                </div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: theme.textSecondary,
                    fontSize: "0.9rem"
                  }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.8rem",
                      borderRadius: "8px",
                      border: `1px solid ${theme.inputBorder}`,
                      background: theme.inputBackground,
                      color: theme.text,
                      fontSize: "1rem"
                    }}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: theme.accent,
                    color: theme.background,
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.8rem 1.5rem",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    fontSize: "1rem",
                    opacity: loading ? 0.7 : 1,
                    transition: "background 0.2s ease"
                  }}
                  onMouseOver={e => {
                    if (!loading) e.currentTarget.style.background = theme.accentHover;
                  }}
                  onMouseOut={e => {
                    if (!loading) e.currentTarget.style.background = theme.accent;
                  }}
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}
          </div>

          {/* Account Deletion Section */}
          <div style={{
            background: "rgba(239, 68, 68, 0.05)",
            padding: "1.5rem",
            borderRadius: "12px",
            border: "1px solid rgba(239, 68, 68, 0.2)"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: showDeleteForm ? "1rem" : 0
            }}>
              <div>
                <h3 style={{
                  fontSize: "1.2rem",
                  color: "#ef4444",
                  margin: 0,
                  marginBottom: "0.5rem"
                }}>
                  Delete Account
                </h3>
                <p style={{
                  fontSize: "0.9rem",
                  color: theme.textSecondary,
                  margin: 0
                }}>
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteForm(!showDeleteForm)}
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#ef4444",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "8px",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  transition: "background 0.2s ease"
                }}
                onMouseOver={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"}
                onMouseOut={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
              >
                {showDeleteForm ? "Cancel" : "Delete"}
              </button>
            </div>

            {showDeleteForm && (
              <form onSubmit={handleAccountDeletion} style={{ marginTop: "1rem" }}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: theme.textSecondary,
                    fontSize: "0.9rem"
                  }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={deleteForm.password}
                    onChange={(e) => setDeleteForm({...deleteForm, password: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.8rem",
                      borderRadius: "8px",
                      border: `1px solid ${theme.inputBorder}`,
                      background: theme.inputBackground,
                      color: theme.text,
                      fontSize: "1rem"
                    }}
                    required
                  />
                </div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: theme.textSecondary,
                    fontSize: "0.9rem"
                  }}>
                    Type "DELETE" to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteForm.confirmText}
                    onChange={(e) => setDeleteForm({...deleteForm, confirmText: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "0.8rem",
                      borderRadius: "8px",
                      border: `1px solid ${theme.inputBorder}`,
                      background: theme.inputBackground,
                      color: theme.text,
                      fontSize: "1rem"
                    }}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.8rem 1.5rem",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    fontSize: "1rem",
                    opacity: loading ? 0.7 : 1,
                    transition: "background 0.2s ease"
                  }}
                  onMouseOver={e => {
                    if (!loading) e.currentTarget.style.background = "#dc2626";
                  }}
                  onMouseOut={e => {
                    if (!loading) e.currentTarget.style.background = "#ef4444";
                  }}
                >
                  {loading ? "Deleting..." : "Permanently Delete Account"}
                </button>
              </form>
            )}
          </div>
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