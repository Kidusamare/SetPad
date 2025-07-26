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
      

      {/* Top Navigation Buttons Container */}
      <div className="notes-nav" style={{
        position: "fixed",
        top: "12px",
        right: "12px",
        left: "12px",
        display: "flex",
        gap: "8px",
        zIndex: 1000,
        opacity: showTopButtons ? 1 : 0,
        transform: showTopButtons ? "translateY(0)" : "translateY(-10px)",
        pointerEvents: showTopButtons ? "auto" : "none",
        transition: "all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)",
        flexWrap: windowWidth <= 768 ? "wrap" : "nowrap",
        justifyContent: "flex-end",
        borderRadius: "12px",
        padding: "8px 12px"
      }}>
        {/* Search Button */}
        <button
          className="notes-nav-item"
          onClick={handleSearch}
          style={{
            fontSize: windowWidth <= 768 ? "0.85rem" : "0.9rem",
            minHeight: windowWidth <= 768 ? "36px" : "40px",
            whiteSpace: "nowrap"
          }}
        >
          {windowWidth <= 768 ? "🔍" : "Search"}
        </button>

        {/* Progress Button */}
        <button
          className="notes-nav-item"
          onClick={handleProgress}
          style={{
            fontSize: windowWidth <= 768 ? "0.85rem" : "0.9rem",
            minHeight: windowWidth <= 768 ? "36px" : "40px",
            whiteSpace: "nowrap"
          }}
        >
          {windowWidth <= 768 ? "📊" : "Progress"}
        </button>
        
        {/* AI Coaching Button */}
        <button
          className="notes-nav-item"
          onClick={handleAICoaching}
          style={{
            fontSize: windowWidth <= 768 ? "0.85rem" : "0.9rem",
            minHeight: windowWidth <= 768 ? "36px" : "40px",
            whiteSpace: "nowrap"
          }}
        >
          {windowWidth <= 768 ? "🤖" : "AI Coach"}
        </button>
        {/* Import Data Button*/}
        <button
          className="notes-nav-item"
          onClick={() => navigate("/import-data")}
          style={{
            fontSize: windowWidth <= 768 ? "0.85rem" : "0.9rem",
            minHeight: windowWidth <= 768 ? "36px" : "40px",
            whiteSpace: "nowrap"
          }}
        >
          {windowWidth <= 768 ? "📥" : "Import"}
        </button>

        {/* Settings Button */}
        <button
          className="notes-nav-item"
          onClick={handleSettings}
          style={{
            fontSize: windowWidth <= 768 ? "0.85rem" : "0.9rem",
            minHeight: windowWidth <= 768 ? "36px" : "40px",
            whiteSpace: "nowrap",
            opacity: 0.7
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
        className="notes-card"
        onClick={handleOpenSaved}
        style={{
          overflow: "hidden",
          position: "relative",
          cursor: "pointer",
          marginBottom: "2rem"
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
            top: "16px",
            left: "16px",
            background: "rgba(255, 255, 255, 0.9)",
            color: "rgba(0, 122, 255, 1)",
            fontWeight: "600",
            padding: "8px 12px",
            borderRadius: "8px",
            fontSize: "0.85rem",
            border: "1px solid rgba(0, 122, 255, 0.2)",
            backdropFilter: "blur(10px)"
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
