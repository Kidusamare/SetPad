import { trainingLogsAPI } from "../services/api";

export default class TrainingLogManager {
  constructor() {
    // No longer need Firebase auth reference
  }

  async loadTable(id) {
    try {
      const data = await trainingLogsAPI.getById(id);
      return data.data; // Return the log data structure
    } catch (error) {
      console.error("Error loading table:", error);
      return null;
    }
  }

  async saveTable(log) {
    try {
      const logData = {
        name: log.tableName || "New Log",
        date: log.date || new Date().toISOString().split("T")[0],
        data: log
      };
      
      await trainingLogsAPI.create(logData);
      return { message: "Saved" };
    } catch (error) {
      console.error("Error saving table:", error);
      throw new Error("Save failed");
    }
  }

  async deleteTable(id) {
    try {
      await trainingLogsAPI.delete(id);
      return true;
    } catch (error) {
      console.error("Error deleting table:", error);
      throw new Error("Delete failed");
    }
  }

  async listTables() {
    try {
      const tables = await trainingLogsAPI.getAll();
      return tables.map(table => ({
        id: table.id,
        tableName: table.data.tableName || table.name,
        date: table.data.date || table.date,
        lastOpened: table.data.lastOpened || new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error listing tables:", error);
      return [];
    }
  }

  // Get all unique muscle groups from user's logs
  async getUniqueMuscleGroups() {
    try {
      const tables = await trainingLogsAPI.getAll();
      
      const muscleGroups = new Set();
      tables.forEach(table => {
        const data = table.data;
        if (data.rows) {
          data.rows.forEach(row => {
            if (row.muscleGroup && row.muscleGroup.trim()) {
              muscleGroups.add(row.muscleGroup.trim());
            }
          });
        }
      });
      
      return Array.from(muscleGroups).sort();
    } catch (error) {
      console.error("Error fetching muscle groups:", error);
      return [];
    }
  }

  // Get all unique exercises from user's logs
  async getUniqueExercises() {
    try {
      const tables = await trainingLogsAPI.getAll();
      
      const exercises = new Set();
      tables.forEach(table => {
        const data = table.data;
        if (data.rows) {
          data.rows.forEach(row => {
            if (row.exercise && row.exercise.trim()) {
              exercises.add(row.exercise.trim());
            }
          });
        }
      });
      
      return Array.from(exercises).sort();
    } catch (error) {
      console.error("Error fetching exercises:", error);
      return [];
    }
  }

  // Get exercises for a specific muscle group
  async getExercisesForMuscleGroup(muscleGroup) {
    try {
      const tables = await trainingLogsAPI.getAll();
      
      const exercises = new Set();
      tables.forEach(table => {
        const data = table.data;
        if (data.rows) {
          data.rows.forEach(row => {
            if (row.muscleGroup === muscleGroup && row.exercise && row.exercise.trim()) {
              exercises.add(row.exercise.trim());
            }
          });
        }
      });
      
      return Array.from(exercises).sort();
    } catch (error) {
      console.error("Error fetching exercises for muscle group:", error);
      return [];
    }
  }

  createNewTable() {
    const id = crypto.randomUUID();
    const today = new Date().toISOString().split("T")[0];
    return {
      id,
      tableName: "New Log",
      date: today,
      rows: [
        {
          id: 0,
          muscleGroup: "",
          exercise: "",
          sets: [{ reps: "", weight: "" }],
          notes: "",
          showNotes: false,
          weightUnit: "lbs",
        },
      ],
    };
  }
}