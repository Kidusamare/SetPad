import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import TrainingLogManager from "./TrainingLogManager";
import TrainingLogRow from "./TrainingLogRow";
import WorkoutTemplates from "./WorkoutTemplates";
import { useAutoSave } from "../hooks/useAutoSave";
import { useFormKeyboardNavigation } from "../hooks/useKeyboardShortcuts";
import { saveWorkoutAsTemplate } from "../services/workoutTemplates";

const manager = new TrainingLogManager();

export default function TrainingLogTable() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [log, setLog] = useState(null);
    const [muscleGroupSuggestions, setMuscleGroupSuggestions] = useState([]);
    const [exerciseSuggestions, setExerciseSuggestions] = useState([]);
    const [currentMuscleGroup, setCurrentMuscleGroup] = useState("");
    const [showBackButton, setShowBackButton] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [saveStatus, setSaveStatus] = useState('');
    const [lastSaveTime, setLastSaveTime] = useState(null);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showSaveTemplate, setShowSaveTemplate] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [templateDescription, setTemplateDescription] = useState('');

    // Window resize detection
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Show button if at top of page or scrolling up
            const isAtTop = currentScrollY < 50;
            const isScrollingUp = currentScrollY < lastScrollY;
            
            setShowBackButton(isAtTop || isScrollingUp);
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    useEffect(() => {
        const loadLog = async () => {
            const saved = await manager.loadTable(id);
            if (saved) {
                setLog(saved);
            } else {
                const today = new Date().toISOString().split("T")[0];
                const defaultRow = {
                    id: 0,
                    muscleGroup: "",
                    exercise: "",
                    sets: [
                        { reps: "", weight: "" },
                        { reps: "", weight: "" }
                    ],
                    notes: "",
                    showNotes: false,
                    weightUnit: "lbs"
                };
                const defaultLog = {
                    id: id,
                    tableName: "New Log",
                    date: today,
                    rows: [defaultRow]
                };
                setLog(defaultLog);
            }
        };

        loadLog();
    }, [id]);

    // Fetch suggestions when component mounts
    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const [muscleGroups, exercises] = await Promise.all([
                    manager.getUniqueMuscleGroups(),
                    manager.getUniqueExercises()
                ]);
                setMuscleGroupSuggestions(muscleGroups);
                setExerciseSuggestions(exercises);
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            }
        };

        fetchSuggestions();
    }, []);

    // Update exercise suggestions when muscle group changes
    useEffect(() => {
        const fetchExercisesForMuscleGroup = async () => {
            if (currentMuscleGroup.trim()) {
                try {
                    const exercises = await manager.getExercisesForMuscleGroup(currentMuscleGroup);
                    setExerciseSuggestions(exercises);
                } catch (error) {
                    console.error("Error fetching exercises for muscle group:", error);
                }
            } else {
                // If no muscle group selected, show all exercises
                try {
                    const allExercises = await manager.getUniqueExercises();
                    setExerciseSuggestions(allExercises);
                } catch (error) {
                    console.error("Error fetching all exercises:", error);
                }
            }
        };

        fetchExercisesForMuscleGroup();
    }, [currentMuscleGroup]);

    const updateRow = (index, updatedRow) => {
        setLog(prevLog => {
            const newRows = [...prevLog.rows];
            newRows[index] = { ...newRows[index], ...updatedRow };
            return { ...prevLog, rows: newRows };
        });
    };

    const addRow = () => {
        setLog(prevLog => {
            const newRow = {
                id: prevLog.rows.length,
                muscleGroup: "",
                exercise: "",
                sets: [{ reps: "", weight: "" }],
                notes: "",
                showNotes: false,
                weightUnit: "lbs"
            };
            return { ...prevLog, rows: [...prevLog.rows, newRow] };
        });
    };

    const deleteLastRow = () => {
        setLog(prevLog => {
            if (prevLog.rows.length <= 1) return prevLog;
            const newRows = prevLog.rows.slice(0, -1);
            return { ...prevLog, rows: newRows };
        });
    };

    const handleApplyTemplate = (templateLog) => {
        setLog(templateLog);
        setSaveStatus('Template applied');
        setTimeout(() => setSaveStatus(''), 2000);
    };

    const handleRename = (e) => {
        setLog(prevLog => ({ ...prevLog, tableName: e.target.value }));
    };

    const handleMuscleGroupChange = (muscleGroup) => {
        setCurrentMuscleGroup(muscleGroup);
    };

    const handleSaveAsTemplate = async () => {
        if (!templateName.trim()) {
            alert('Please enter a template name.');
            return;
        }

        const result = await saveWorkoutAsTemplate(log, templateName.trim(), templateDescription.trim());
        
        if (result.success) {
            setSaveStatus(`Template "${templateName}" saved!`);
            setShowSaveTemplate(false);
            setTemplateName('');
            setTemplateDescription('');
            setTimeout(() => setSaveStatus(''), 3000);
        } else {
            alert(result.message);
        }
    };

    // Auto-save function for the hook
    const saveLog = async (logData) => {
        if (logData) {
            try {
                setSaveStatus('Saving...');
                await manager.saveTable(logData);
                setSaveStatus('Saved');
                setLastSaveTime(new Date());
                setTimeout(() => setSaveStatus(''), 2000);
            } catch (error) {
                setSaveStatus('Save failed');
                console.error('Save error:', error);
                setTimeout(() => setSaveStatus(''), 3000);
                throw error;
            }
        }
    };

    // Use auto-save hook
    const { save: manualSave } = useAutoSave(
        saveLog,
        log,
        2000, // 2 second delay
        true  // enabled
    );

    // Keyboard shortcuts
    useFormKeyboardNavigation({
        onSave: () => {
            if (log) {
                manualSave();
                setSaveStatus('Manually saved');
                setTimeout(() => setSaveStatus(''), 2000);
            }
        },
        onAddRow: (e) => {
            e.preventDefault();
            addRow();
        },
        enabled: true
    });

    if (!log) return <div style={{ background: theme.background, minHeight: "100vh" }}></div>;

    return (
        <div 
            data-form-container
            style={{ 
                padding: "2rem",
                paddingTop: "5rem", // Add top padding to prevent overlap with back button
                color: theme.text, 
                background: theme.background, 
                minHeight: "100vh",
                position: "relative",
                transition: "background-color 0.3s ease, color 0.3s ease"
            }}>
            <button
                onClick={() => {
                    console.log(`Navigating back from table ${id} to /log`);
                    try {
                        navigate("/log", { replace: true });
                        // Force navigation if it doesn't work
                        setTimeout(() => {
                            if (window.location.pathname.includes('/log/')) {
                                console.log("Force redirecting to /log");
                                window.location.href = '/log';
                            }
                        }, 100);
                    } catch (error) {
                        console.error("Navigation error:", error);
                        window.location.href = '/log';
                    }
                }}
                style={{
                    position: "fixed",
                    top: "1rem",
                    left: "1rem",
                    background: theme.accentSecondary,
                    color: theme.accent,
                    padding: "0.7rem 1.4rem",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: "600",
                    fontSize: "1rem",
                    cursor: "pointer",
                    zIndex: 1000,
                    transition: "all 0.3s ease",
                    opacity: showBackButton ? 1 : 0,
                    transform: showBackButton ? "translateY(0)" : "translateY(-10px)",
                    pointerEvents: showBackButton ? "auto" : "none"
                }}
                onMouseOver={e => e.currentTarget.style.background = theme.accentHover}
                onMouseOut={e => e.currentTarget.style.background = theme.accentSecondary}
            >
                ← Back to Saved Logs
            </button>

            <div style={{ marginBottom: "2rem" }}>
                <input
                    type="text"
                    value={log.tableName}
                    onChange={handleRename}
                    style={{
                        fontSize: "2rem",
                        fontWeight: "bold",
                        background: "transparent",
                        border: "none",
                        borderBottom: `2px solid ${theme.accent}`,
                        color: theme.accent,
                        marginBottom: "1rem",
                        width: "100%",
                        padding: "0.5rem 0",
                        transition: "border-color 0.3s ease, color 0.3s ease"
                    }}
                />

                <input
                    type="date"
                    value={log.date}
                    onChange={(e) => setLog(prevLog => ({ ...prevLog, date: e.target.value }))}
                    style={{
                        background: theme.surfaceSecondary,
                        color: theme.text,
                        padding: "0.7rem 1.4rem",
                        border: "none",
                        borderRadius: "10px",
                        fontWeight: "600",
                        fontSize: "1rem",
                        cursor: "pointer",
                        marginRight: 0,
                        marginTop: 0,
                        marginBottom: "1rem",
                        transition: "background 0.2s ease"
                    }}
                    onMouseOver={e => e.currentTarget.style.background = theme.surfaceTertiary}
                    onMouseOut={e => e.currentTarget.style.background = theme.surfaceSecondary}
                />
            </div>

            <hr style={{ 
                border: "none", 
                height: "1px", 
                background: theme.border, 
                margin: "2rem 0",
                transition: "background-color 0.3s ease"
            }} />

            {log.rows.map((row, index) => (
                <TrainingLogRow
                    key={row.id}
                    rowData={row}
                    onUpdate={(updated) => updateRow(index, updated)}
                    muscleGroupSuggestions={muscleGroupSuggestions}
                    exerciseSuggestions={exerciseSuggestions}
                    onMuscleGroupChange={handleMuscleGroupChange}
                    currentLogId={log.id}
                />
            ))}

            <div style={{ 
                marginTop: "2rem",
                padding: "1.5rem",
                background: theme.cardBackground,
                borderRadius: "12px",
                border: `1px solid ${theme.cardBorder}`,
                transition: "background-color 0.3s ease, border-color 0.3s ease"
            }}>
                <h3 style={{ 
                    marginBottom: "1rem", 
                    color: theme.accent,
                    fontSize: "1.2rem",
                    transition: "color 0.3s ease"
                }}>
                    Exercise Management
                </h3>
                
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    marginBottom: '1rem'
                }}>
                    <button
                        onClick={addRow}
                        style={{
                            background: theme.accentSecondary,
                            color: theme.accent,
                            padding: "0.7rem 1.4rem",
                            border: "none",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: "1rem",
                            minHeight: '44px',
                        transition: "background 0.2s ease"
                    }}
                    onMouseOver={e => e.currentTarget.style.background = theme.accentHover}
                    onMouseOut={e => e.currentTarget.style.background = theme.accentSecondary}
                >
                    + Add Exercise
                </button>
                
                <button
                    onClick={() => setShowTemplates(true)}
                    style={{
                        background: theme.surfaceSecondary,
                        color: theme.accent,
                        padding: "0.7rem 1.4rem",
                        border: `1px solid ${theme.accent}`,
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "1rem",
                        minHeight: '44px',
                        transition: "all 0.2s ease"
                    }}
                    onMouseOver={e => {
                        e.currentTarget.style.background = theme.accent;
                        e.currentTarget.style.color = theme.background;
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.background = theme.surfaceSecondary;
                        e.currentTarget.style.color = theme.accent;
                    }}
                >
                    Use Template
                </button>
                
                <button
                    onClick={() => setShowSaveTemplate(true)}
                    style={{
                        background: theme.surfaceSecondary,
                        color: theme.accent,
                        padding: "0.7rem 1.4rem",
                        border: `1px solid ${theme.border}`,
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "1rem",
                        minHeight: '44px',
                        transition: "all 0.2s ease"
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
                    💾 Save as Template
                </button>
            </div>
                <button
                    onClick={deleteLastRow}
                    disabled={log.rows.length <= 1}
                    style={{
                        background: log.rows.length <= 1 ? theme.textMuted : theme.surfaceSecondary,
                        color: log.rows.length <= 1 ? theme.textSecondary : theme.textSecondary,
                        padding: "0.7rem 1.4rem",
                        border: `1px solid ${theme.border}`,
                        borderRadius: "10px",
                        cursor: log.rows.length <= 1 ? "not-allowed" : "pointer",
                        fontWeight: 600,
                        fontSize: "1rem",
                        marginRight: "1rem",
                        marginTop: "1rem",
                        transition: "background 0.2s ease, border-color 0.2s ease"
                    }}
                    onMouseOver={e => {
                        if (log.rows.length > 1) {
                            e.currentTarget.style.background = theme.surfaceTertiary;
                            e.currentTarget.style.borderColor = theme.textMuted;
                        }
                    }}
                    onMouseOut={e => {
                        if (log.rows.length > 1) {
                            e.currentTarget.style.background = theme.surfaceSecondary;
                            e.currentTarget.style.borderColor = theme.border;
                        }
                    }}
                >
                    - Delete Last
                </button>
                <button
                    onClick={() => {
                        manualSave();
                        setSaveStatus('Manually saved');
                        setTimeout(() => setSaveStatus(''), 2000);
                    }}
                    style={{
                        background: theme.accent,
                        color: theme.background,
                        padding: "0.7rem 1.4rem",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "1rem",
                        marginTop: "1rem",
                        transition: "background 0.2s ease"
                    }}
                    onMouseOver={e => e.currentTarget.style.background = theme.accentHover}
                    onMouseOut={e => e.currentTarget.style.background = theme.accent}
                >
                    {saveStatus === 'Saving...' ? 'Saving...' : 
                     saveStatus === 'Saved' ? 'Saved ✓' : 
                     saveStatus === 'Save failed' ? 'Save Failed ✗' : 
                     'Save Workout (Ctrl+S)'}
                </button>
                
                {/* Save Status Indicator */}
                {(saveStatus || lastSaveTime) && (
                    <div style={{
                        marginTop: '0.5rem',
                        fontSize: '0.8rem',
                        color: saveStatus === 'Save failed' ? theme.danger : theme.textSecondary,
                        textAlign: 'center'
                    }}>
                        {saveStatus || (lastSaveTime && `Last saved: ${lastSaveTime.toLocaleTimeString()}`)}
                    </div>
                )}
            </div>
            
            {/* Workout Templates Modal */}
            {showTemplates && (
                <WorkoutTemplates
                    currentLog={log}
                    onApplyTemplate={handleApplyTemplate}
                    onClose={() => setShowTemplates(false)}
                />
            )}

            {/* Save as Template Modal */}
            {showSaveTemplate && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0, 0, 0, 0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2000,
                    padding: "1rem"
                }}
                onClick={() => setShowSaveTemplate(false)}
                >
                    <div style={{
                        background: theme.cardBackground,
                        borderRadius: "20px",
                        padding: "2rem",
                        maxWidth: "90vw",
                        width: "500px",
                        border: `1px solid ${theme.cardBorder}`,
                        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
                    }}
                    onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{
                            margin: "0 0 1.5rem 0",
                            color: theme.accent,
                            fontSize: "1.5rem",
                            textAlign: "center"
                        }}>
                            Save as Template
                        </h3>
                        
                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                color: theme.text,
                                fontWeight: "600"
                            }}>
                                Template Name *
                            </label>
                            <input
                                type="text"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                placeholder="e.g., My Upper Body Workout"
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: `1px solid ${theme.border}`,
                                    borderRadius: "8px",
                                    background: theme.surfaceSecondary,
                                    color: theme.text,
                                    fontSize: "1rem",
                                    boxSizing: "border-box"
                                }}
                                autoFocus
                            />
                        </div>

                        <div style={{ marginBottom: "2rem" }}>
                            <label style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                color: theme.text,
                                fontWeight: "600"
                            }}>
                                Description (optional)
                            </label>
                            <textarea
                                value={templateDescription}
                                onChange={(e) => setTemplateDescription(e.target.value)}
                                placeholder="Brief description of this workout template..."
                                rows={3}
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    border: `1px solid ${theme.border}`,
                                    borderRadius: "8px",
                                    background: theme.surfaceSecondary,
                                    color: theme.text,
                                    fontSize: "1rem",
                                    boxSizing: "border-box",
                                    resize: "vertical"
                                }}
                            />
                        </div>

                        <div style={{
                            display: "flex",
                            gap: "1rem",
                            justifyContent: "flex-end"
                        }}>
                            <button
                                onClick={() => setShowSaveTemplate(false)}
                                style={{
                                    background: theme.surfaceSecondary,
                                    color: theme.textSecondary,
                                    border: `1px solid ${theme.border}`,
                                    borderRadius: "8px",
                                    padding: "0.8rem 1.5rem",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontSize: "1rem",
                                    minHeight: "44px",
                                    transition: "all 0.2s ease"
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
                                onClick={handleSaveAsTemplate}
                                disabled={!templateName.trim()}
                                style={{
                                    background: templateName.trim() ? theme.accent : theme.textMuted,
                                    color: templateName.trim() ? theme.background : theme.textSecondary,
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "0.8rem 1.5rem",
                                    cursor: templateName.trim() ? "pointer" : "not-allowed",
                                    fontWeight: "600",
                                    fontSize: "1rem",
                                    minHeight: "44px",
                                    transition: "all 0.2s ease"
                                }}
                                onMouseOver={e => {
                                    if (templateName.trim()) {
                                        e.currentTarget.style.background = theme.accentHover;
                                    }
                                }}
                                onMouseOut={e => {
                                    if (templateName.trim()) {
                                        e.currentTarget.style.background = theme.accent;
                                    }
                                }}
                            >
                                💾 Save Template
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
