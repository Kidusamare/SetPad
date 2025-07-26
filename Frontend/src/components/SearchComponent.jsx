import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { SearchService } from '../services/searchService';
import TrainingLogManager from './TrainingLogManager';

const manager = new TrainingLogManager();

const SearchComponent = ({ isFullPage = false, onClose = null }) => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState(null);
    const [workouts, setWorkouts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState({
        dateRange: null,
        muscleGroup: '',
        exerciseType: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const inputRef = useRef(null);

    // Load workouts on component mount
    useEffect(() => {
        loadWorkouts();
        loadRecentSearches();
        if (inputRef.current && !isFullPage) {
            inputRef.current.focus();
        }
    }, []);

    // Perform search when term or filters change
    useEffect(() => {
        if (searchTerm.trim()) {
            performSearch();
        } else {
            setResults(null);
        }
    }, [searchTerm, filters, workouts]);

    const loadWorkouts = async () => {
        try {
            const tables = await manager.listTables();
            const fullWorkouts = await Promise.all(
                tables.map(async (table) => {
                    const fullTable = await manager.loadTable(table.id);
                    return {
                        ...fullTable,
                        date: table.date,
                        tableName: table.tableName
                    };
                })
            );
            setWorkouts(fullWorkouts);
        } catch (error) {
            console.error('Error loading workouts:', error);
        }
    };

    const performSearch = async () => {
        setIsLoading(true);
        try {
            const searchFilters = {};
            
            if (filters.dateRange) {
                const dateFilter = SearchService.getDateRangeFilter(filters.dateRange);
                if (dateFilter) {
                    searchFilters.dateRange = dateFilter.dateRange;
                }
            }

            if (filters.muscleGroup) {
                searchFilters.muscleGroup = filters.muscleGroup;
            }

            const searchResults = SearchService.searchWorkouts(workouts, searchTerm, searchFilters);
            const formattedResults = SearchService.formatResults(searchResults, searchTerm);
            setResults(formattedResults);
            
            // Save to recent searches
            saveRecentSearch(searchTerm);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadRecentSearches = () => {
        try {
            const recent = JSON.parse(localStorage.getItem('recent_searches') || '[]');
            setRecentSearches(recent.slice(0, 5));
        } catch (error) {
            console.error('Error loading recent searches:', error);
        }
    };

    const saveRecentSearch = (term) => {
        try {
            const recent = JSON.parse(localStorage.getItem('recent_searches') || '[]');
            const updated = [term, ...recent.filter(s => s !== term)].slice(0, 10);
            localStorage.setItem('recent_searches', JSON.stringify(updated));
            setRecentSearches(updated.slice(0, 5));
        } catch (error) {
            console.error('Error saving recent search:', error);
        }
    };

    const handleWorkoutClick = (workout) => {
        navigate(`/log/${workout.id}`);
        if (onClose) onClose();
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion.value);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setResults(null);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const getMatchTypeDisplay = (matchType) => {
        const types = {
            workout_name: '📝 Workout Name',
            exercise: '💪 Exercise',
            muscle_group: '🎯 Muscle Group',
            notes: '📋 Notes',
            date: '📅 Date',
            weight: '⚖️ Weight',
            reps: '🔢 Reps',
            multiple: '🔍 Multiple Matches'
        };
        return types[matchType] || '🔍 Match';
    };

    const SearchInput = () => (
        <div style={{
            position: 'relative',
            marginBottom: isFullPage ? '1.5rem' : '1rem'
        }}>
            <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
            }}>
                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search workouts, exercises, muscle groups..."
                    style={{
                        width: '100%',
                        padding: '1rem 3rem 1rem 3rem',
                        border: `2px solid ${theme.border}`,
                        borderRadius: '12px',
                        background: theme.surfaceSecondary,
                        color: theme.text,
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor = theme.accent;
                        e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.accent}33`;
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = theme.border;
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                />
                
                {/* Search Icon */}
                <div style={{
                    position: 'absolute',
                    left: '1rem',
                    color: theme.textSecondary,
                    fontSize: '1.2rem',
                    pointerEvents: 'none'
                }}>
                    🔍
                </div>

                {/* Clear Button */}
                {searchTerm && (
                    <button
                        onClick={clearSearch}
                        style={{
                            position: 'absolute',
                            right: '1rem',
                            background: 'transparent',
                            border: 'none',
                            color: theme.textSecondary,
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            borderRadius: '4px',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={e => e.currentTarget.style.color = theme.accent}
                        onMouseOut={e => e.currentTarget.style.color = theme.textSecondary}
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Filters Toggle */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.5rem'
            }}>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                        background: 'transparent',
                        border: `1px solid ${theme.border}`,
                        borderRadius: '6px',
                        padding: '0.4rem 0.8rem',
                        color: theme.textSecondary,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={e => {
                        e.currentTarget.style.borderColor = theme.accent;
                        e.currentTarget.style.color = theme.accent;
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.borderColor = theme.border;
                        e.currentTarget.style.color = theme.textSecondary;
                    }}
                >
                    🔧 Filters {showFilters ? '↑' : '↓'}
                </button>

                {isLoading && (
                    <div style={{
                        color: theme.textSecondary,
                        fontSize: '0.8rem'
                    }}>
                        Searching...
                    </div>
                )}
            </div>
        </div>
    );

    const SearchFilters = () => showFilters && (
        <div style={{
            background: theme.surfaceSecondary,
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            border: `1px solid ${theme.border}`
        }}>
            <h4 style={{
                margin: '0 0 1rem 0',
                color: theme.accent,
                fontSize: '0.9rem'
            }}>
                Search Filters
            </h4>
            
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem'
            }}>
                {/* Date Range Filter */}
                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        color: theme.textSecondary,
                        fontSize: '0.8rem',
                        fontWeight: '500'
                    }}>
                        Date Range
                    </label>
                    <select
                        value={filters.dateRange || ''}
                        onChange={(e) => setFilters({...filters, dateRange: e.target.value || null})}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '6px',
                            background: theme.surfaceTertiary,
                            color: theme.text,
                            fontSize: '0.8rem'
                        }}
                    >
                        <option value="">All Time</option>
                        <option value="week">Last Week</option>
                        <option value="month">Last Month</option>
                        <option value="3months">Last 3 Months</option>
                        <option value="6months">Last 6 Months</option>
                        <option value="year">Last Year</option>
                    </select>
                </div>

                {/* Muscle Group Filter */}
                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        color: theme.textSecondary,
                        fontSize: '0.8rem',
                        fontWeight: '500'
                    }}>
                        Muscle Group
                    </label>
                    <input
                        type="text"
                        value={filters.muscleGroup}
                        onChange={(e) => setFilters({...filters, muscleGroup: e.target.value})}
                        placeholder="e.g., Chest, Legs"
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '6px',
                            background: theme.surfaceTertiary,
                            color: theme.text,
                            fontSize: '0.8rem',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>
            </div>

            {/* Clear Filters */}
            <button
                onClick={() => setFilters({ dateRange: null, muscleGroup: '', exerciseType: '' })}
                style={{
                    marginTop: '1rem',
                    background: 'transparent',
                    border: `1px solid ${theme.textMuted}`,
                    borderRadius: '6px',
                    padding: '0.4rem 0.8rem',
                    color: theme.textMuted,
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                }}
                onMouseOver={e => {
                    e.currentTarget.style.borderColor = theme.accent;
                    e.currentTarget.style.color = theme.accent;
                }}
                onMouseOut={e => {
                    e.currentTarget.style.borderColor = theme.textMuted;
                    e.currentTarget.style.color = theme.textMuted;
                }}
            >
                Clear Filters
            </button>
        </div>
    );

    const RecentSearches = () => recentSearches.length > 0 && !searchTerm && (
        <div style={{
            marginBottom: '1rem'
        }}>
            <h4 style={{
                margin: '0 0 0.5rem 0',
                color: theme.textSecondary,
                fontSize: '0.8rem',
                fontWeight: '500'
            }}>
                Recent Searches
            </h4>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem'
            }}>
                {recentSearches.map((search, index) => (
                    <button
                        key={index}
                        onClick={() => setSearchTerm(search)}
                        style={{
                            background: theme.surfaceSecondary,
                            border: `1px solid ${theme.border}`,
                            borderRadius: '6px',
                            padding: '0.4rem 0.8rem',
                            color: theme.textSecondary,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.background = theme.surfaceTertiary;
                            e.currentTarget.style.color = theme.accent;
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.background = theme.surfaceSecondary;
                            e.currentTarget.style.color = theme.textSecondary;
                        }}
                    >
                        {search}
                    </button>
                ))}
            </div>
        </div>
    );

    const SearchResults = () => results && (
        <div>
            {/* Results Summary */}
            <div style={{
                background: theme.surfaceSecondary,
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                border: `1px solid ${theme.border}`
            }}>
                <h3 style={{
                    margin: '0 0 0.5rem 0',
                    color: theme.accent,
                    fontSize: '1rem'
                }}>
                    Search Results for "{results.summary.searchTerm}"
                </h3>
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '0.8rem',
                    color: theme.textSecondary
                }}>
                    <span>{results.summary.workouts} workouts</span>
                    <span>{results.summary.exercises} exercises</span>
                    <span>{results.summary.muscleGroups} muscle groups</span>
                </div>
            </div>

            {/* Suggestions */}
            {results.suggestions.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{
                        margin: '0 0 0.5rem 0',
                        color: theme.textSecondary,
                        fontSize: '0.9rem'
                    }}>
                        Did you mean:
                    </h4>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                    }}>
                        {results.suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                style={{
                                    background: theme.accent + '20',
                                    border: `1px solid ${theme.accent}`,
                                    borderRadius: '6px',
                                    padding: '0.4rem 0.8rem',
                                    color: theme.accent,
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = theme.accent + '40'}
                                onMouseOut={e => e.currentTarget.style.background = theme.accent + '20'}
                            >
                                {suggestion.value}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Workout Results */}
            {results.workouts.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{
                        margin: '0 0 1rem 0',
                        color: theme.accent,
                        fontSize: '1rem',
                        fontWeight: '600'
                    }}>
                        Workouts ({results.workouts.length})
                    </h4>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                    }}>
                        {results.workouts.map((workout, index) => (
                            <div
                                key={workout.id || index}
                                onClick={() => handleWorkoutClick(workout)}
                                style={{
                                    background: theme.cardBackground,
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    border: `1px solid ${theme.cardBorder}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '0.5rem'
                                }}>
                                    <h5 style={{
                                        margin: 0,
                                        color: theme.text,
                                        fontSize: '1rem',
                                        fontWeight: '600'
                                    }}>
                                        {workout.tableName}
                                    </h5>
                                    <div style={{
                                        background: theme.surfaceSecondary,
                                        borderRadius: '4px',
                                        padding: '0.2rem 0.5rem',
                                        fontSize: '0.7rem',
                                        color: theme.textSecondary
                                    }}>
                                        {getMatchTypeDisplay(workout.matchType)}
                                    </div>
                                </div>
                                
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '0.8rem',
                                    color: theme.textSecondary
                                }}>
                                    <span>{new Date(workout.date).toLocaleDateString()}</span>
                                    {workout.matchedExercises.length > 0 && (
                                        <span>
                                            Exercises: {workout.matchedExercises.join(', ')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Exercise Results */}
            {results.exercises.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{
                        margin: '0 0 1rem 0',
                        color: theme.accent,
                        fontSize: '1rem',
                        fontWeight: '600'
                    }}>
                        Exercises ({results.exercises.length})
                    </h4>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '0.5rem'
                    }}>
                        {results.exercises.slice(0, 6).map((exercise, index) => (
                            <div
                                key={index}
                                style={{
                                    background: theme.surfaceSecondary,
                                    borderRadius: '6px',
                                    padding: '0.75rem',
                                    border: `1px solid ${theme.border}`
                                }}
                            >
                                <div style={{
                                    fontWeight: '600',
                                    color: theme.text,
                                    fontSize: '0.9rem',
                                    marginBottom: '0.25rem'
                                }}>
                                    {exercise.name}
                                </div>
                                <div style={{
                                    fontSize: '0.7rem',
                                    color: theme.textSecondary
                                }}>
                                    {exercise.muscleGroup} • Used {exercise.workoutCount} times
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Muscle Groups Results */}
            {results.muscleGroups.length > 0 && (
                <div>
                    <h4 style={{
                        margin: '0 0 1rem 0',
                        color: theme.accent,
                        fontSize: '1rem',
                        fontWeight: '600'
                    }}>
                        Muscle Groups ({results.muscleGroups.length})
                    </h4>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '0.5rem'
                    }}>
                        {results.muscleGroups.map((group, index) => (
                            <div
                                key={index}
                                style={{
                                    background: theme.surfaceSecondary,
                                    borderRadius: '6px',
                                    padding: '0.75rem',
                                    border: `1px solid ${theme.border}`,
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{
                                    fontWeight: '600',
                                    color: theme.text,
                                    fontSize: '0.9rem',
                                    marginBottom: '0.25rem'
                                }}>
                                    {group.name}
                                </div>
                                <div style={{
                                    fontSize: '0.7rem',
                                    color: theme.textSecondary
                                }}>
                                    {group.exerciseCount} exercises
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No Results */}
            {results.summary.total === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: theme.textSecondary
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: theme.text }}>
                        No results found
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                        Try adjusting your search terms or filters
                    </p>
                </div>
            )}
        </div>
    );

    if (isFullPage) {
        return (
            <div style={{
                padding: '2rem',
                paddingTop: '5rem',
                background: theme.background,
                minHeight: '100vh',
                color: theme.text
            }}>
                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '2rem'
                    }}>
                        <h1 style={{
                            margin: 0,
                            color: theme.accent,
                            fontSize: '2rem'
                        }}>
                            Search Workouts
                        </h1>
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                background: theme.surfaceSecondary,
                                color: theme.accent,
                                border: `1px solid ${theme.border}`,
                                borderRadius: '8px',
                                padding: '0.5rem 1rem',
                                cursor: 'pointer',
                                fontWeight: '600',
                                minHeight: '44px'
                            }}
                        >
                            ← Back
                        </button>
                    </div>

                    <SearchInput />
                    <SearchFilters />
                    <RecentSearches />
                    <SearchResults />
                </div>
            </div>
        );
    }

    // Modal version
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '2rem',
            paddingTop: '10vh'
        }}
        onClick={onClose}
        >
            <div
                style={{
                    background: theme.cardBackground,
                    borderRadius: '16px',
                    padding: '2rem',
                    maxWidth: '600px',
                    width: '100%',
                    maxHeight: '70vh',
                    overflow: 'auto',
                    border: `1px solid ${theme.cardBorder}`,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem'
                }}>
                    <h2 style={{
                        margin: 0,
                        color: theme.accent,
                        fontSize: '1.5rem'
                    }}>
                        Search Workouts
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: theme.textSecondary,
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            padding: '0.25rem'
                        }}
                    >
                        ✕
                    </button>
                </div>

                <SearchInput />
                <SearchFilters />
                <RecentSearches />
                <SearchResults />
            </div>
        </div>
    );
};

export default SearchComponent;