import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const ProgressChart = ({ data, title, type = 'weight', height = 200 }) => {
    const { theme } = useTheme();
    const [hoveredPoint, setHoveredPoint] = useState(null);

    if (!data || data.length === 0) {
        return (
            <div style={{
                height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: theme.surfaceSecondary,
                borderRadius: '12px',
                border: `1px solid ${theme.border}`,
                color: theme.textSecondary
            }}>
                No data available for {title}
            </div>
        );
    }

    // Prepare data points with better scaling
    const values = data.map(d => parseFloat(d.value) || 0);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const valueRange = maxValue - minValue || 1;
    
    // Add padding to value range for better visualization
    const paddedMax = maxValue + (valueRange * 0.1);
    const paddedMin = Math.max(0, minValue - (valueRange * 0.1));
    const paddedRange = paddedMax - paddedMin;
    
    const padding = 50;
    const chartWidth = 500;
    const chartHeight = height - padding * 2;

    // Generate SVG path with better scaling
    const points = data.map((d, index) => {
        const x = padding + (index / (data.length - 1)) * (chartWidth - padding * 2);
        const y = padding + chartHeight - ((parseFloat(d.value) - paddedMin) / paddedRange) * chartHeight;
        return { 
            x, 
            y, 
            value: d.value, 
            date: d.date, 
            weight: d.weight,
            reps: d.reps,
            sets: d.sets,
            index 
        };
    });

    const pathD = points.reduce((path, point, index) => {
        return path + (index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
    }, '');

    // Generate area path for gradient fill
    const areaD = pathD + ` L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`;

    return (
        <div style={{
            background: theme.cardBackground,
            borderRadius: '16px',
            padding: '1.5rem',
            border: `1px solid ${theme.cardBorder}`,
            position: 'relative'
        }}>
            <h3 style={{
                margin: '0 0 1rem 0',
                color: theme.accent,
                fontSize: '1.1rem',
                fontWeight: '600'
            }}>
                {title}
            </h3>

            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px' }}>
                <svg
                    width="100%"
                    height={height}
                    viewBox={`0 0 ${chartWidth} ${height}`}
                    style={{ display: 'block' }}
                >
                    {/* Grid lines */}
                    <defs>
                        <linearGradient id={`gradient-${title.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={theme.accent} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={theme.accent} stopOpacity="0.05" />
                        </linearGradient>
                    </defs>

                    {/* Horizontal grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                        const y = padding + chartHeight * ratio;
                        return (
                            <line
                                key={ratio}
                                x1={padding}
                                y1={y}
                                x2={chartWidth - padding}
                                y2={y}
                                stroke={theme.border}
                                strokeWidth="1"
                                opacity="0.2"
                                strokeDasharray="2,2"
                            />
                        );
                    })}

                    {/* Vertical grid lines */}
                    {points.map((point, index) => {
                        if (index % Math.ceil(points.length / 5) === 0) {
                            return (
                                <line
                                    key={`vertical-${index}`}
                                    x1={point.x}
                                    y1={padding}
                                    x2={point.x}
                                    y2={padding + chartHeight}
                                    stroke={theme.border}
                                    strokeWidth="1"
                                    opacity="0.1"
                                    strokeDasharray="2,2"
                                />
                            );
                        }
                        return null;
                    })}

                    {/* Area fill */}
                    <path
                        d={areaD}
                        fill={`url(#gradient-${title.replace(/\s+/g, '')})`}
                        stroke="none"
                    />

                    {/* Main line */}
                    <path
                        d={pathD}
                        fill="none"
                        stroke={theme.accent}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Data points */}
                    {points.map((point) => (
                        <circle
                            key={point.index}
                            cx={point.x}
                            cy={point.y}
                            r={hoveredPoint === point.index ? "6" : "4"}
                            fill={theme.accent}
                            stroke={theme.background}
                            strokeWidth="2"
                            style={{
                                cursor: 'pointer',
                                transition: 'r 0.2s ease'
                            }}
                            onMouseEnter={() => setHoveredPoint(point.index)}
                            onMouseLeave={() => setHoveredPoint(null)}
                        />
                    ))}

                    {/* Y-axis labels */}
                    {[paddedMax, (paddedMax + paddedMin) / 2, paddedMin].map((value, index) => {
                        const y = padding + (index * chartHeight / 2);
                        return (
                            <text
                                key={value}
                                x={padding - 15}
                                y={y + 4}
                                textAnchor="end"
                                fontSize="11"
                                fill={theme.textSecondary}
                                fontWeight="500"
                            >
                                {value.toFixed(0)}{type === 'weight' ? 'lbs' : ''}
                            </text>
                        );
                    })}

                    {/* X-axis labels (dates) */}
                    {points.map((point, index) => {
                        if (index % Math.ceil(points.length / 4) === 0 || index === points.length - 1) {
                            return (
                                <text
                                    key={`date-${index}`}
                                    x={point.x}
                                    y={padding + chartHeight + 20}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fill={theme.textSecondary}
                                    fontWeight="500"
                                >
                                    {new Date(point.date).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric' 
                                    })}
                                </text>
                            );
                        }
                        return null;
                    })}
                </svg>

                {/* Enhanced Tooltip */}
                {hoveredPoint !== null && (
                    <div style={{
                        position: 'absolute',
                        top: Math.max(10, points[hoveredPoint].y - 80),
                        left: Math.min(points[hoveredPoint].x - 60, chartWidth - 140),
                        background: theme.cardBackground,
                        border: `2px solid ${theme.accent}`,
                        borderRadius: '12px',
                        padding: '0.75rem',
                        fontSize: '0.8rem',
                        color: theme.text,
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                        zIndex: 10,
                        minWidth: '120px',
                        textAlign: 'left',
                        backdropFilter: 'blur(8px)'
                    }}>
                        <div style={{ 
                            fontWeight: '700', 
                            color: theme.accent, 
                            fontSize: '0.9rem',
                            marginBottom: '0.25rem'
                        }}>
                            {points[hoveredPoint].value}{type === 'weight' ? 'lbs' : ''}
                        </div>
                        {points[hoveredPoint].weight && points[hoveredPoint].reps && (
                            <div style={{ 
                                color: theme.text, 
                                fontSize: '0.75rem',
                                marginBottom: '0.25rem'
                            }}>
                                {points[hoveredPoint].weight}lbs × {points[hoveredPoint].reps} reps
                            </div>
                        )}
                        {points[hoveredPoint].sets && (
                            <div style={{ 
                                color: theme.textSecondary, 
                                fontSize: '0.7rem',
                                marginBottom: '0.25rem'
                            }}>
                                {points[hoveredPoint].sets} sets
                            </div>
                        )}
                        <div style={{ 
                            color: theme.textSecondary, 
                            fontSize: '0.7rem',
                            borderTop: `1px solid ${theme.border}`,
                            paddingTop: '0.25rem'
                        }}>
                            {new Date(points[hoveredPoint].date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Enhanced Stats summary */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                gap: '1rem',
                marginTop: '1.5rem',
                padding: '1rem',
                background: `linear-gradient(135deg, ${theme.surfaceSecondary}, ${theme.surfaceTertiary})`,
                borderRadius: '12px',
                fontSize: '0.8rem',
                border: `1px solid ${theme.border}`
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        color: theme.textSecondary, 
                        fontSize: '0.7rem',
                        fontWeight: '500',
                        marginBottom: '0.25rem'
                    }}>
                        BEST
                    </div>
                    <div style={{ 
                        color: theme.accent, 
                        fontWeight: '700',
                        fontSize: '1rem'
                    }}>
                        {maxValue.toFixed(1)}
                        <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                            {type === 'weight' ? 'lbs' : ''}
                        </span>
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        color: theme.textSecondary, 
                        fontSize: '0.7rem',
                        fontWeight: '500',
                        marginBottom: '0.25rem'
                    }}>
                        SESSIONS
                    </div>
                    <div style={{ 
                        color: theme.accent, 
                        fontWeight: '700',
                        fontSize: '1rem'
                    }}>
                        {data.length}
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        color: theme.textSecondary, 
                        fontSize: '0.7rem',
                        fontWeight: '500',
                        marginBottom: '0.25rem'
                    }}>
                        PROGRESS
                    </div>
                    <div style={{ 
                        color: data.length > 1 && data[data.length - 1].value >= data[0].value ? '#22c55e' : '#ef4444',
                        fontWeight: '700',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem'
                    }}>
                        {data.length > 1 ? (
                            <>
                                <span style={{ fontSize: '0.8rem' }}>
                                    {data[data.length - 1].value >= data[0].value ? '↗️' : '↘️'}
                                </span>
                                {((data[data.length - 1].value - data[0].value) / data[0].value * 100).toFixed(1)}%
                            </>
                        ) : (
                            <span style={{ color: theme.textMuted }}>N/A</span>
                        )}
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        color: theme.textSecondary, 
                        fontSize: '0.7rem',
                        fontWeight: '500',
                        marginBottom: '0.25rem'
                    }}>
                        TREND
                    </div>
                    <div style={{ 
                        color: theme.text, 
                        fontWeight: '600',
                        fontSize: '0.9rem'
                    }}>
                        {data.length >= 3 ? (
                            values[values.length - 1] > values[values.length - 3] ? '📈 Rising' :
                            values[values.length - 1] < values[values.length - 3] ? '📉 Falling' : '➡️ Stable'
                        ) : (
                            <span style={{ color: theme.textMuted }}>More data needed</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressChart;