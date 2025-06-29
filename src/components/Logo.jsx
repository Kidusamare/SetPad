import React from 'react';
import { useTheme } from "../context/ThemeContext";

const Logo = ({ size = 60 }) => {
  const { theme } = useTheme();
  
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      position: "relative"
    }}>
      {/* Folder body */}
      <div style={{
        width: "100%",
        height: "75%",
        background: theme.accent,
        borderRadius: "8px",
        borderTopLeftRadius: "4px",
        borderTopRightRadius: "4px",
        position: "absolute",
        bottom: 0
      }} />
      
      {/* Folder tab */}
      <div style={{
        width: "60%",
        height: "25%",
        background: theme.accent,
        borderRadius: "8px",
        borderBottomLeftRadius: "0",
        borderBottomRightRadius: "0",
        position: "absolute",
        top: 0,
        left: "20%"
      }} />
    </div>
  );
};

export default Logo; 