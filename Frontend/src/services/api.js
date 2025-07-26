// API base URL (adjust as needed)
const API_BASE = 'http://localhost:8000';

export async function getTables() {
  const res = await fetch(`${API_BASE}/tables`);
  if (!res.ok) throw new Error('Failed to fetch tables');
  return res.json();
}

export async function getTable(id) {
  const res = await fetch(`${API_BASE}/tables/${id}`);
  if (!res.ok) throw new Error('Failed to fetch table');
  return res.json();
}

export async function createTable(data) {
  const res = await fetch(`${API_BASE}/tables`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create table');
  return res.json();
}

export async function updateTable(id, data) {
  const res = await fetch(`${API_BASE}/tables/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update table');
  return res.json();
}

export async function deleteTable(id) {
  const res = await fetch(`${API_BASE}/tables/${id}`, {
    method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete table');
  return res.json();
}
