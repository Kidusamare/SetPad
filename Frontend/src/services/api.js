// API base URL (adjust as needed)
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Helper function to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

export async function getTables() {
  const res = await fetch(`${API_BASE}/tables`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch tables');
  return res.json();
}

export async function getTable(id) {
  const res = await fetch(`${API_BASE}/tables/${id}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch table');
  return res.json();
}

export async function createTable(data) {
  const res = await fetch(`${API_BASE}/tables`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create table');
  return res.json();
}

export async function updateTable(id, data) {
  const res = await fetch(`${API_BASE}/tables/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update table');
  return res.json();
}

export async function deleteTable(id) {
  const res = await fetch(`${API_BASE}/tables/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete table');
  return res.json();
}
