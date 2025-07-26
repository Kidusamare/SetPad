import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import AIService from "../services/aiCacheService";

const AICacheStatus = ({ isDevelopment = false }) => {
    const { theme } = useTheme();
    const [cacheInfo, setCacheInfo] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isDevelopment) {
            updateCacheInfo();
        }
    }, [isDevelopment]);

    const updateCacheInfo = () => {
        const info = AIService.getCacheStatus();
        setCacheInfo(info);
    };

    const clearAllCache = () => {
        AIService.clearAllCache();
        updateCacheInfo();
    };

    const cleanExpiredCache = () => {
        AIService.cleanExpiredCache();
        updateCacheInfo();
    };

    if (!isDevelopment) {
        return null;
    }

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsVisible(!isVisible)}
                style={{
                    position: "fixed",
                    bottom: "1rem",
                    left: "1rem",
                    background: "rgba(0, 0, 0, 0.8)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.5rem 1rem",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    zIndex: 9999
                }}
            >
                AI Cache ({cacheInfo?.cacheSize || 0})
            </button>

            {/* Cache Status Panel */}
            {isVisible && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "4rem",
                        left: "1rem",
                        background: theme.cardBackground,
                        border: `1px solid ${theme.border}`,
                        borderRadius: "12px",
                        padding: "1rem",
                        maxWidth: "300px",
                        zIndex: 9998,
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                        fontSize: "0.8rem"
                    }}
                >
                    <h4 style={{
                        margin: "0 0 1rem 0",
                        color: theme.accent,
                        fontSize: "1rem"
                    }}>
                        AI Cache Status
                    </h4>

                    <div style={{ marginBottom: "1rem" }}>
                        <strong>Cache Entries: </strong>
                        <span style={{ color: theme.accent }}>
                            {cacheInfo?.cacheSize || 0}
                        </span>
                    </div>

                    {cacheInfo?.entries && cacheInfo.entries.length > 0 && (
                        <div style={{ marginBottom: "1rem" }}>
                            <strong>Cached APIs:</strong>
                            <ul style={{
                                margin: "0.5rem 0",
                                paddingLeft: "1rem",
                                listStyle: "disc"
                            }}>
                                {cacheInfo.entries.map((entry, index) => (
                                    <li key={index} style={{
                                        color: theme.textSecondary,
                                        fontSize: "0.7rem",
                                        marginBottom: "0.2rem"
                                    }}>
                                        {entry.split(':')[0]}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div style={{
                        display: "flex",
                        gap: "0.5rem",
                        flexWrap: "wrap"
                    }}>
                        <button
                            onClick={updateCacheInfo}
                            style={{
                                background: theme.accent,
                                color: theme.background,
                                border: "none",
                                borderRadius: "4px",
                                padding: "0.3rem 0.6rem",
                                fontSize: "0.7rem",
                                cursor: "pointer"
                            }}
                        >
                            Refresh
                        </button>
                        <button
                            onClick={cleanExpiredCache}
                            style={{
                                background: theme.surfaceSecondary,
                                color: theme.text,
                                border: `1px solid ${theme.border}`,
                                borderRadius: "4px",
                                padding: "0.3rem 0.6rem",
                                fontSize: "0.7rem",
                                cursor: "pointer"
                            }}
                        >
                            Clean Expired
                        </button>
                        <button
                            onClick={clearAllCache}
                            style={{
                                background: theme.danger,
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                padding: "0.3rem 0.6rem",
                                fontSize: "0.7rem",
                                cursor: "pointer"
                            }}
                        >
                            Clear All
                        </button>
                    </div>

                    <div style={{
                        marginTop: "1rem",
                        padding: "0.5rem",
                        background: theme.surfaceSecondary,
                        borderRadius: "6px",
                        fontSize: "0.7rem",
                        color: theme.textSecondary
                    }}>
                        <div>Cache Duration: 5 days</div>
                        <div>Rate Limit: 30 seconds</div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AICacheStatus;