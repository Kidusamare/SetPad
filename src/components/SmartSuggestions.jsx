import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { InlineSpinner } from "./LoadingSpinner";
import AIService from "../services/aiCacheService";

const SmartSuggestions = ({ muscleGroup, currentExercise, onSuggestionSelect }) => {
    const { theme } = useTheme();
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [cacheInfo, setCacheInfo] = useState({ fromCache: false });

    // Exercise database by muscle group
    const exerciseDatabase = {
        "Chest": [
            "Bench Press", "Incline Bench Press", "Decline Bench Press", "Dumbbell Press",
            "Incline Dumbbell Press", "Dumbbell Flyes", "Incline Flyes", "Cable Flyes",
            "Push-ups", "Dips", "Chest Press Machine", "Pec Deck", "Cable Crossover"
        ],
        "Back": [
            "Deadlift", "Pull-ups", "Chin-ups", "Barbell Rows", "Dumbbell Rows",
            "T-Bar Rows", "Cable Rows", "Lat Pulldowns", "Face Pulls", "Reverse Flyes",
            "Hyperextensions", "Good Mornings", "Shrugs"
        ],
        "Shoulders": [
            "Overhead Press", "Military Press", "Dumbbell Press", "Arnold Press",
            "Lateral Raises", "Front Raises", "Rear Delt Flyes", "Upright Rows",
            "Pike Push-ups", "Handstand Push-ups", "Cable Lateral Raises"
        ],
        "Legs": [
            "Squat", "Front Squat", "Leg Press", "Lunges", "Bulgarian Split Squats",
            "Romanian Deadlift", "Leg Curls", "Leg Extensions", "Calf Raises",
            "Walking Lunges", "Step-ups", "Wall Sits", "Single Leg Deadlifts"
        ],
        "Biceps": [
            "Barbell Curls", "Dumbbell Curls", "Hammer Curls", "Cable Curls",
            "Preacher Curls", "Concentration Curls", "21s", "Chin-ups"
        ],
        "Triceps": [
            "Close-Grip Bench Press", "Tricep Dips", "Overhead Tricep Extension",
            "Tricep Pushdowns", "Diamond Push-ups", "Skull Crushers", "French Press"
        ],
        "Abs": [
            "Plank", "Crunches", "Bicycle Crunches", "Russian Twists", "Mountain Climbers",
            "Hanging Leg Raises", "Ab Wheel", "Dead Bug", "Hollow Body Hold"
        ],
        "Glutes": [
            "Hip Thrusts", "Glute Bridges", "Romanian Deadlift", "Bulgarian Split Squats",
            "Clamshells", "Monster Walks", "Fire Hydrants", "Glute Ham Raise"
        ],
        "Calves": [
            "Calf Raises", "Seated Calf Raises", "Donkey Calf Raises", "Jump Rope",
            "Box Jumps", "Single Leg Calf Raises"
        ]
    };

    // AI-powered suggestions based on workout context
    const getAISuggestions = async (muscleGroup, currentExercise) => {
        setIsLoading(true);
        try {
            // Use cached AI service for exercise suggestions
            const result = await AIService.getExerciseSuggestions(muscleGroup, currentExercise);
            
            setCacheInfo({ fromCache: result.fromCache });
            console.log(`[Smart Suggestions] ${result.fromCache ? 'Using cached suggestions' : 'Fetched new suggestions'}`);
            
            return result.data.suggestions || [];
        } catch (error) {
            console.error("AI suggestions error:", error);
            
            // Handle rate limiting gracefully
            if (error.message.includes('Rate limited')) {
                console.warn('[Smart Suggestions] Rate limited, using fallback suggestions');
            }
        }
        
        // Fallback to local database
        return getLocalSuggestions(muscleGroup, currentExercise);
    };

    const getLocalSuggestions = (muscleGroup, currentExercise) => {
        const exercises = exerciseDatabase[muscleGroup] || [];
        return exercises
            .filter(exercise => 
                exercise.toLowerCase() !== currentExercise.toLowerCase() &&
                exercise.toLowerCase().includes(currentExercise.toLowerCase().split(' ')[0])
            )
            .slice(0, 5);
    };

    const fetchSuggestions = async () => {
        if (!muscleGroup || muscleGroup.length < 2) {
            setSuggestions([]);
            return;
        }

        const aiSuggestions = await getAISuggestions(muscleGroup, currentExercise);
        const localSuggestions = getLocalSuggestions(muscleGroup, currentExercise);
        
        // Combine and deduplicate suggestions
        const combinedSuggestions = [...new Set([...aiSuggestions, ...localSuggestions])];
        setSuggestions(combinedSuggestions.slice(0, 6));
        setIsLoading(false);
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchSuggestions();
        }, 300); // Debounce suggestions

        return () => clearTimeout(timeoutId);
    }, [muscleGroup, currentExercise]);

    const handleSuggestionClick = (suggestion) => {
        onSuggestionSelect(suggestion);
        setShowSuggestions(false);
    };

    const toggleSuggestions = () => {
        setShowSuggestions(!showSuggestions);
    };

    if (!muscleGroup || (!isLoading && suggestions.length === 0)) {
        return null;
    }

    return (
        <div style={{ marginTop: "0.5rem" }}>
            <button
                onClick={toggleSuggestions}
                style={{
                    background: "none",
                    border: "none",
                    color: theme.accent,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    padding: "0.2rem 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    transition: "color 0.2s ease"
                }}
                onMouseOver={e => e.currentTarget.style.color = theme.accentHover}
                onMouseOut={e => e.currentTarget.style.color = theme.accent}
            >
                {isLoading ? (
                    <>
                        <InlineSpinner size="small" />
                        Getting suggestions...
                    </>
                ) : (
                    <>
                        Smart Suggestions ({suggestions.length})
                        {cacheInfo.fromCache && (
                            <span style={{
                                fontSize: "0.7rem",
                                color: theme.textMuted,
                                marginLeft: "0.5rem",
                                opacity: 0.8
                            }}>
                                (cached)
                            </span>
                        )}
                        <span style={{
                            transform: showSuggestions ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s ease"
                        }}>
                            ▼
                        </span>
                    </>
                )}
            </button>

            {showSuggestions && suggestions.length > 0 && (
                <div style={{
                    marginTop: "0.5rem",
                    background: theme.surfaceSecondary,
                    border: `1px solid ${theme.border}`,
                    borderRadius: "8px",
                    padding: "0.5rem",
                    maxHeight: "150px",
                    overflowY: "auto"
                }}>
                    <div style={{
                        fontSize: "0.7rem",
                        color: theme.textMuted,
                        marginBottom: "0.5rem",
                        fontStyle: "italic"
                    }}>
                        AI-powered exercise suggestions for {muscleGroup}:
                    </div>
                    
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.2rem"
                    }}>
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: theme.text,
                                    fontSize: "0.8rem",
                                    padding: "0.3rem 0.5rem",
                                    textAlign: "left",
                                    cursor: "pointer",
                                    borderRadius: "4px",
                                    transition: "background 0.2s ease"
                                }}
                                onMouseOver={e => e.currentTarget.style.background = theme.surfaceTertiary}
                                onMouseOut={e => e.currentTarget.style.background = "none"}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Weight and Rep Suggestions Component
export const ProgressionSuggestions = ({ currentSets, exercise, onSuggestionApply }) => {
    const { theme } = useTheme();
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (currentSets && currentSets.length > 0) {
            generateProgressionSuggestions();
        }
    }, [currentSets, exercise]);

    const generateProgressionSuggestions = () => {
        const suggestions = [];
        
        if (currentSets.length > 0) {
            const lastSet = currentSets[currentSets.length - 1];
            const weight = parseFloat(lastSet.weight) || 0;
            const reps = parseInt(lastSet.reps) || 0;

            if (weight > 0 && reps > 0) {
                // Progressive overload suggestions
                suggestions.push({
                    type: "Weight Increase",
                    description: `Add 5 lbs: ${weight + 5} lbs x ${reps} reps`,
                    sets: currentSets.map(set => ({
                        ...set,
                        weight: (parseFloat(set.weight) + 5).toString()
                    }))
                });

                suggestions.push({
                    type: "Rep Increase", 
                    description: `Add 2 reps: ${weight} lbs x ${reps + 2} reps`,
                    sets: currentSets.map(set => ({
                        ...set,
                        reps: (parseInt(set.reps) + 2).toString()
                    }))
                });

                if (reps >= 12) {
                    suggestions.push({
                        type: "Weight + Rep Adjustment",
                        description: `${weight + 10} lbs x ${Math.max(6, reps - 3)} reps`,
                        sets: currentSets.map(set => ({
                            ...set,
                            weight: (parseFloat(set.weight) + 10).toString(),
                            reps: Math.max(6, parseInt(set.reps) - 3).toString()
                        }))
                    });
                }
            }
        }

        setSuggestions(suggestions);
    };

    const applySuggestion = (suggestion) => {
        onSuggestionApply(suggestion.sets);
        setShowSuggestions(false);
    };

    if (suggestions.length === 0) return null;

    return (
        <div style={{ marginTop: "0.5rem" }}>
            <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                style={{
                    background: "none",
                    border: "none",
                    color: theme.accent,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    padding: "0.2rem 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem"
                }}
            >
                Progressive Overload Suggestions
                <span style={{
                    transform: showSuggestions ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease"
                }}>
                    ▼
                </span>
            </button>

            {showSuggestions && (
                <div style={{
                    marginTop: "0.5rem",
                    background: theme.surfaceSecondary,
                    border: `1px solid ${theme.border}`,
                    borderRadius: "8px",
                    padding: "0.8rem"
                }}>
                    {suggestions.map((suggestion, index) => (
                        <div key={index} style={{
                            marginBottom: index < suggestions.length - 1 ? "0.8rem" : 0
                        }}>
                            <div style={{
                                fontWeight: "600",
                                color: theme.text,
                                fontSize: "0.8rem",
                                marginBottom: "0.2rem"
                            }}>
                                {suggestion.type}
                            </div>
                            <div style={{
                                color: theme.textSecondary,
                                fontSize: "0.7rem",
                                marginBottom: "0.5rem"
                            }}>
                                {suggestion.description}
                            </div>
                            <button
                                onClick={() => applySuggestion(suggestion)}
                                style={{
                                    background: theme.accent,
                                    color: theme.background,
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "0.3rem 0.8rem",
                                    fontSize: "0.7rem",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "background 0.2s ease"
                                }}
                                onMouseOver={e => e.currentTarget.style.background = theme.accentHover}
                                onMouseOut={e => e.currentTarget.style.background = theme.accent}
                            >
                                Apply
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SmartSuggestions;