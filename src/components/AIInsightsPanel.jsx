import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const AIInsightsPanel = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [insights, setInsights] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAIInsights();
    }, []);

    const fetchAIInsights = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/ai-coaching/workout-analysis`);
            
            if (!response.ok) {
                throw new Error("Failed to fetch AI insights");
            }
            
            const data = await response.json();
            setInsights(data);
        } catch (err) {
            console.error("Error fetching AI insights:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChatWithAI = () => {
        navigate("/ai-coaching");
    };

    const formatInsightText = (text) => {
        // Split by numbered points and format nicely
        const points = text.split(/\d+\.\s+/).filter(point => point.trim());
        return points.map((point, index) => (
            <div key={index} style={{
                marginBottom: "0.8rem",
                padding: "0.8rem",
                background: theme.surfaceSecondary,
                borderRadius: "8px",
                borderLeft: `3px solid ${theme.accent}`,
                fontSize: "0.9rem",
                lineHeight: "1.4"
            }}>
                <strong style={{ color: theme.accent }}>
                    {index + 1}.
                </strong> {point.trim()}
            </div>
        ));
    };

    if (isLoading) {
        return (
            <div style={{
                background: theme.cardBackground,
                borderRadius: "16px",
                padding: "2rem",
                border: `1px solid ${theme.cardBorder}`,
                boxShadow: theme.shadowLight,
                marginBottom: "2rem",
                transition: "all 0.3s ease"
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1.5rem"
                }}>
                    <div style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem"
                    }}>
                        🤖
                    </div>
                    <div>
                        <h3 style={{
                            margin: 0,
                            color: theme.accent,
                            fontSize: "1.3rem"
                        }}>
                            AI Insights
                        </h3>
                        <p style={{
                            margin: "0.2rem 0 0 0",
                            color: theme.textSecondary,
                            fontSize: "0.9rem"
                        }}>
                            Analyzing your fitness journey...
                        </p>
                    </div>
                </div>
                
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "2rem",
                    gap: "1rem"
                }}>
                    <div style={{
                        display: "flex",
                        gap: "0.5rem"
                    }}>
                        <div style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            background: theme.accent,
                            animation: "pulse 1.4s ease-in-out infinite"
                        }}></div>
                        <div style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            background: theme.accent,
                            animation: "pulse 1.4s ease-in-out 0.2s infinite"
                        }}></div>
                        <div style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            background: theme.accent,
                            animation: "pulse 1.4s ease-in-out 0.4s infinite"
                        }}></div>
                    </div>
                    <span style={{
                        color: theme.textSecondary,
                        fontSize: "1rem"
                    }}>
                        AI is analyzing your workout data...
                    </span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                background: theme.cardBackground,
                borderRadius: "16px",
                padding: "2rem",
                border: `1px solid ${theme.cardBorder}`,
                boxShadow: theme.shadowLight,
                marginBottom: "2rem",
                transition: "all 0.3s ease"
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1.5rem"
                }}>
                    <div style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "2px solid rgba(239, 68, 68, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem"
                    }}>
                        ⚠️
                    </div>
                    <div>
                        <h3 style={{
                            margin: 0,
                            color: theme.text,
                            fontSize: "1.3rem"
                        }}>
                            AI Insights Unavailable
                        </h3>
                        <p style={{
                            margin: "0.2rem 0 0 0",
                            color: theme.textSecondary,
                            fontSize: "0.9rem"
                        }}>
                            Start logging workouts to get personalized insights
                        </p>
                    </div>
                </div>

                <div style={{
                    background: theme.surfaceSecondary,
                    borderRadius: "12px",
                    padding: "1.5rem",
                    textAlign: "center"
                }}>
                    <p style={{
                        margin: "0 0 1rem 0",
                        color: theme.textSecondary,
                        lineHeight: "1.5"
                    }}>
                        Create your first workout log to unlock AI-powered insights about your fitness journey!
                    </p>
                    <button
                        onClick={handleChatWithAI}
                        style={{
                            background: theme.accent,
                            color: theme.background,
                            border: "none",
                            borderRadius: "8px",
                            padding: "0.8rem 1.5rem",
                            fontSize: "1rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.3s ease"
                        }}
                        onMouseOver={e => e.currentTarget.style.background = theme.accentHover}
                        onMouseOut={e => e.currentTarget.style.background = theme.accent}
                    >
                        🤖 Chat with AI Coach
                    </button>
                </div>
            </div>
        );
    }

    const { analytics, ai_insights } = insights;

    return (
        <div style={{
            background: theme.cardBackground,
            borderRadius: "16px",
            padding: "2rem",
            border: `1px solid ${theme.cardBorder}`,
            boxShadow: theme.shadowLight,
            marginBottom: "2rem",
            transition: "all 0.3s ease"
        }}>
            {/* Header */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "2rem"
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem"
                }}>
                    <div style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem"
                    }}>
                        🤖
                    </div>
                    <div>
                        <h3 style={{
                            margin: 0,
                            color: theme.accent,
                            fontSize: "1.3rem"
                        }}>
                            AI Fitness Insights
                        </h3>
                        <p style={{
                            margin: "0.2rem 0 0 0",
                            color: theme.textSecondary,
                            fontSize: "0.9rem"
                        }}>
                            Personalized analysis of your fitness journey
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleChatWithAI}
                    style={{
                        background: theme.accentSecondary,
                        color: theme.accent,
                        border: "none",
                        borderRadius: "8px",
                        padding: "0.7rem 1.2rem",
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                    }}
                    onMouseOver={e => e.currentTarget.style.background = theme.accentHover}
                    onMouseOut={e => e.currentTarget.style.background = theme.accentSecondary}
                >
                    💬 Chat with AI
                </button>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem"
            }}>
                <div style={{
                    background: theme.surfaceSecondary,
                    borderRadius: "12px",
                    padding: "1.5rem",
                    textAlign: "center",
                    border: `1px solid ${theme.border}`
                }}>
                    <div style={{
                        fontSize: "2rem",
                        fontWeight: "700",
                        color: theme.accent,
                        marginBottom: "0.5rem"
                    }}>
                        {analytics?.total_workouts || 0}
                    </div>
                    <div style={{
                        color: theme.textSecondary,
                        fontSize: "0.9rem",
                        fontWeight: "500"
                    }}>
                        Total Workouts
                    </div>
                </div>

                <div style={{
                    background: theme.surfaceSecondary,
                    borderRadius: "12px",
                    padding: "1.5rem",
                    textAlign: "center",
                    border: `1px solid ${theme.border}`
                }}>
                    <div style={{
                        fontSize: "2rem",
                        fontWeight: "700",
                        color: theme.accent,
                        marginBottom: "0.5rem"
                    }}>
                        {analytics?.recent_workouts || 0}
                    </div>
                    <div style={{
                        color: theme.textSecondary,
                        fontSize: "0.9rem",
                        fontWeight: "500"
                    }}>
                        This Year
                    </div>
                </div>

                <div style={{
                    background: theme.surfaceSecondary,
                    borderRadius: "12px",
                    padding: "1.5rem",
                    textAlign: "center",
                    border: `1px solid ${theme.border}`
                }}>
                    <div style={{
                        fontSize: "1.2rem",
                        fontWeight: "600",
                        color: theme.accent,
                        marginBottom: "0.5rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                    }}>
                        {analytics?.top_exercises?.[0]?.[0] || "None yet"}
                    </div>
                    <div style={{
                        color: theme.textSecondary,
                        fontSize: "0.9rem",
                        fontWeight: "500"
                    }}>
                        Top Exercise
                    </div>
                </div>

                <div style={{
                    background: theme.surfaceSecondary,
                    borderRadius: "12px",
                    padding: "1.5rem",
                    textAlign: "center",
                    border: `1px solid ${theme.border}`
                }}>
                    <div style={{
                        fontSize: "1rem",
                        fontWeight: "600",
                        color: theme.accent,
                        marginBottom: "0.5rem"
                    }}>
                        {analytics?.last_workout ? new Date(analytics.last_workout).toLocaleDateString() : "N/A"}
                    </div>
                    <div style={{
                        color: theme.textSecondary,
                        fontSize: "0.9rem",
                        fontWeight: "500"
                    }}>
                        Last Workout
                    </div>
                </div>
            </div>

            {/* AI Insights */}
            <div style={{
                marginTop: "2rem"
            }}>
                <h4 style={{
                    margin: "0 0 1rem 0",
                    color: theme.accent,
                    fontSize: "1.1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                }}>
                    🧠 AI Analysis & Recommendations
                </h4>
                
                <div style={{
                    background: theme.surfaceSecondary,
                    borderRadius: "12px",
                    padding: "1.5rem",
                    border: `1px solid ${theme.border}`
                }}>
                    {ai_insights ? formatInsightText(ai_insights) : (
                        <p style={{
                            margin: 0,
                            color: theme.textSecondary,
                            fontStyle: "italic"
                        }}>
                            Log more workouts to get detailed AI insights and recommendations!
                        </p>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{
                display: "flex",
                gap: "1rem",
                marginTop: "2rem",
                justifyContent: "center",
                flexWrap: "wrap"
            }}>
                <button
                    onClick={handleChatWithAI}
                    style={{
                        background: theme.accent,
                        color: theme.background,
                        border: "none",
                        borderRadius: "8px",
                        padding: "0.8rem 1.5rem",
                        fontSize: "1rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                    }}
                    onMouseOver={e => e.currentTarget.style.background = theme.accentHover}
                    onMouseOut={e => e.currentTarget.style.background = theme.accent}
                >
                    🤖 Get Personalized Coaching
                </button>
                
                <button
                    onClick={fetchAIInsights}
                    style={{
                        background: theme.surfaceSecondary,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                        borderRadius: "8px",
                        padding: "0.8rem 1.5rem",
                        fontSize: "1rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                    }}
                    onMouseOver={e => {
                        e.currentTarget.style.background = theme.surfaceTertiary;
                        e.currentTarget.style.borderColor = theme.accent;
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.background = theme.surfaceSecondary;
                        e.currentTarget.style.borderColor = theme.border;
                    }}
                >
                    🔄 Refresh Insights
                </button>
            </div>

            {/* CSS animations */}
            <style>{`
                @keyframes pulse {
                    0%, 80%, 100% {
                        transform: scale(0.6);
                        opacity: 0.5;
                    }
                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default AIInsightsPanel;