// Workout Templates Service
// Handles both predefined and user-created workout templates
export const WORKOUT_TEMPLATES = {
  'push-day': {
    name: 'Push Day',
    description: 'Chest, Shoulders, and Triceps workout',
    exercises: [
      {
        muscleGroup: 'Chest',
        exercise: 'Bench Press',
        sets: [
          { reps: '8-10', weight: '' },
          { reps: '8-10', weight: '' },
          { reps: '8-10', weight: '' }
        ],
        notes: 'Focus on controlled movement'
      },
      {
        muscleGroup: 'Chest',
        exercise: 'Incline Dumbbell Press',
        sets: [
          { reps: '10-12', weight: '' },
          { reps: '10-12', weight: '' },
          { reps: '10-12', weight: '' }
        ],
        notes: '45-degree incline'
      },
      {
        muscleGroup: 'Shoulders',
        exercise: 'Overhead Press',
        sets: [
          { reps: '8-10', weight: '' },
          { reps: '8-10', weight: '' },
          { reps: '8-10', weight: '' }
        ],
        notes: 'Keep core tight'
      },
      {
        muscleGroup: 'Shoulders',
        exercise: 'Lateral Raises',
        sets: [
          { reps: '12-15', weight: '' },
          { reps: '12-15', weight: '' },
          { reps: '12-15', weight: '' }
        ],
        notes: 'Control the negative'
      },
      {
        muscleGroup: 'Triceps',
        exercise: 'Tricep Dips',
        sets: [
          { reps: '10-12', weight: '' },
          { reps: '10-12', weight: '' },
          { reps: '10-12', weight: '' }
        ],
        notes: 'Full range of motion'
      }
    ]
  },
  
  'pull-day': {
    name: 'Pull Day',
    description: 'Back and Biceps workout',
    exercises: [
      {
        muscleGroup: 'Back',
        exercise: 'Pull-ups',
        sets: [
          { reps: '6-8', weight: '' },
          { reps: '6-8', weight: '' },
          { reps: '6-8', weight: '' }
        ],
        notes: 'Use assistance if needed'
      },
      {
        muscleGroup: 'Back',
        exercise: 'Bent-over Rows',
        sets: [
          { reps: '8-10', weight: '' },
          { reps: '8-10', weight: '' },
          { reps: '8-10', weight: '' }
        ],
        notes: 'Squeeze shoulder blades'
      },
      {
        muscleGroup: 'Back',
        exercise: 'Lat Pulldowns',
        sets: [
          { reps: '10-12', weight: '' },
          { reps: '10-12', weight: '' },
          { reps: '10-12', weight: '' }
        ],
        notes: 'Pull to upper chest'
      },
      {
        muscleGroup: 'Biceps',
        exercise: 'Barbell Curls',
        sets: [
          { reps: '10-12', weight: '' },
          { reps: '10-12', weight: '' },
          { reps: '10-12', weight: '' }
        ],
        notes: 'No swinging'
      },
      {
        muscleGroup: 'Biceps',
        exercise: 'Hammer Curls',
        sets: [
          { reps: '12-15', weight: '' },
          { reps: '12-15', weight: '' },
          { reps: '12-15', weight: '' }
        ],
        notes: 'Neutral grip'
      }
    ]
  },
  
  'leg-day': {
    name: 'Leg Day',
    description: 'Comprehensive lower body workout',
    exercises: [
      {
        muscleGroup: 'Legs',
        exercise: 'Squats',
        sets: [
          { reps: '8-10', weight: '' },
          { reps: '8-10', weight: '' },
          { reps: '8-10', weight: '' },
          { reps: '8-10', weight: '' }
        ],
        notes: 'Go below parallel'
      },
      {
        muscleGroup: 'Legs',
        exercise: 'Romanian Deadlifts',
        sets: [
          { reps: '8-10', weight: '' },
          { reps: '8-10', weight: '' },
          { reps: '8-10', weight: '' }
        ],
        notes: 'Hinge at hips'
      },
      {
        muscleGroup: 'Legs',
        exercise: 'Leg Press',
        sets: [
          { reps: '12-15', weight: '' },
          { reps: '12-15', weight: '' },
          { reps: '12-15', weight: '' }
        ],
        notes: 'Full range of motion'
      },
      {
        muscleGroup: 'Legs',
        exercise: 'Walking Lunges',
        sets: [
          { reps: '10-12 each leg', weight: '' },
          { reps: '10-12 each leg', weight: '' },
          { reps: '10-12 each leg', weight: '' }
        ],
        notes: 'Step out wide'
      },
      {
        muscleGroup: 'Calves',
        exercise: 'Calf Raises',
        sets: [
          { reps: '15-20', weight: '' },
          { reps: '15-20', weight: '' },
          { reps: '15-20', weight: '' }
        ],
        notes: 'Pause at the top'
      }
    ]
  },
  
  'upper-body': {
    name: 'Upper Body',
    description: 'Complete upper body workout',
    exercises: [
      {
        muscleGroup: 'Chest',
        exercise: 'Push-ups',
        sets: [
          { reps: '10-15', weight: '' },
          { reps: '10-15', weight: '' },
          { reps: '10-15', weight: '' }
        ],
        notes: 'Modify as needed'
      },
      {
        muscleGroup: 'Back',
        exercise: 'Inverted Rows',
        sets: [
          { reps: '8-12', weight: '' },
          { reps: '8-12', weight: '' },
          { reps: '8-12', weight: '' }
        ],
        notes: 'Body straight'
      },
      {
        muscleGroup: 'Shoulders',
        exercise: 'Pike Push-ups',
        sets: [
          { reps: '6-10', weight: '' },
          { reps: '6-10', weight: '' },
          { reps: '6-10', weight: '' }
        ],
        notes: 'Hands shoulder-width apart'
      },
      {
        muscleGroup: 'Arms',
        exercise: 'Diamond Push-ups',
        sets: [
          { reps: '5-8', weight: '' },
          { reps: '5-8', weight: '' },
        ],
        notes: 'Targets triceps'
      }
    ]
  },
  
  'cardio-strength': {
    name: 'Cardio + Strength',
    description: 'High-intensity circuit training',
    exercises: [
      {
        muscleGroup: 'Full Body',
        exercise: 'Burpees',
        sets: [
          { reps: '10-15', weight: '' },
          { reps: '10-15', weight: '' },
          { reps: '10-15', weight: '' }
        ],
        notes: '30 sec rest between sets'
      },
      {
        muscleGroup: 'Legs',
        exercise: 'Jump Squats',
        sets: [
          { reps: '15-20', weight: '' },
          { reps: '15-20', weight: '' },
          { reps: '15-20', weight: '' }
        ],
        notes: 'Land softly'
      },
      {
        muscleGroup: 'Core',
        exercise: 'Mountain Climbers',
        sets: [
          { reps: '20-30', weight: '' },
          { reps: '20-30', weight: '' },
          { reps: '20-30', weight: '' }
        ],
        notes: 'Keep hips level'
      },
      {
        muscleGroup: 'Full Body',
        exercise: 'Kettlebell Swings',
        sets: [
          { reps: '15-20', weight: '' },
          { reps: '15-20', weight: '' },
          { reps: '15-20', weight: '' }
        ],
        notes: 'Hip drive, not arms'
      }
    ]
  },
  
  'beginner-full-body': {
    name: 'Beginner Full Body',
    description: 'Perfect for those starting their fitness journey',
    exercises: [
      {
        muscleGroup: 'Legs',
        exercise: 'Bodyweight Squats',
        sets: [
          { reps: '10-15', weight: '' },
          { reps: '10-15', weight: '' }
        ],
        notes: 'Focus on form'
      },
      {
        muscleGroup: 'Chest',
        exercise: 'Modified Push-ups',
        sets: [
          { reps: '5-10', weight: '' },
          { reps: '5-10', weight: '' }
        ],
        notes: 'Knees down if needed'
      },
      {
        muscleGroup: 'Core',
        exercise: 'Plank',
        sets: [
          { reps: '20-30 seconds', weight: '' },
          { reps: '20-30 seconds', weight: '' }
        ],
        notes: 'Keep body straight'
      },
      {
        muscleGroup: 'Legs',
        exercise: 'Glute Bridges',
        sets: [
          { reps: '10-15', weight: '' },
          { reps: '10-15', weight: '' }
        ],
        notes: 'Squeeze glutes at top'
      }
    ]
  }
};

// Function to get template by ID
export const getWorkoutTemplate = (templateId) => {
  return WORKOUT_TEMPLATES[templateId] || null;
};

// Function to get all template names for display
export const getTemplateList = () => {
  return Object.keys(WORKOUT_TEMPLATES).map(key => ({
    id: key,
    name: WORKOUT_TEMPLATES[key].name,
    description: WORKOUT_TEMPLATES[key].description,
    exerciseCount: WORKOUT_TEMPLATES[key].exercises.length
  }));
};

// Function to apply template to a workout log
export const applyTemplateToLog = (templateId, currentLog) => {
  const template = getWorkoutTemplate(templateId);
  if (!template) return currentLog;
  
  // Convert template exercises to log rows
  const templateRows = template.exercises.map((exercise, index) => ({
    id: index,
    muscleGroup: exercise.muscleGroup,
    exercise: exercise.exercise,
    sets: exercise.sets.map(set => ({
      reps: set.reps,
      weight: set.weight
    })),
    notes: exercise.notes || '',
    showNotes: !!exercise.notes,
    weightUnit: 'lbs'
  }));
  
  return {
    ...currentLog,
    tableName: template.name,
    rows: templateRows
  };
};

// Function to create smart defaults based on user history
export const getSmartDefaults = async (exercise, userHistory = []) => {
  // Filter history for the specific exercise
  const exerciseHistory = userHistory.filter(
    entry => entry.exercise?.toLowerCase() === exercise?.toLowerCase()
  );
  
  if (exerciseHistory.length === 0) {
    return {
      sets: [{ reps: '', weight: '' }],
      suggestedReps: '',
      suggestedWeight: ''
    };
  }
  
  // Get the most recent entry for this exercise
  const recentEntry = exerciseHistory[exerciseHistory.length - 1];
  
  // Calculate suggested progression (small increase in weight or reps)
  const lastWeight = parseFloat(recentEntry.sets?.[0]?.weight) || 0;
  const lastReps = parseInt(recentEntry.sets?.[0]?.reps) || 0;
  
  const suggestedWeight = lastWeight > 0 ? (lastWeight + 2.5).toString() : '';
  const suggestedReps = lastReps > 0 ? lastReps.toString() : '';
  
  return {
    sets: recentEntry.sets || [{ reps: '', weight: '' }],
    suggestedReps,
    suggestedWeight,
    lastPerformed: recentEntry.date,
    progressionNote: lastWeight > 0 ? `Last time: ${lastWeight}lbs` : ''
  };
};

// Custom Template Management
const CUSTOM_TEMPLATES_KEY = 'fitness_custom_templates';

// Function to save a workout as a custom template
export const saveWorkoutAsTemplate = async (workout, templateName, description = '') => {
  try {
    // Get existing custom templates
    const existingTemplates = getCustomTemplates();
    
    // Create template ID from name
    const templateId = templateName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Convert workout to template format
    const template = {
      id: templateId,
      name: templateName,
      description: description || `Custom template created from ${workout.tableName}`,
      isCustom: true,
      createdDate: new Date().toISOString(),
      exercises: workout.rows.map(row => ({
        muscleGroup: row.muscleGroup || '',
        exercise: row.exercise || '',
        sets: row.sets.map(set => ({
          reps: set.reps || '',
          weight: '' // Don't save weights in templates
        })),
        notes: row.notes || ''
      })).filter(exercise => exercise.exercise) // Only include rows with exercises
    };
    
    // Save to localStorage
    const updatedTemplates = {
      ...existingTemplates,
      [templateId]: template
    };
    
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updatedTemplates));
    
    return {
      success: true,
      templateId,
      message: `Template "${templateName}" saved successfully!`
    };
  } catch (error) {
    console.error('Error saving custom template:', error);
    return {
      success: false,
      message: 'Failed to save template. Please try again.'
    };
  }
};

// Function to get all custom templates
export const getCustomTemplates = () => {
  try {
    const stored = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading custom templates:', error);
    return {};
  }
};

// Function to get all templates (predefined + custom)
export const getAllTemplates = () => {
  const predefined = getTemplateList();
  const custom = getCustomTemplates();
  
  const customList = Object.values(custom).map(template => ({
    id: template.id,
    name: template.name,
    description: template.description,
    exerciseCount: template.exercises.length,
    isCustom: true,
    createdDate: template.createdDate
  }));
  
  return [...predefined, ...customList];
};

// Function to get a template (predefined or custom)
export const getTemplate = (templateId) => {
  // Check predefined templates first
  const predefined = getWorkoutTemplate(templateId);
  if (predefined) return predefined;
  
  // Check custom templates
  const customTemplates = getCustomTemplates();
  return customTemplates[templateId] || null;
};

// Function to delete a custom template
export const deleteCustomTemplate = (templateId) => {
  try {
    const templates = getCustomTemplates();
    if (templates[templateId]) {
      delete templates[templateId];
      localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(templates));
      return { success: true, message: 'Template deleted successfully!' };
    }
    return { success: false, message: 'Template not found.' };
  } catch (error) {
    console.error('Error deleting template:', error);
    return { success: false, message: 'Failed to delete template.' };
  }
};

// Function to apply any template (predefined or custom) to a workout log
export const applyAnyTemplateToLog = (templateId, currentLog) => {
  const template = getTemplate(templateId);
  if (!template) return currentLog;
  
  // Convert template exercises to log rows
  const templateRows = template.exercises.map((exercise, index) => ({
    id: index,
    muscleGroup: exercise.muscleGroup,
    exercise: exercise.exercise,
    sets: exercise.sets.map(set => ({
      reps: set.reps,
      weight: set.weight
    })),
    notes: exercise.notes || '',
    showNotes: !!exercise.notes,
    weightUnit: 'lbs'
  }));
  
  return {
    ...currentLog,
    tableName: template.name,
    rows: templateRows
  };
};