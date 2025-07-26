// Search Service
// Provides comprehensive search functionality across workouts and exercises

export class SearchService {
    /**
     * Search across all workouts and exercises
     * @param {Array} workouts - Array of workout objects
     * @param {string} searchTerm - Search term to look for
     * @param {Object} filters - Search filters
     * @returns {Object} Search results organized by type
     */
    static searchWorkouts(workouts, searchTerm, filters = {}) {
        if (!searchTerm.trim()) {
            return {
                workouts: [],
                exercises: [],
                muscleGroups: [],
                suggestions: []
            };
        }

        const term = searchTerm.toLowerCase().trim();
        const results = {
            workouts: [],
            exercises: [],
            muscleGroups: [],
            suggestions: []
        };

        // Search through workouts
        workouts.forEach(workout => {
            const workoutMatch = this.searchInWorkout(workout, term, filters);
            if (workoutMatch.matches) {
                results.workouts.push({
                    ...workout,
                    matchType: workoutMatch.matchType,
                    matchedExercises: workoutMatch.matchedExercises,
                    relevanceScore: workoutMatch.relevanceScore
                });
            }
        });

        // Extract unique exercises and muscle groups
        const allExercises = new Set();
        const allMuscleGroups = new Set();

        workouts.forEach(workout => {
            workout.rows?.forEach(row => {
                if (row.exercise) {
                    allExercises.add(row.exercise.toLowerCase());
                    if (this.fuzzyMatch(row.exercise.toLowerCase(), term)) {
                        results.exercises.push({
                            name: row.exercise,
                            muscleGroup: row.muscleGroup,
                            workoutCount: this.countExerciseOccurrences(workouts, row.exercise),
                            lastUsed: workout.date
                        });
                    }
                }
                if (row.muscleGroup) {
                    allMuscleGroups.add(row.muscleGroup.toLowerCase());
                    if (this.fuzzyMatch(row.muscleGroup.toLowerCase(), term)) {
                        results.muscleGroups.push({
                            name: row.muscleGroup,
                            exerciseCount: this.countMuscleGroupExercises(workouts, row.muscleGroup),
                            workoutCount: this.countMuscleGroupWorkouts(workouts, row.muscleGroup)
                        });
                    }
                }
            });
        });

        // Remove duplicates and sort by relevance
        results.exercises = this.removeDuplicates(results.exercises, 'name')
            .sort((a, b) => b.workoutCount - a.workoutCount);

        results.muscleGroups = this.removeDuplicates(results.muscleGroups, 'name')
            .sort((a, b) => b.workoutCount - a.workoutCount);

        results.workouts.sort((a, b) => b.relevanceScore - a.relevanceScore);

        // Generate search suggestions
        results.suggestions = this.generateSuggestions(term, allExercises, allMuscleGroups);

        return results;
    }

    /**
     * Search within a single workout
     */
    static searchInWorkout(workout, term, filters = {}) {
        let matches = false;
        let matchType = '';
        let matchedExercises = [];
        let relevanceScore = 0;

        // Check workout name
        if (this.fuzzyMatch(workout.tableName?.toLowerCase() || '', term)) {
            matches = true;
            matchType = 'workout_name';
            relevanceScore += 10;
        }

        // Check date
        if (workout.date && workout.date.includes(term)) {
            matches = true;
            matchType = matchType ? 'multiple' : 'date';
            relevanceScore += 5;
        }

        // Check exercises and notes
        workout.rows?.forEach(row => {
            if (row.exercise && this.fuzzyMatch(row.exercise.toLowerCase(), term)) {
                matches = true;
                matchType = matchType ? 'multiple' : 'exercise';
                matchedExercises.push(row.exercise);
                relevanceScore += 8;
            }

            if (row.muscleGroup && this.fuzzyMatch(row.muscleGroup.toLowerCase(), term)) {
                matches = true;
                matchType = matchType ? 'multiple' : 'muscle_group';
                relevanceScore += 6;
            }

            if (row.notes && this.fuzzyMatch(row.notes.toLowerCase(), term)) {
                matches = true;
                matchType = matchType ? 'multiple' : 'notes';
                relevanceScore += 3;
            }

            // Check set data (weight/reps)
            if (row.sets) {
                row.sets.forEach(set => {
                    if (set.weight && set.weight.toString().includes(term)) {
                        matches = true;
                        matchType = matchType ? 'multiple' : 'weight';
                        relevanceScore += 2;
                    }
                    if (set.reps && set.reps.toString().includes(term)) {
                        matches = true;
                        matchType = matchType ? 'multiple' : 'reps';
                        relevanceScore += 2;
                    }
                });
            }
        });

        // Apply filters
        if (matches && filters.dateRange) {
            const workoutDate = new Date(workout.date);
            const { start, end } = filters.dateRange;
            if (workoutDate < start || workoutDate > end) {
                matches = false;
            }
        }

        if (matches && filters.muscleGroup) {
            const hasTargetMuscleGroup = workout.rows?.some(row => 
                row.muscleGroup?.toLowerCase() === filters.muscleGroup.toLowerCase()
            );
            if (!hasTargetMuscleGroup) {
                matches = false;
            }
        }

        return {
            matches,
            matchType,
            matchedExercises: [...new Set(matchedExercises)],
            relevanceScore
        };
    }

    /**
     * Fuzzy string matching with tolerance for typos
     */
    static fuzzyMatch(text, term) {
        // Exact match
        if (text.includes(term)) return true;

        // Split into words for partial matching
        const textWords = text.split(/\s+/);
        const termWords = term.split(/\s+/);

        // Check if any term word matches any text word
        return termWords.some(termWord => 
            textWords.some(textWord => {
                // Partial word match
                if (textWord.includes(termWord) || termWord.includes(textWord)) return true;
                
                // Edit distance for typo tolerance
                return this.levenshteinDistance(textWord, termWord) <= Math.max(1, Math.floor(termWord.length * 0.3));
            })
        );
    }

    /**
     * Calculate Levenshtein distance for fuzzy matching
     */
    static levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));

        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,     // deletion
                    matrix[j - 1][i] + 1,     // insertion
                    matrix[j - 1][i - 1] + cost // substitution
                );
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * Remove duplicates from array based on key
     */
    static removeDuplicates(array, key) {
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) return false;
            seen.add(value);
            return true;
        });
    }

    /**
     * Count exercise occurrences across all workouts
     */
    static countExerciseOccurrences(workouts, exerciseName) {
        return workouts.reduce((count, workout) => {
            return count + (workout.rows?.filter(row => 
                row.exercise?.toLowerCase() === exerciseName.toLowerCase()
            ).length || 0);
        }, 0);
    }

    /**
     * Count exercises in a muscle group
     */
    static countMuscleGroupExercises(workouts, muscleGroup) {
        const exercises = new Set();
        workouts.forEach(workout => {
            workout.rows?.forEach(row => {
                if (row.muscleGroup?.toLowerCase() === muscleGroup.toLowerCase() && row.exercise) {
                    exercises.add(row.exercise.toLowerCase());
                }
            });
        });
        return exercises.size;
    }

    /**
     * Count workouts containing a muscle group
     */
    static countMuscleGroupWorkouts(workouts, muscleGroup) {
        return workouts.filter(workout => 
            workout.rows?.some(row => 
                row.muscleGroup?.toLowerCase() === muscleGroup.toLowerCase()
            )
        ).length;
    }

    /**
     * Generate search suggestions based on available data
     */
    static generateSuggestions(term, exercises, muscleGroups) {
        const suggestions = [];
        
        // Find similar exercises
        const similarExercises = Array.from(exercises).filter(exercise => 
            this.fuzzyMatch(exercise, term) && exercise !== term
        ).slice(0, 3);

        // Find similar muscle groups
        const similarMuscleGroups = Array.from(muscleGroups).filter(group => 
            this.fuzzyMatch(group, term) && group !== term
        ).slice(0, 2);

        suggestions.push(...similarExercises.map(ex => ({ type: 'exercise', value: ex })));
        suggestions.push(...similarMuscleGroups.map(mg => ({ type: 'muscle_group', value: mg })));

        return suggestions;
    }

    /**
     * Get search filters for date ranges
     */
    static getDateRangeFilter(range) {
        const now = new Date();
        const filters = {};

        switch (range) {
            case 'week':
                filters.start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                filters.end = now;
                break;
            case 'month':
                filters.start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                filters.end = now;
                break;
            case '3months':
                filters.start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                filters.end = now;
                break;
            case '6months':
                filters.start = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
                filters.end = now;
                break;
            case 'year':
                filters.start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                filters.end = now;
                break;
            default:
                return null;
        }

        return { dateRange: filters };
    }

    /**
     * Format search results for display
     */
    static formatResults(results, term) {
        return {
            ...results,
            summary: {
                total: results.workouts.length + results.exercises.length + results.muscleGroups.length,
                workouts: results.workouts.length,
                exercises: results.exercises.length,
                muscleGroups: results.muscleGroups.length,
                searchTerm: term
            }
        };
    }
}