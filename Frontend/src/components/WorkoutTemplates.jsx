import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getAllTemplates, applyAnyTemplateToLog, deleteCustomTemplate } from '../services/workoutTemplates';

const WorkoutTemplates = ({ currentLog, onApplyTemplate, onClose }) => {
    const { theme } = useTheme();
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [templates, setTemplates] = useState(getAllTemplates());

    const handleApplyTemplate = () => {
        if (selectedTemplate && onApplyTemplate) {
            const updatedLog = applyAnyTemplateToLog(selectedTemplate.id, currentLog);
            onApplyTemplate(updatedLog);
            onClose();
        }
    };

    const handleDeleteTemplate = async (templateId) => {
        if (window.confirm('Are you sure you want to delete this custom template?')) {
            const result = deleteCustomTemplate(templateId);
            if (result.success) {
                setTemplates(getAllTemplates());
                if (selectedTemplate?.id === templateId) {
                    setSelectedTemplate(null);
                }
            } else {
                alert(result.message);
            }
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem'
        }}>
            <div className="notes-container" style={{
                maxWidth: '600px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '2rem'
                }}>
                    <h2 style={{
                        margin: 0,
                        color: theme.accent,
                        fontSize: '1.5rem'
                    }}>
                        Choose Workout Template
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: theme.textSecondary,
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            transition: 'background 0.2s ease'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = theme.surfaceSecondary}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                        ×
                    </button>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    {templates.map(template => (
                        <div
                            key={template.id}
                            onClick={() => setSelectedTemplate(template)}
                            style={{
                                padding: '1.5rem',
                                background: selectedTemplate?.id === template.id ? 
                                    theme.accentSecondary : theme.surfaceSecondary,
                                borderRadius: '12px',
                                border: selectedTemplate?.id === template.id ? 
                                    `2px solid ${theme.accent}` : `1px solid ${theme.border}`,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                transform: selectedTemplate?.id === template.id ? 'scale(1.02)' : 'scale(1)'
                            }}
                            onMouseEnter={e => {
                                if (selectedTemplate?.id !== template.id) {
                                    e.currentTarget.style.background = theme.surfaceTertiary;
                                    e.currentTarget.style.transform = 'scale(1.01)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (selectedTemplate?.id !== template.id) {
                                    e.currentTarget.style.background = theme.surfaceSecondary;
                                    e.currentTarget.style.transform = 'scale(1)';
                                }
                            }}
                        >
                            <h3 style={{
                                margin: '0 0 0.5rem 0',
                                color: selectedTemplate?.id === template.id ? theme.accent : theme.text,
                                fontSize: '1.1rem',
                                fontWeight: '600'
                            }}>
                                {template.name}
                            </h3>
                            <p style={{
                                margin: '0 0 0.75rem 0',
                                color: theme.textSecondary,
                                fontSize: '0.9rem',
                                lineHeight: '1.4'
                            }}>
                                {template.description}
                            </p>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '0.5rem',
                                fontSize: '0.8rem',
                                color: theme.textMuted
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>{template.exerciseCount} exercises</span>
                                    {template.isCustom && (
                                        <span style={{
                                            background: theme.accent,
                                            color: theme.background,
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.7rem',
                                            fontWeight: '600'
                                        }}>
                                            CUSTOM
                                        </span>
                                    )}
                                </div>
                                {template.isCustom && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteTemplate(template.id);
                                        }}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: theme.textMuted,
                                            cursor: 'pointer',
                                            padding: '0.25rem',
                                            borderRadius: '4px',
                                            fontSize: '0.9rem',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseOver={e => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                            e.currentTarget.style.color = '#ef4444';
                                        }}
                                        onMouseOut={e => {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = theme.textMuted;
                                        }}
                                        title="Delete custom template"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {selectedTemplate && (
                    <div style={{
                        background: theme.surfaceSecondary,
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        border: `1px solid ${theme.border}`
                    }}>
                        <h4 style={{
                            margin: '0 0 1rem 0',
                            color: theme.accent,
                            fontSize: '1rem'
                        }}>
                            Preview: {selectedTemplate.name}
                        </h4>
                        <p style={{
                            margin: '0 0 1rem 0',
                            color: theme.textSecondary,
                            fontSize: '0.9rem'
                        }}>
                            This will replace your current workout with {selectedTemplate.exerciseCount} pre-configured exercises.
                        </p>
                        <div style={{
                            background: theme.surfaceTertiary,
                            borderRadius: '8px',
                            padding: '1rem',
                            fontSize: '0.85rem',
                            color: theme.textMuted
                        }}>
                            <strong>Note:</strong> Your current workout data will be replaced. 
                            Make sure to save any important changes first.
                        </div>
                    </div>
                )}

                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            background: theme.surfaceSecondary,
                            color: theme.textSecondary,
                            border: `1px solid ${theme.border}`,
                            borderRadius: '8px',
                            padding: '0.8rem 1.5rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.background = theme.surfaceTertiary;
                            e.currentTarget.style.borderColor = theme.textMuted;
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.background = theme.surfaceSecondary;
                            e.currentTarget.style.borderColor = theme.border;
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApplyTemplate}
                        disabled={!selectedTemplate}
                        style={{
                            background: selectedTemplate ? theme.accent : theme.surfaceSecondary,
                            color: selectedTemplate ? theme.background : theme.textMuted,
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.8rem 1.5rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: selectedTemplate ? 'pointer' : 'not-allowed',
                            transition: 'all 0.3s ease',
                            opacity: selectedTemplate ? 1 : 0.6
                        }}
                        onMouseOver={e => {
                            if (selectedTemplate) {
                                e.currentTarget.style.background = theme.accentHover;
                            }
                        }}
                        onMouseOut={e => {
                            if (selectedTemplate) {
                                e.currentTarget.style.background = theme.accent;
                            }
                        }}
                    >
                        Apply Template
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkoutTemplates;