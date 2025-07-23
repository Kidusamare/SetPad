import React from "react";
import { useTheme } from "../context/ThemeContext";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details
        console.error("Error Boundary caught an error:", error, errorInfo);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return <ErrorFallback 
                error={this.state.error} 
                errorInfo={this.state.errorInfo}
                resetError={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            />;
        }

        return this.props.children;
    }
}

const ErrorFallback = ({ error, errorInfo, resetError }) => {
    const { theme } = useTheme();

    const handleReload = () => {
        window.location.reload();
    };

    const handleGoHome = () => {
        window.location.href = '/';
    };

    return (
        <div style={{
            background: theme.background,
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            color: theme.text
        }}>
            <div style={{
                maxWidth: "600px",
                width: "100%",
                background: theme.cardBackground,
                borderRadius: "16px",
                padding: "3rem",
                border: `1px solid ${theme.cardBorder}`,
                boxShadow: theme.shadowLight,
                textAlign: "center"
            }}>
                {/* Error Icon */}
                <div style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "3px solid rgba(239, 68, 68, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 2rem auto",
                    fontSize: "2rem"
                }}>
                    !
                </div>

                {/* Error Title */}
                <h1 style={{
                    fontSize: "2rem",
                    fontWeight: "700",
                    color: theme.text,
                    margin: "0 0 1rem 0"
                }}>
                    Something went wrong
                </h1>

                {/* Error Description */}
                <p style={{
                    fontSize: "1.1rem",
                    color: theme.textSecondary,
                    lineHeight: "1.6",
                    margin: "0 0 2rem 0"
                }}>
                    We encountered an unexpected error. Don't worry - your workout data is safe. 
                    Try refreshing the page or returning to the home screen.
                </p>

                {/* Error Details (for development) */}
                {process.env.NODE_ENV === 'development' && error && (
                    <details style={{
                        background: theme.surfaceSecondary,
                        borderRadius: "8px",
                        padding: "1rem",
                        margin: "1rem 0 2rem 0",
                        textAlign: "left",
                        border: `1px solid ${theme.border}`
                    }}>
                        <summary style={{
                            cursor: "pointer",
                            fontWeight: "600",
                            color: theme.accent,
                            marginBottom: "1rem"
                        }}>
                            Technical Details (Development Mode)
                        </summary>
                        <div style={{
                            background: theme.background,
                            borderRadius: "4px",
                            padding: "1rem",
                            fontFamily: "monospace",
                            fontSize: "0.9rem",
                            color: theme.textSecondary,
                            overflow: "auto",
                            maxHeight: "200px"
                        }}>
                            <strong>Error:</strong> {error?.toString()}<br/>
                            <strong>Stack Trace:</strong><br/>
                            <pre style={{ margin: "0.5rem 0", whiteSpace: "pre-wrap" }}>
                                {errorInfo?.componentStack}
                            </pre>
                        </div>
                    </details>
                )}

                {/* Action Buttons */}
                <div style={{
                    display: "flex",
                    gap: "1rem",
                    justifyContent: "center",
                    flexWrap: "wrap"
                }}>
                    <button
                        onClick={resetError}
                        style={{
                            background: theme.accent,
                            color: theme.background,
                            border: "none",
                            borderRadius: "8px",
                            padding: "1rem 2rem",
                            fontSize: "1rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.3s ease"
                        }}
                        onMouseOver={e => e.currentTarget.style.background = theme.accentHover}
                        onMouseOut={e => e.currentTarget.style.background = theme.accent}
                    >
                        Try Again
                    </button>
                    
                    <button
                        onClick={handleReload}
                        style={{
                            background: theme.surfaceSecondary,
                            color: theme.text,
                            border: `1px solid ${theme.border}`,
                            borderRadius: "8px",
                            padding: "1rem 2rem",
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
                        Refresh Page
                    </button>

                    <button
                        onClick={handleGoHome}
                        style={{
                            background: theme.surfaceSecondary,
                            color: theme.text,
                            border: `1px solid ${theme.border}`,
                            borderRadius: "8px",
                            padding: "1rem 2rem",
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
                        Go Home
                    </button>
                </div>

                {/* Support Message */}
                <p style={{
                    fontSize: "0.9rem",
                    color: theme.textMuted,
                    margin: "2rem 0 0 0",
                    fontStyle: "italic"
                }}>
                    If this problem persists, please check the browser console for more details.
                </p>
            </div>
        </div>
    );
};

export default ErrorBoundary;