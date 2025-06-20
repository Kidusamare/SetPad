import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    background: "#000",
                    color: "#f5f6fa",
                    minHeight: "100vh",
                    padding: "2rem",
                    fontFamily: "'San Francisco', 'Segoe UI', Arial, sans-serif"
                }}>
                    <h1>Something went wrong</h1>
                    <button 
                        onClick={() => window.location.href = '/'}
                        style={{
                            background: "#181a1b",
                            color: "#ffd966",
                            border: "none",
                            borderRadius: "8px",
                            padding: "0.8rem 1.4rem",
                            cursor: "pointer"
                        }}
                    >
                        Return to Home
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}