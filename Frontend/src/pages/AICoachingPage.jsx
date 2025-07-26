import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import AIService from "../services/aiCacheService";

const AICoachingPage = () => {
    const { theme } = useTheme();
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
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

   
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
            // Use cached AI service with rate limiting
            const result = await AIService.sendChatMessage({
                message: userMessage.content,
                conversation_history: messages.slice(-5).map(msg => ({
                    type: msg.type,
                    content: msg.content,
                    timestamp: msg.timestamp?.toISOString()
                })),
                user_data: null
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
            background: "var(--gradient-backdrop)",
            minHeight: "100vh",
            color: "var(--primary-100)",
            display: "flex",
            flexDirection: "column"
        }}>
            {/* Header with Back Button */}
            <div style={{
                position: "sticky",
                top: 0,
                zIndex: 100,
                background: "var(--gradient-backdrop)",
                borderBottom: "1px solid var(--glass-border)"
            }}>
                <div style={{
                    padding: "1rem 2rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem"
                }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                            <div style={{
                                background: "var(--gradient-primary)",
                                borderRadius: "var(--radius-lg)",
                                padding: "var(--space-2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ width: "24px", height: "24px" }}>
                                    <path d="M9 12l2 2 4-4"/>
                                    <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                                    <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                                    <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
                                    <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                            </div>
                            <h1 style={{
                                fontSize: "var(--font-size-2xl)",
                                margin: 0,
                                color: "var(--accent-primary)",
                                fontWeight: "700"
                            }}>
                                AI Fitness Coach
                            </h1>
                        </div>
                        <p style={{
                            margin: "0.2rem 0 0 0",
                            color: "var(--primary-400)",
                            fontSize: "var(--font-size-sm)"
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
                        background: "var(--glass-bg)",
                        borderRadius: "var(--radius-xl)",
                        padding: "var(--space-6)",
                        border: "1px solid var(--glass-border)",
                        backdropFilter: "var(--glass-backdrop)",
                        WebkitBackdropFilter: "var(--glass-backdrop)",
                        boxShadow: "var(--shadow-lg)"
                    }}>
                        <h3 style={{
                            margin: "0 0 var(--space-4) 0",
                            color: "var(--accent-primary)",
                            fontSize: "var(--font-size-lg)"
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
                                        background: "rgba(255, 255, 255, 0.05)",
                                        color: "var(--primary-100)",
                                        border: "1px solid var(--glass-border)",
                                        borderRadius: "var(--radius-md)",
                                        padding: "var(--space-3) var(--space-4)",
                                        cursor: "pointer",
                                        fontSize: "var(--font-size-sm)",
                                        fontWeight: "500",
                                        transition: "all var(--transition-normal)",
                                        textAlign: "left"
                                    }}
                                    onMouseOver={e => {
                                        e.currentTarget.style.background = "rgba(0, 212, 255, 0.1)";
                                        e.currentTarget.style.borderColor = "var(--accent-primary)";
                                        e.currentTarget.style.transform = "translateY(-1px)";
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                                        e.currentTarget.style.borderColor = "var(--glass-border)";
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
                                    background: "var(--gradient-primary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.2rem",
                                    flexShrink: 0
                                }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ width: "20px", height: "20px" }}>
                                        <path d="M9 12l2 2 4-4"/>
                                        <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                                        <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                                        <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
                                        <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
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
                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ width: "20px", height: "20px" }}>
                                    <path d="M9 12l2 2 4-4"/>
                                    <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                                    <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                                    <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
                                    <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
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
                                ? "rgba(255, 255, 255, 0.05)" 
                                : "var(--accent-primary)",
                            color: (!inputMessage.trim() || isLoading) 
                                ? "var(--primary-500)" 
                                : "var(--primary-950)",
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