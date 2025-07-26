import React from "react";
import { useTheme } from "../context/ThemeContext";

const LoadingSpinner = ({ 
    size = "medium", 
    text = "Loading...", 
    fullScreen = false,
    overlay = false 
}) => {
    const { theme } = useTheme();

    const sizes = {
        small: { width: "20px", height: "20px", fontSize: "0.8rem" },
        medium: { width: "40px", height: "40px", fontSize: "1rem" },
        large: { width: "60px", height: "60px", fontSize: "1.2rem" }
    };

    const spinnerSize = sizes[size];

    const spinnerStyle = {
        width: spinnerSize.width,
        height: spinnerSize.height,
        border: `3px solid ${theme.surfaceSecondary}`,
        borderTop: `3px solid ${theme.accent}`,
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
    };

    const containerStyle = fullScreen ? {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: overlay ? "rgba(0, 0, 0, 0.5)" : theme.background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: overlay ? 9999 : 1000,
        gap: "1rem"
    } : {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        gap: "1rem"
    };

    return (
        <>
            <div style={containerStyle}>
                <div style={spinnerStyle}></div>
                {text && (
                    <p style={{
                        margin: 0,
                        color: theme.textSecondary,
                        fontSize: spinnerSize.fontSize,
                        fontWeight: "500"
                    }}>
                        {text}
                    </p>
                )}
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
};

// Skeleton loader for cards and content
export const SkeletonLoader = ({ type = "card", count = 1 }) => {
    const { theme } = useTheme();

    const skeletonStyles = {
        background: `linear-gradient(90deg, ${theme.surfaceSecondary} 25%, ${theme.surfaceTertiary} 50%, ${theme.surfaceSecondary} 75%)`,
        backgroundSize: "200% 100%",
        animation: "loading 1.5s infinite",
        borderRadius: "8px"
    };

    const CardSkeleton = () => (
        <div style={{
            background: theme.cardBackground,
            border: `1px solid ${theme.cardBorder}`,
            borderRadius: "16px",
            padding: "1.5rem",
            marginBottom: "1rem"
        }}>
            <div style={{
                ...skeletonStyles,
                height: "24px",
                width: "60%",
                marginBottom: "1rem"
            }}></div>
            <div style={{
                ...skeletonStyles,
                height: "16px",
                width: "40%",
                marginBottom: "0.5rem"
            }}></div>
            <div style={{
                ...skeletonStyles,
                height: "16px",
                width: "80%"
            }}></div>
        </div>
    );

    const TextSkeleton = () => (
        <div>
            <div style={{
                ...skeletonStyles,
                height: "20px",
                width: "70%",
                marginBottom: "0.5rem"
            }}></div>
            <div style={{
                ...skeletonStyles,
                height: "16px",
                width: "50%"
            }}></div>
        </div>
    );

    const ButtonSkeleton = () => (
        <div style={{
            ...skeletonStyles,
            height: "40px",
            width: "120px",
            borderRadius: "8px"
        }}></div>
    );

    const renderSkeleton = () => {
        switch (type) {
            case "card":
                return <CardSkeleton />;
            case "text":
                return <TextSkeleton />;
            case "button":
                return <ButtonSkeleton />;
            default:
                return <CardSkeleton />;
        }
    };

    return (
        <>
            {Array.from({ length: count }, (_, index) => (
                <div key={index}>
                    {renderSkeleton()}
                </div>
            ))}
            <style>{`
                @keyframes loading {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </>
    );
};

// Simple inline spinner
export const InlineSpinner = ({ size = "small" }) => {
    const { theme } = useTheme();
    
    const spinnerSizes = {
        small: "16px",
        medium: "24px",
        large: "32px"
    };

    return (
        <>
            <div style={{
                width: spinnerSizes[size],
                height: spinnerSizes[size],
                border: `2px solid ${theme.surfaceSecondary}`,
                borderTop: `2px solid ${theme.accent}`,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                display: "inline-block"
            }}></div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
};

export default LoadingSpinner;