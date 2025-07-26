import { getTables, getTable, createTable, updateTable, deleteTable } from '../services/api';

export default class TrainingLogManager {
  // List all tables
  async listTables() {
    return await getTables();
  }

  // Load a single table by ID
  async loadTable(id) {
    return await getTable(id);
  }

  // Create a new table in the backend
  async createTable(log) {
    return await createTable(log);
  }

  // Save (update) a table
  async saveTable(log) {
    if (!log.id) {
      // Create new
      return await createTable(log);
    } else {
      // Update existing
      return await updateTable(log.id, log);
    }
  }

  // Delete a table by ID
  async deleteTable(id) {
    return await deleteTable(id);
  }

  // Get all unique muscle groups from all logs
  async getUniqueMuscleGroups() {
    const tables = await getTables();
    const muscleGroups = new Set();
    tables.forEach(data => {
      if (data.rows) {
        data.rows.forEach(row => {
          if (row.muscleGroup && row.muscleGroup.trim()) {
            muscleGroups.add(row.muscleGroup.trim());
          }
        });
      }
    });
    return Array.from(muscleGroups).sort();
  }

  // Get all unique exercises from all logs
  async getUniqueExercises() {
    const tables = await getTables();
    const exercises = new Set();
    tables.forEach(data => {
      if (data.rows) {
        data.rows.forEach(row => {
          if (row.exercise && row.exercise.trim()) {
            exercises.add(row.exercise.trim());
          }
        });
      }
    });
    return Array.from(exercises).sort();
  }

  // Get exercises for a specific muscle group
  async getExercisesForMuscleGroup(muscleGroup) {
    const tables = await getTables();
    const exercises = new Set();
    tables.forEach(data => {
      if (data.rows) {
        data.rows.forEach(row => {
          if (row.muscleGroup === muscleGroup && row.exercise && row.exercise.trim()) {
            exercises.add(row.exercise.trim());
          }
        });
      }
    });
    return Array.from(exercises).sort();
  }

  // Create a new table object (not saved yet)
  createNewTable() {
    const id = crypto.randomUUID();
    const today = new Date().toISOString().split('T')[0];
    return {
      id,
      tableName: 'New Log',
      date: today,
      rows: [
        {
          id: 0,
          muscleGroup: '',
          exercise: '',
          sets: [{ reps: '', weight: '' }],
          notes: '',
          showNotes: false,
          weightUnit: 'lbs',
        },
      ],
    };
  }
}
