const BASE_URL = "http://localhost:8000/api/tables";

export default class TrainingLogManager {
  async loadTable(id) {
    const res = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return await res.json();
  }

  async saveTable(log) {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    });
    if (!res.ok) throw new Error("Save failed");
    return await res.json();
  }

  async deleteTable(id) {
    const res = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Delete failed");
    return true;
  }

  async listTables() {
    const res = await fetch(BASE_URL);
    if (!res.ok) return [];
    return await res.json();
  }

  createNewTable() {
    const id = crypto.randomUUID();
    const today = new Date().toISOString().split("T")[0];
    return {
      id,
      tableName: `New Table - ${today}`,
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
