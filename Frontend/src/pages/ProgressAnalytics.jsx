import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ProgressChart from '../components/ProgressChart';
import TrainingLogManager from '../components/TrainingLogManager';
import { DataExportService } from '../services/dataExport';

const manager = new TrainingLogManager();

const ProgressAnalytics = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [exerciseData, setExerciseData] = useState({});
    const [selectedExercise, setSelectedExercise] = useState('');
    const [availableExercises, setAvailableExercises] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('6months'); // 1month, 3months, 6months, 1year, all

    useEffect(() => {
        loadProgressData();
    }, [timeRange]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadProgressData = async () => {
        setIsLoading(true);
        try {
            const tables = await manager.listTables();
            const exerciseProgress = {};
            const exercises = new Set();

            // Calculate date cutoff based on time range
            const now = new Date();
            let cutoffDate = new Date(0); // Default to beginning of time
            switch (timeRange) {
                case '1month':
                    cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                    break;
                case '3months':
                    cutoffDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                    break;
                case '6months':
                    cutoffDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
                    break;
                case '1year':
                    cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                    break;
                case 'all':
                default:
                    cutoffDate = new Date(0);
                    break;
            }

            // Process each workout log
            for (const table of tables) {
                const tableDate = new Date(table.date);
                if (tableDate < cutoffDate) continue;

                const fullTable = await manager.loadTable(table.id);
                if (!fullTable?.rows) continue;

                fullTable.rows.forEach(row => {
                    if (row.exercise && row.sets && row.sets.length > 0) {
                        exercises.add(row.exercise);
                        
                        if (!exerciseProgress[row.exercise]) {
                            exerciseProgress[row.exercise] = [];
                        }

                        // Find the best set (highest weight or reps)
                        const bestSet = row.sets.reduce((best, set) => {
                            const weight = parseFloat(set.weight) || 0;
                            const reps = parseFloat(set.reps) || 0;
                            const bestWeight = parseFloat(best.weight) || 0;
                            const bestReps = parseFloat(best.reps) || 0;
                            
                            // Prioritize weight, then reps
                            if (weight > bestWeight || (weight === bestWeight && reps > bestReps)) {
                                return set;
                            }
                            return best;
                        }, row.sets[0]);

                        exerciseProgress[row.exercise].push({
                            date: table.date,
                            value: parseFloat(bestSet.weight) || parseFloat(bestSet.reps) || 0,
                            weight: bestSet.weight,
                            reps: bestSet.reps,
                            sets: row.sets.length
                        });
                    }
                });
            }

            // Sort data by date for each exercise
            Object.keys(exerciseProgress).forEach(exercise => {
                exerciseProgress[exercise].sort((a, b) => new Date(a.date) - new Date(b.date));
            });

            setExerciseData(exerciseProgress);
            setAvailableExercises(Array.from(exercises).sort());
            
            // Set default selected exercise
            if (Array.from(exercises).length > 0 && !selectedExercise) {
                setSelectedExercise(Array.from(exercises)[0]);
            }
        } catch (error) {
            console.error('Error loading progress data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getTopExercises = () => {
        return Object.entries(exerciseData)
            .map(([exercise, data]) => ({
                exercise,
                sessions: data.length,
                lastValue: data[data.length - 1]?.value || 0,
                improvement: data.length > 1 ? 
                    ((data[data.length - 1].value - data[0].value) / data[0].value * 100) : 0
            }))
            .sort((a, b) => b.sessions - a.sessions)
            .slice(0, 6);
    };

    const handleExportProgressData = async () => {
        try {
            if (Object.keys(exerciseData).length === 0) return;
            
            await DataExportService.exportProgressToCSV(exerciseData, `progress_data_${timeRange}`);
        } catch (error) {
            console.error('Error exporting progress data:', error);
            alert('Failed to export progress data. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div style={{
                padding: 'var(--space-8)',
                paddingTop: 'var(--space-20)',
                background: 'var(--gradient-backdrop)',
                minHeight: '100vh',
                color: 'var(--primary-100)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '50vh'
                }}>
                    <div style={{
                        color: 'var(--primary-400)',
                        fontSize: 'var(--font-size-xl)'
                    }}>
                        Loading progress data...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            padding: 'var(--space-8)',
            paddingTop: 'var(--space-20)',
            background: 'var(--gradient-backdrop)',
            minHeight: '100vh',
            color: 'var(--primary-100)'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-8)',
                flexWrap: 'wrap',
                gap: 'var(--space-4)'
            }}>
                <div>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: 'rgba(0, 212, 255, 0.1)',
                            color: 'var(--accent-primary)',
                            border: '1px solid var(--accent-primary)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-2) var(--space-4)',
                            fontSize: 'var(--font-size-sm)',
                            cursor: 'pointer',
                            marginBottom: 'var(--space-4)',
                            minHeight: '44px',
                            transition: 'all var(--transition-normal)'
                        }}
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 style={{
                        margin: 0,
                        color: 'var(--accent-primary)',
                        fontSize: 'var(--font-size-3xl)',
                        fontWeight: '700',
                        letterSpacing: '-0.02em'
                    }}>
                        Progress Analytics
                    </h1>
                    <p style={{
                        margin: 'var(--space-2) 0 0 0',
                        color: 'var(--primary-400)',
                        fontSize: 'var(--font-size-base)'
                    }}>
                        Track your strength and performance improvements
                    </p>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    alignItems: 'flex-end'
                }}>
                    {/* Export Button */}
                    {Object.keys(exerciseData).length > 0 && (
                        <button
                            onClick={handleExportProgressData}
                            style={{
                                background: theme.surfaceSecondary,
                                color: theme.accent,
                                border: `1px solid ${theme.border}`,
                                borderRadius: '8px',
                                padding: '0.6rem 1rem',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                fontWeight: '600',
                                minHeight: '44px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={e => {
                                e.currentTarget.style.background = theme.surfaceTertiary;
                                e.currentTarget.style.borderColor = theme.accent;
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseOut={e => {
                                e.currentTarget.style.background = theme.surfaceSecondary;
                                e.currentTarget.style.borderColor = theme.border;
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            📊 Export Progress Data
                        </button>
                    )}

                    {/* Time Range Selector */}
                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        flexWrap: 'wrap'
                    }}>
                        {[
                            { value: '1month', label: '1M' },
                            { value: '3months', label: '3M' },
                            { value: '6months', label: '6M' },
                            { value: '1year', label: '1Y' },
                            { value: 'all', label: 'All' }
                        ].map(option => (
                            <button
                                key={option.value}
                                onClick={() => setTimeRange(option.value)}
                                style={{
                                background: timeRange === option.value ? theme.accent : theme.surfaceSecondary,
                                color: timeRange === option.value ? theme.background : theme.text,
                                border: `1px solid ${timeRange === option.value ? theme.accent : theme.border}`,
                                borderRadius: '6px',
                                padding: '0.5rem 1rem',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                fontWeight: timeRange === option.value ? '600' : '400',
                                minHeight: '44px',
                                transition: 'all 0.2s ease'
                            }}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {availableExercises.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: theme.textSecondary
                }}>
                    <h3>No workout data found</h3>
                    <p>Start logging workouts to see your progress here!</p>
                </div>
            ) : (
                <>
                    {/* Exercise Selector */}
                    <div style={{
                        marginBottom: '2rem',
                        background: theme.cardBackground,
                        borderRadius: '12px',
                        padding: '1.5rem',
                        border: `1px solid ${theme.cardBorder}`
                    }}>
                        <h3 style={{
                            margin: '0 0 1rem 0',
                            color: theme.accent,
                            fontSize: '1.1rem'
                        }}>
                            Select Exercise to Analyze
                        </h3>
                        <select
                            value={selectedExercise}
                            onChange={(e) => setSelectedExercise(e.target.value)}
                            style={{
                                width: '100%',
                                maxWidth: '400px',
                                padding: '0.75rem 1rem',
                                background: theme.surfaceSecondary,
                                border: `1px solid ${theme.border}`,
                                borderRadius: '8px',
                                color: theme.text,
                                fontSize: '1rem',
                                minHeight: '44px'
                            }}
                        >
                            {availableExercises.map(exercise => (
                                <option key={exercise} value={exercise}>
                                    {exercise} ({exerciseData[exercise]?.length || 0} sessions)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Progress Chart */}
                    {selectedExercise && exerciseData[selectedExercise] && (
                        <div style={{ marginBottom: '2rem' }}>
                            <ProgressChart
                                data={exerciseData[selectedExercise]}
                                title={`${selectedExercise} Progress`}
                                type="weight"
                                height={300}
                            />
                        </div>
                    )}

                    {/* Top Exercises Grid */}
                    <div style={{
                        marginBottom: '2rem'
                    }}>
                        <h3 style={{
                            margin: '0 0 1rem 0',
                            color: theme.accent,
                            fontSize: '1.3rem',
                            fontWeight: '600'
                        }}>
                            Most Trained Exercises
                        </h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '1rem'
                        }}>
                            {getTopExercises().map((exercise, index) => (
                                <div
                                    key={exercise.exercise}
                                    onClick={() => setSelectedExercise(exercise.exercise)}
                                    style={{
                                        background: theme.cardBackground,
                                        borderRadius: '12px',
                                        padding: '1.5rem',
                                        border: `1px solid ${theme.cardBorder}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <h4 style={{
                                        margin: '0 0 1rem 0',
                                        color: theme.text,
                                        fontSize: '1.1rem',
                                        fontWeight: '600'
                                    }}>
                                        {exercise.exercise}
                                    </h4>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <span style={{ color: theme.textSecondary }}>Sessions</span>
                                        <span style={{ color: theme.accent, fontWeight: '600' }}>
                                            {exercise.sessions}
                                        </span>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <span style={{ color: theme.textSecondary }}>Latest</span>
                                        <span style={{ color: theme.accent, fontWeight: '600' }}>
                                            {exercise.lastValue.toFixed(1)}lbs
                                        </span>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between'
                                    }}>
                                        <span style={{ color: theme.textSecondary }}>Progress</span>
                                        <span style={{
                                            color: exercise.improvement >= 0 ? '#28a745' : '#dc3545',
                                            fontWeight: '600'
                                        }}>
                                            {exercise.improvement.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProgressAnalytics;