import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import SavedTablesPage from "../components/SavedTablesPage";
import TrainingLogManager from "../components/TrainingLogManager";
import Logo from "../components/Logo";
import ImportPanel from "../components/ImportPanel";
import AIInsightsPanel from "../components/AIInsightsPanel";

const manager = new TrainingLogManager();

export default function Dashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isHoveringNewLog, setIsHoveringNewLog] = useState(false);
  const [showTopButtons, setShowTopButtons] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Window resize detection
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll detection for top buttons
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show buttons if at top of page or scrolling up
      const isAtTop = currentScrollY < 50;
      const isScrollingUp = currentScrollY < lastScrollY;
      
      setShowTopButtons(isAtTop || isScrollingUp);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleOpenSaved = () => {
    navigate("/log");
  };

  const handleNewLog = async () => {
    const newTable = manager.createNewTable();
    await manager.createTable(newTable);
    navigate(`/log/${newTable.id}`);
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  const handleAICoaching = () => {
    navigate("/ai-coaching");
  };
  
  const handleProgress = () => {
    navigate("/progress");
  };

  const handleSearch = () => {
    navigate("/search");
  };

  return (
    <div style={{ 
      background: theme.background, 
      minHeight: "100vh", 
      color: theme.text, 
      padding: "1rem",
      paddingTop: "4rem",
      position: "relative",
      transition: "background-color 0.3s ease, color 0.3s ease"
    }}>
      {/* Import Data Panel */}
      <ImportPanel onClick={() => navigate("/import-data")} />

      {/* Hamburger Menu */}
      <button
        onClick={handleSettings}
        style={{
          position: "fixed",
          top: "1rem",
          left: "1rem",
          background: theme.accentSecondary,
          color: theme.accent,
          padding: "0.7rem",
          border: "none",
          borderRadius: "10px",
          fontWeight: "600",
          fontSize: "1rem",
          cursor: "pointer",
          zIndex: 1000,
          transition: "all 0.3s ease",
          width: "50px",
          height: "50px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          opacity: showTopButtons ? 1 : 0,
          transform: showTopButtons ? "translateY(0)" : "translateY(-10px)",
          pointerEvents: showTopButtons ? "auto" : "none"
        }}
        onMouseOver={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)"}
        onMouseOut={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
      >
        <div style={{
          width: "20px",
          height: "2px",
          background: theme.accent,
          borderRadius: "1px",
          transition: "background 0.2s ease"
        }} />
        <div style={{
          width: "20px",
          height: "2px",
          background: theme.accent,
          borderRadius: "1px",
          transition: "background 0.2s ease"
        }} />
        <div style={{
          width: "20px",
          height: "2px",
          background: theme.accent,
          borderRadius: "1px",
          transition: "background 0.2s ease"
        }} />
      </button>

      {/* Top Navigation Buttons Container */}
      <div style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        display: "flex",
        gap: "0.5rem",
        zIndex: 1000,
        opacity: showTopButtons ? 1 : 0,
        transform: showTopButtons ? "translateY(0)" : "translateY(-10px)",
        pointerEvents: showTopButtons ? "auto" : "none",
        transition: "all 0.3s ease",
        flexWrap: windowWidth <= 768 ? "wrap" : "nowrap",
        justifyContent: "flex-end",
        maxWidth: windowWidth <= 768 ? "200px" : "300px"
      }}>
        {/* Search Button */}
        <button
          onClick={handleSearch}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            color: theme.accent,
            padding: windowWidth <= 768 ? "0.5rem 0.8rem" : "0.7rem 1rem",
            border: `1px solid rgba(255, 255, 255, 0.2)`,
            borderRadius: "8px",
            backdropFilter: "blur(20px)",
            fontWeight: "600",
            fontSize: windowWidth <= 768 ? "0.8rem" : "0.9rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
            minHeight: "40px",
            whiteSpace: "nowrap"
          }}
          onMouseOver={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)"}
          onMouseOut={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
        >
          {windowWidth <= 768 ? "🔍" : "Search"}
        </button>

        {/* Progress Button */}
        <button
          onClick={handleProgress}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            color: theme.accent,
            padding: windowWidth <= 768 ? "0.5rem 0.8rem" : "0.7rem 1rem",
            border: `1px solid rgba(255, 255, 255, 0.2)`,
            borderRadius: "8px",
            backdropFilter: "blur(20px)",
            fontWeight: "600",
            fontSize: windowWidth <= 768 ? "0.8rem" : "0.9rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
            minHeight: "40px",
            whiteSpace: "nowrap"
          }}
          onMouseOver={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)"}
          onMouseOut={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
        >
          {windowWidth <= 768 ? "📊" : "Progress"}
        </button>
        
        {/* AI Coaching Button */}
        <button
          onClick={handleAICoaching}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            color: theme.accent,
            padding: windowWidth <= 768 ? "0.5rem 0.8rem" : "0.7rem 1rem",
            border: `1px solid rgba(255, 255, 255, 0.2)`,
            borderRadius: "8px",
            backdropFilter: "blur(20px)",
            fontWeight: "600",
            fontSize: windowWidth <= 768 ? "0.8rem" : "0.9rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
            minHeight: "40px",
            whiteSpace: "nowrap"
          }}
          onMouseOver={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)"}
          onMouseOut={e => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
        >
          {windowWidth <= 768 ? "🤖" : "AI Coach"}
        </button>

        {/* Settings Button */}
        <button
          onClick={handleSettings}
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            color: theme.textSecondary,
            padding: windowWidth <= 768 ? "0.5rem 0.8rem" : "0.7rem 1rem",
            border: `1px solid rgba(255, 255, 255, 0.1)`,
            borderRadius: "8px",
            backdropFilter: "blur(20px)",
            fontWeight: "600",
            fontSize: windowWidth <= 768 ? "0.8rem" : "0.9rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
            minHeight: "40px",
            whiteSpace: "nowrap"
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
          }}
        >
          {windowWidth <= 768 ? "⚙️" : "Settings"}
        </button>
      </div>

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: windowWidth <= 768 ? "1.5rem" : "2rem",
        gap: windowWidth <= 768 ? "0.75rem" : "1rem",
        flexDirection: windowWidth <= 480 ? "column" : "row",
        textAlign: "center"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: windowWidth <= 768 ? "50px" : "60px",
          height: windowWidth <= 768 ? "50px" : "60px",
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
          borderRadius: "16px",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 12px 25px rgba(0, 0, 0, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.2)";
        }}
        >
          <Logo />
        </div>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start"
        }}>
          <h1 style={{ 
            fontSize: windowWidth <= 768 ? "1.8rem" : "2.2rem", 
            margin: 0,
            color: theme.accent,
            fontWeight: "700",
            transition: "color 0.3s ease"
          }}>
            SetPad
          </h1>
          <p style={{
            fontSize: windowWidth <= 768 ? "0.9rem" : "1rem",
            margin: 0,
            color: theme.textSecondary,
            fontWeight: "500",
            transition: "color 0.3s ease"
          }}>
            Your Fitness Journey
          </p>
        </div>
      </div>

      {/* Centered New Log Button */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "3rem"
      }}>
        <div style={{
          position: "relative",
          width: windowWidth <= 768 ? "180px" : "200px",
          height: windowWidth <= 768 ? "60px" : "70px",
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
          borderRadius: "50px",
          border: "none",
          outline: "none",
          cursor: "pointer",
          boxShadow: "0 15px 30px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
          transition: "transform 0.3s ease"
        }}
        onMouseEnter={() => setIsHoveringNewLog(true)}
        onMouseLeave={() => setIsHoveringNewLog(false)}
        onClick={handleNewLog}
        >
          <span style={{
            position: "absolute",
            width: "100%",
            top: isHoveringNewLog ? "-100%" : "50%",
            left: 0,
            transform: "translateY(-50%)",
            fontSize: "16px",
            textTransform: "uppercase",
            letterSpacing: "1px",
            color: "#fff",
            fontWeight: "600",
            textAlign: "center",
            transition: "top 0.5s ease"
          }}>
            New Log
          </span>
          <span style={{
            position: "absolute",
            width: "100%",
            top: isHoveringNewLog ? "50%" : "150%",
            left: 0,
            transform: "translateY(-50%)",
            fontSize: "16px",
            textTransform: "uppercase",
            letterSpacing: "1px",
            color: "#fff",
            fontWeight: "600",
            textAlign: "center",
            transition: "top 0.5s ease"
          }}>
            Let's Begin
          </span>
        </div>
      </div>

      <div
        onClick={handleOpenSaved}
        style={{
          overflow: "hidden",
          borderRadius: "16px",
          border: `1px solid rgba(255, 255, 255, 0.1)`,
          position: "relative",
          cursor: "pointer",
          transition: "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
          marginBottom: "2rem",
          background: "rgba(255, 255, 255, 0.02)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.02)";
          e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.1)";
        }}
      >
        <div style={{ 
          pointerEvents: "none", 
          opacity: 0.8, 
          maxHeight: "400px", 
          overflow: "hidden" 
        }}>
          <SavedTablesPage previewMode={true} />
        </div>
        <div
          style={{
            position: "absolute",
            top: "1rem",
            left: "1rem",
            background: theme.background,
            color: theme.accent,
            fontWeight: "bold",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            fontSize: "0.9rem",
            transition: "background-color 0.3s ease, color 0.3s ease"
          }}
        >
          Open Saved Logs →
        </div>
      </div>

      {/* AI Insights Panel */}
      <AIInsightsPanel />
    </div>
  );
}
