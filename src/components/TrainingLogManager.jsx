import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  collection,
  query,
  orderBy 
} from "firebase/firestore";
import { db, auth } from "../utils/auth";

export default class TrainingLogManager {
  constructor() {
    this.user = auth.currentUser;
  }

  // Get the current user's UID
  getUserId() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }
    return user.uid;
  }

  // Get Firestore document reference for a specific table
  getTableDoc(logId) {
    const userId = this.getUserId();
    return doc(db, "users", userId, "tables", logId);
  }

  // Get Firestore collection reference for user's tables
  getTablesCollection() {
    const userId = this.getUserId();
    return collection(db, "users", userId, "tables");
  }

  async loadTable(id) {
    try {
      const docRef = this.getTableDoc(id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error loading table:", error);
      return null;
    }
  }

  async saveTable(log) {
    try {
      const docRef = this.getTableDoc(log.id);
      await setDoc(docRef, {
        ...log,
        lastOpened: new Date().toISOString()
      });
      return { message: "Saved" };
    } catch (error) {
      console.error("Error saving table:", error);
      throw new Error("Save failed");
    }
  }

  async deleteTable(id) {
    try {
      const docRef = this.getTableDoc(id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error("Error deleting table:", error);
      throw new Error("Delete failed");
    }
  }

  async listTables() {
    try {
      const collectionRef = this.getTablesCollection();
      const q = query(collectionRef, orderBy("lastOpened", "desc"));
      const querySnapshot = await getDocs(q);
      
      const tables = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tables.push({
          id: data.id,
          tableName: data.tableName,
          date: data.date,
          lastOpened: data.lastOpened
        });
      });
      
      return tables;
    } catch (error) {
      console.error("Error listing tables:", error);
      return [];
    }
  }

  // Get all unique muscle groups from user's logs
  async getUniqueMuscleGroups() {
    try {
      const collectionRef = this.getTablesCollection();
      const querySnapshot = await getDocs(collectionRef);
      
      const muscleGroups = new Set();
      querySnapshot.forEach((doc) => {
        const data = doc.data();
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
      const collectionRef = this.getTablesCollection();
      const querySnapshot = await getDocs(collectionRef);
      
      const exercises = new Set();
      querySnapshot.forEach((doc) => {
        const data = doc.data();
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
      const collectionRef = this.getTablesCollection();
      const querySnapshot = await getDocs(collectionRef);
      
      const exercises = new Set();
      querySnapshot.forEach((doc) => {
        const data = doc.data();
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
