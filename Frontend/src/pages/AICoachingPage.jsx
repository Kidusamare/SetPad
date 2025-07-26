import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import AIService from "../services/aiCacheService";

const AICoachingPage = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: "ai",
            content: "Hi! I'm your AI fitness coach. I can help you with workout planning, form analysis, nutrition advice, and tracking your progress. What would you like to work on today?",
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showBackButton, setShowBackButton] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [rateLimitMessage, setRateLimitMessage] = useState("");
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Scroll detection for back button
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const isAtTop = currentScrollY < 50;
            const isScrollingUp = currentScrollY < lastScrollY;
            
            setShowBackButton(isAtTop || isScrollingUp);
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            type: "user",
            content: inputMessage.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage("");
        setIsLoading(true);

        try {
            setRateLimitMessage("");
            
            // Use cached AI service with rate limiting
            const result = await AIService.sendChatMessage({
                message: userMessage.content,
                conversation_history: messages.slice(-5) // Send last 5 messages for context
            });

            const data = result.data;
            
            const aiMessage = {
                id: Date.now() + 1,
                type: "ai",
                content: data.response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("AI coaching error:", error);
            
            let errorContent = "I'm sorry, I'm having trouble connecting right now. Please try again.";
            
            if (error.message.includes('Rate limited')) {
                errorContent = error.message;
                setRateLimitMessage(error.message);
            }
            
            const errorMessage = {
                id: Date.now() + 1,
                type: "ai",
                content: errorContent,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const quickActions = [
        "Create a workout plan",
        "Set fitness goals", 
        "Analyze my progress",
        "Nutrition advice",
        "Quick HIIT workout",
        "Form check tips"
    ];

    const handleQuickAction = (action) => {
        setInputMessage(action.substring(2)); // Remove emoji
        inputRef.current?.focus();
    };

    const formatTime = (timestamp) => {
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{
            background: theme.background,
            minHeight: "100vh",
            color: theme.text,
            display: "flex",
            flexDirection: "column",
            transition: "background-color 0.3s ease, color 0.3s ease"
        }}>
            {/* Header with Back Button */}
            <div style={{
                position: "sticky",
                top: 0,
                zIndex: 100,
                background: theme.background,
                borderBottom: `1px solid ${theme.border}`,
                transition: "all 0.3s ease"
            }}>
                <div style={{
                    padding: "1rem 2rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem"
                }}>
                    <button
                        onClick={() => navigate("/")}
                        style={{
                            background: theme.accentSecondary,
                            color: theme.accent,
                            padding: "0.7rem 1.4rem",
                            border: "none",
                            borderRadius: "10px",
                            fontWeight: "600",
                            fontSize: "1rem",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            opacity: showBackButton ? 1 : 0,
                            transform: showBackButton ? "translateX(0)" : "translateX(-10px)",
                            pointerEvents: showBackButton ? "auto" : "none"
                        }}
                        onMouseOver={e => e.currentTarget.style.background = theme.accentHover}
                        onMouseOut={e => e.currentTarget.style.background = theme.accentSecondary}
                    >
                        ← Back to Dashboard
                    </button>
                    <div style={{ flex: 1 }}>
                        <h1 style={{
                            fontSize: "1.8rem",
                            margin: 0,
                            color: theme.accent,
                            fontWeight: "700"
                        }}>
                            🤖 AI Fitness Coach
                        </h1>
                        <p style={{
                            margin: "0.2rem 0 0 0",
                            color: theme.textSecondary,
                            fontSize: "0.9rem"
                        }}>
                            Your personal AI trainer is here to help
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div style={{
                flex: 1,
                padding: "2rem",
                paddingBottom: "1rem",
                overflowY: "auto"
            }}>
                {/* Quick Actions (only show at start) */}
                {messages.length <= 1 && (
                    <div style={{
                        marginBottom: "2rem",
                        background: theme.cardBackground,
                        borderRadius: "16px",
                        padding: "1.5rem",
                        border: `1px solid ${theme.cardBorder}`,
                        boxShadow: theme.shadowLight
                    }}>
                        <h3 style={{
                            margin: "0 0 1rem 0",
                            color: theme.accent,
                            fontSize: "1.1rem"
                        }}>
                            Quick Actions
                        </h3>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "0.8rem"
                        }}>
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuickAction(action)}
                                    style={{
                                        background: theme.surfaceSecondary,
                                        color: theme.text,
                                        border: `1px solid ${theme.border}`,
                                        borderRadius: "8px",
                                        padding: "0.8rem 1rem",
                                        cursor: "pointer",
                                        fontSize: "0.9rem",
                                        fontWeight: "500",
                                        transition: "all 0.2s ease",
                                        textAlign: "left"
                                    }}
                                    onMouseOver={e => {
                                        e.currentTarget.style.background = theme.surfaceTertiary;
                                        e.currentTarget.style.borderColor = theme.accent;
                                        e.currentTarget.style.transform = "translateY(-1px)";
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.background = theme.surfaceSecondary;
                                        e.currentTarget.style.borderColor = theme.border;
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem"
                }}>
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            style={{
                                display: "flex",
                                justifyContent: message.type === "user" ? "flex-end" : "flex-start",
                                alignItems: "flex-start",
                                gap: "0.8rem"
                            }}
                        >
                            {message.type === "ai" && (
                                <div style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.2rem",
                                    flexShrink: 0
                                }}>
                                    🤖
                                </div>
                            )}
                            
                            <div style={{
                                maxWidth: "70%",
                                background: message.type === "user" 
                                    ? theme.accent 
                                    : theme.cardBackground,
                                color: message.type === "user" 
                                    ? theme.background 
                                    : theme.text,
                                padding: "1rem 1.2rem",
                                borderRadius: message.type === "user" 
                                    ? "18px 18px 4px 18px" 
                                    : "18px 18px 18px 4px",
                                border: message.type === "ai" 
                                    ? `1px solid ${theme.cardBorder}` 
                                    : "none",
                                boxShadow: message.type === "user" 
                                    ? "0 2px 8px rgba(0,0,0,0.15)" 
                                    : theme.shadowLight,
                                wordWrap: "break-word",
                                lineHeight: "1.5"
                            }}>
                                <div style={{ marginBottom: "0.5rem" }}>
                                    {message.content}
                                </div>
                                <div style={{
                                    fontSize: "0.75rem",
                                    opacity: 0.7,
                                    textAlign: "right"
                                }}>
                                    {formatTime(message.timestamp)}
                                </div>
                            </div>

                            {message.type === "user" && (
                                <div style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    background: theme.surfaceSecondary,
                                    border: `2px solid ${theme.border}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.2rem",
                                    flexShrink: 0
                                }}>
                                    U
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div style={{
                            display: "flex",
                            justifyContent: "flex-start",
                            alignItems: "flex-start",
                            gap: "0.8rem"
                        }}>
                            <div style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentHover})`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.2rem"
                            }}>
                                🤖
                            </div>
                            <div style={{
                                background: theme.cardBackground,
                                border: `1px solid ${theme.cardBorder}`,
                                borderRadius: "18px 18px 18px 4px",
                                padding: "1rem 1.2rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem"
                            }}>
                                <div style={{
                                    display: "flex",
                                    gap: "0.3rem"
                                }}>
                                    <div style={{
                                        width: "8px",
                                        height: "8px",
                                        borderRadius: "50%",
                                        background: theme.accent,
                                        animation: "pulse 1.4s ease-in-out infinite"
                                    }}></div>
                                    <div style={{
                                        width: "8px",
                                        height: "8px",
                                        borderRadius: "50%",
                                        background: theme.accent,
                                        animation: "pulse 1.4s ease-in-out 0.2s infinite"
                                    }}></div>
                                    <div style={{
                                        width: "8px",
                                        height: "8px",
                                        borderRadius: "50%",
                                        background: theme.accent,
                                        animation: "pulse 1.4s ease-in-out 0.4s infinite"
                                    }}></div>
                                </div>
                                <span style={{
                                    color: theme.textSecondary,
                                    fontSize: "0.9rem"
                                }}>
                                    AI is thinking...
                                </span>
                            </div>
                        </div>
                    )}
                </div>
                
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
                padding: "1rem 2rem 2rem 2rem",
                borderTop: `1px solid ${theme.border}`,
                background: theme.background
            }}>
                <div style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "flex-end",
                    maxWidth: "1000px",
                    margin: "0 auto"
                }}>
                    <div style={{ flex: 1 }}>
                        <textarea
                            ref={inputRef}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask me anything about fitness, nutrition, or workouts..."
                            disabled={isLoading}
                            style={{
                                width: "100%",
                                minHeight: "50px",
                                maxHeight: "120px",
                                padding: "1rem",
                                borderRadius: "12px",
                                border: `1px solid ${theme.inputBorder}`,
                                background: theme.inputBackground,
                                color: theme.text,
                                fontSize: "1rem",
                                resize: "vertical",
                                outline: "none",
                                transition: "all 0.3s ease",
                                fontFamily: "inherit",
                                lineHeight: "1.4"
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = theme.accent}
                            onBlur={e => e.currentTarget.style.borderColor = theme.inputBorder}
                        />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        style={{
                            background: (!inputMessage.trim() || isLoading) 
                                ? theme.surfaceSecondary 
                                : theme.accent,
                            color: (!inputMessage.trim() || isLoading) 
                                ? theme.textMuted 
                                : theme.background,
                            border: "none",
                            borderRadius: "12px",
                            padding: "1rem 1.5rem",
                            fontSize: "1rem",
                            fontWeight: "600",
                            cursor: (!inputMessage.trim() || isLoading) 
                                ? "not-allowed" 
                                : "pointer",
                            transition: "all 0.3s ease",
                            minWidth: "80px",
                            height: "50px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                        onMouseOver={e => {
                            if (!(!inputMessage.trim() || isLoading)) {
                                e.currentTarget.style.background = theme.accentHover;
                            }
                        }}
                        onMouseOut={e => {
                            if (!(!inputMessage.trim() || isLoading)) {
                                e.currentTarget.style.background = theme.accent;
                            }
                        }}
                    >
                        {isLoading ? "..." : "Send"}
                    </button>
                </div>
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

export default AICoachingPage;