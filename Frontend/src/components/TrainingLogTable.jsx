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

    const isMobile = windowWidth <= 768;

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

    if (!log) {
        return (
            <div style={{ 
                background: 'var(--gradient-backdrop)', 
                minHeight: "100vh",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    color: 'var(--primary-100)',
                    fontSize: 'var(--font-size-lg)',
                    fontFamily: 'var(--font-family-primary)'
                }}>
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="training-log-container">
            <style jsx>{`
                .training-log-container {
                    padding: ${isMobile ? 'var(--space-4)' : 'var(--space-8)'};
                    padding-top: ${isMobile ? 'var(--space-16)' : 'var(--space-20)'};
                    color: var(--primary-100);
                    background: var(--gradient-backdrop);
                    min-height: 100vh;
                    position: relative;
                    font-family: var(--font-family-primary);
                }

                .back-button {
                    position: fixed;
                    top: var(--space-4);
                    left: var(--space-4);
                    background: var(--glass-bg);
                    backdrop-filter: var(--glass-backdrop);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-lg);
                    padding: var(--space-3) var(--space-6);
                    color: var(--primary-100);
                    font-weight: 600;
                    font-size: var(--font-size-sm);
                    cursor: pointer;
                    z-index: var(--z-fixed);
                    transition: var(--transition-normal);
                    opacity: ${showBackButton ? 1 : 0};
                    transform: ${showBackButton ? 'translateY(0)' : 'translateY(-10px)'};
                    pointer-events: ${showBackButton ? 'auto' : 'none'};
                }

                .back-button:hover {
                    background: rgba(255, 255, 255, 0.12);
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-glow);
                }

                .header-section {
                    margin-bottom: var(--space-8);
                    text-align: center;
                }

                .workout-title {
                    font-size: ${isMobile ? 'var(--font-size-2xl)' : 'var(--font-size-4xl)'};
                    font-weight: 700;
                    background: transparent;
                    border: none;
                    border-bottom: 2px solid var(--accent-primary);
                    color: var(--accent-primary);
                    margin-bottom: var(--space-4);
                    width: 100%;
                    max-width: 600px;
                    padding: var(--space-2) 0;
                    text-align: center;
                    transition: var(--transition-normal);
                    font-family: var(--font-family-primary);
                }

                .workout-title:focus {
                    outline: none;
                    border-bottom-color: var(--accent-secondary);
                    box-shadow: 0 2px 0 var(--accent-secondary);
                }

                .date-input {
                    background: var(--glass-bg);
                    backdrop-filter: var(--glass-backdrop);
                    color: var(--primary-100);
                    padding: var(--space-3) var(--space-4);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-lg);
                    font-weight: 600;
                    font-size: var(--font-size-sm);
                    cursor: pointer;
                    transition: var(--transition-normal);
                    font-family: var(--font-family-primary);
                }

                .date-input:hover {
                    background: rgba(255, 255, 255, 0.12);
                    border-color: var(--accent-primary);
                }

                .date-input:focus {
                    outline: none;
                    border-color: var(--accent-primary);
                    box-shadow: var(--shadow-glow);
                }

                .divider {
                    border: none;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, var(--glass-border), transparent);
                    margin: var(--space-8) 0;
                }

                .controls-section {
                    margin-top: var(--space-8);
                    padding: var(--space-6);
                    background: var(--glass-bg);
                    backdrop-filter: var(--glass-backdrop);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-2xl);
                    transition: var(--transition-normal);
                }

                .controls-section:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: var(--accent-primary);
                }

                .controls-title {
                    margin-bottom: var(--space-4);
                    color: var(--accent-primary);
                    font-size: var(--font-size-xl);
                    font-weight: 700;
                    text-align: center;
                    background: linear-gradient(45deg, var(--accent-primary), var(--accent-tertiary));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .button-grid {
                    display: grid;
                    grid-template-columns: ${isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))'};
                    gap: var(--space-4);
                    margin-bottom: var(--space-6);
                }

                .action-button {
                    background: var(--gradient-primary);
                    border: none;
                    border-radius: var(--radius-lg);
                    padding: var(--space-4) var(--space-6);
                    color: white;
                    font-weight: 700;
                    font-size: var(--font-size-sm);
                    cursor: pointer;
                    transition: var(--transition-normal);
                    min-height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--space-2);
                    box-shadow: var(--shadow-md);
                    font-family: var(--font-family-primary);
                }

                .action-button:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-glow);
                }

                .secondary-button {
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-lg);
                    padding: var(--space-4) var(--space-6);
                    color: var(--primary-100);
                    font-weight: 600;
                    font-size: var(--font-size-sm);
                    cursor: pointer;
                    transition: var(--transition-normal);
                    min-height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--space-2);
                    font-family: var(--font-family-primary);
                }

                .secondary-button:hover {
                    background: rgba(255, 255, 255, 0.12);
                    border-color: var(--accent-primary);
                    transform: translateY(-1px);
                }

                .danger-button {
                    background: rgba(255, 68, 102, 0.1);
                    border: 1px solid rgba(255, 68, 102, 0.3);
                    color: var(--accent-error);
                }

                .danger-button:hover:not(:disabled) {
                    background: rgba(255, 68, 102, 0.2);
                    border-color: var(--accent-error);
                    color: white;
                }

                .danger-button:disabled {
                    background: var(--primary-700);
                    border-color: var(--primary-600);
                    color: var(--primary-400);
                    cursor: not-allowed;
                    transform: none;
                }

                .save-button {
                    background: var(--accent-success);
                    color: white;
                    box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
                }

                .save-button:hover {
                    box-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
                }

                .bottom-actions {
                    display: flex;
                    gap: var(--space-4);
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .save-status {
                    margin-top: var(--space-3);
                    text-align: center;
                    font-size: var(--font-size-xs);
                    color: var(--primary-300);
                    transition: var(--transition-normal);
                }

                .save-status.error {
                    color: var(--accent-error);
                }

                .save-status.success {
                    color: var(--accent-success);
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(10, 11, 15, 0.8);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: var(--z-modal-backdrop);
                    padding: var(--space-4);
                }

                .modal {
                    background: var(--primary-800);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-2xl);
                    padding: var(--space-8);
                    max-width: 500px;
                    width: 100%;
                    box-shadow: var(--shadow-xl);
                    transform: scale(0.9);
                    animation: modalAppear 0.3s ease forwards;
                }

                @keyframes modalAppear {
                    to {
                        transform: scale(1);
                    }
                }

                .modal-title {
                    font-size: var(--font-size-xl);
                    font-weight: 700;
                    color: var(--primary-100);
                    margin-bottom: var(--space-6);
                    text-align: center;
                }

                .modal-input {
                    width: 100%;
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-lg);
                    padding: var(--space-4);
                    color: var(--primary-100);
                    font-size: var(--font-size-sm);
                    margin-bottom: var(--space-4);
                    transition: var(--transition-normal);
                    font-family: var(--font-family-primary);
                }

                .modal-input:focus {
                    outline: none;
                    border-color: var(--accent-primary);
                    box-shadow: var(--shadow-glow);
                }

                .modal-textarea {
                    width: 100%;
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-lg);
                    padding: var(--space-4);
                    color: var(--primary-100);
                    font-size: var(--font-size-sm);
                    margin-bottom: var(--space-6);
                    resize: vertical;
                    min-height: 80px;
                    transition: var(--transition-normal);
                    font-family: var(--font-family-primary);
                }

                .modal-textarea:focus {
                    outline: none;
                    border-color: var(--accent-primary);
                    box-shadow: var(--shadow-glow);
                }

                .modal-actions {
                    display: flex;
                    gap: var(--space-4);
                    justify-content: flex-end;
                }

                .modal-button {
                    padding: var(--space-3) var(--space-6);
                    border-radius: var(--radius-lg);
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--transition-fast);
                    border: none;
                    font-size: var(--font-size-sm);
                    font-family: var(--font-family-primary);
                }

                .modal-button-cancel {
                    background: var(--glass-bg);
                    color: var(--primary-200);
                    border: 1px solid var(--glass-border);
                }

                .modal-button-cancel:hover {
                    background: rgba(255, 255, 255, 0.12);
                    color: var(--primary-100);
                }

                .modal-button-save {
                    background: var(--gradient-primary);
                    color: white;
                }

                .modal-button-save:hover {
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-glow);
                }
            `}</style>

            <button
                className="back-button"
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
            >
                ← Back to Saved Logs
            </button>

            <div className="header-section">
                <input
                    type="text"
                    value={log.tableName}
                    onChange={handleRename}
                    className="workout-title"
                    placeholder="Workout Name"
                />

                <input
                    type="date"
                    value={log.date}
                    onChange={(e) => setLog(prevLog => ({ ...prevLog, date: e.target.value }))}
                    className="date-input"
                />
            </div>

            <hr className="divider" />

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

            <div className="controls-section">
                <h3 className="controls-title">Workout Controls</h3>
                
                <div className="button-grid">
                    <button className="action-button" onClick={addRow}>
                        ➕ Add Exercise
                    </button>
                    
                    <button className="secondary-button" onClick={() => setShowTemplates(true)}>
                        📋 Use Template
                    </button>
                    
                    <button className="secondary-button" onClick={() => setShowSaveTemplate(true)}>
                        💾 Save as Template
                    </button>
                </div>

                <div className="bottom-actions">
                    <button
                        className="secondary-button danger-button"
                        onClick={deleteLastRow}
                        disabled={log.rows.length <= 1}
                    >
                        🗑 Delete Last
                    </button>
                    
                    <button
                        className="action-button save-button"
                        onClick={() => {
                            manualSave();
                            setSaveStatus('Manually saved');
                            setTimeout(() => setSaveStatus(''), 2000);
                        }}
                    >
                        {saveStatus === 'Saving...' ? '⏳ Saving...' : 
                         saveStatus === 'Saved' ? '✅ Saved' : 
                         saveStatus === 'Save failed' ? '❌ Save Failed' : 
                         '💾 Save Workout (Ctrl+S)'}
                    </button>
                </div>
                
                {/* Save Status Indicator */}
                {(saveStatus || lastSaveTime) && (
                    <div className={`save-status ${saveStatus === 'Save failed' ? 'error' : saveStatus ? 'success' : ''}`}>
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
                <div className="modal-overlay" onClick={() => setShowSaveTemplate(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Save as Template</h3>
                        
                        <input
                            type="text"
                            placeholder="Template name"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            className="modal-input"
                            autoFocus
                        />
                        
                        <textarea
                            placeholder="Description (optional)"
                            value={templateDescription}
                            onChange={(e) => setTemplateDescription(e.target.value)}
                            className="modal-textarea"
                        />
                        
                        <div className="modal-actions">
                            <button
                                className="modal-button modal-button-cancel"
                                onClick={() => {
                                    setShowSaveTemplate(false);
                                    setTemplateName('');
                                    setTemplateDescription('');
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="modal-button modal-button-save"
                                onClick={handleSaveAsTemplate}
                            >
                                Save Template
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}