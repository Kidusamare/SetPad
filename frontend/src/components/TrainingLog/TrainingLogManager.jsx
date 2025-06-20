const BASE_URL = "/api/tables";

/**
 * TrainingLogManager handles all CRUD operations for training logs
 * via a REST API at /api/tables. It provides methods to list, load,
 * save, and delete logs, as well as to generate a default log template.
 */
/**
 * Manages CRUD operations for training log tables via backend API.
 * 
 * Provides methods to list, load, save, and delete training tables, as well as generate default table objects.
 * 
 * @class
 * @example
 * const manager = new TrainingLogManager();
 * const tables = await manager.listSavedTables();
 * const table = await manager.loadTable('Push', '2024-06-01');
 * await manager.saveTable('Push', '2024-06-01', tableData);
 * await manager.deleteTable('Push-2024-06-01');
 * const defaultTable = manager.getDefaultTable();
 */
export class TrainingLogManager {
    /**
     * Fetches all saved training tables from the backend API.
     * @returns {Promise<Array>} Array of saved table objects.
     * @throws {Error} If the fetch fails.
     */
    async listSavedTables() {
        const res = await fetch(BASE_URL);
        if (!res.ok) throw new Error("Failed to fetch tables");
        return await res.json();
    }

    /**
     * Loads a specific training table by tableName and date.
     * @param {string} tableName - The name of the table.
     * @param {string} date - The date string (YYYY-MM-DD).
     * @returns {Promise<Object|null>} The table object, or null if not found.
     */
    async loadTable(arg1, arg2) {
        const id = arg2 ? `${arg1}-${arg2}` : arg1; // support (tableName, date) or (id)
        const res = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`);
        if (!res.ok) return null;
        return await res.json();
    }

    /**
     * Saves a training table to the backend API.
     * If the table does not exist, it will be created.
     * If it exists, it will be updated.
     * @param {string} tableName - The name of the table.
     * @param {string} date - The date string (YYYY-MM-DD).
     * @param {Object} data - The table data to save.
     * @returns {Promise<Object>} The saved table object from the backend.
     * @throws {Error} If the save fails.
     */
    async saveTable(tableName, date, data) {
        // Use the provided id if present, otherwise generate from tableName-date
        const id = data.id || `${tableName}-${date}`;
        const payload = { ...data, id };
        const res = await fetch(BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Save failed");
        return await res.json();
    }

    /**
     * Deletes a training table by id.
     * @param {id} The unique UUID of the table.
     * @returns {Promise<boolean>} True if deletion was successful.
     * @throws {Error} If the deletion fails.
     */
    async deleteTable(id) {
        const res = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
            method: "DELETE"
        });
        if (!res.ok) throw new Error("Delete failed");
        return true;
    }

    /**
     * Generates a default training table object for new logs.
     * Includes a unique id, today's date, and a starter row.
     * @returns {Object} The default table object.
     */
    getDefaultTable() {
        const today = new Date().toISOString().split("T")[0];
        const UUID = crypto.randomUUID();

        return {
            id: UUID,
            tableName: "New Table",
            date: today,
            rows: [
                {
                    id: 0,
                    muscleGroup: "Strength-Focus🏋️",
                    exercise: "",
                    sets: [{ reps: "", weight: "" }, { reps: "", weight: "" }],
                    notes: "No notes 😊",
                    showNotes: false,
                    weightUnit: "lbs"
                }
            ]
        };
    }
}