const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
    
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Authentication API calls
export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Training logs API calls
export const trainingLogsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/training-logs`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/training-logs/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (logData) => {
    const response = await fetch(`${API_BASE_URL}/training-logs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(logData),
    });
    return handleResponse(response);
  },

  update: async (id, logData) => {
    const response = await fetch(`${API_BASE_URL}/training-logs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(logData),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/training-logs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Legacy API functions for backward compatibility
export const fetchTables = () => trainingLogsAPI.getAll();
export const fetchTableById = (id) => trainingLogsAPI.getById(id);
export const deleteTable = (id) => trainingLogsAPI.delete(id);

// Save table function for backward compatibility
export const saveTable = async (tableData) => {
  return trainingLogsAPI.create({
    name: tableData.name || 'Untitled Training Log',
    date: tableData.date || new Date().toISOString().split('T')[0],
    data: tableData,
  });
};

export default {
  auth: authAPI,
  trainingLogs: trainingLogsAPI,
  // Legacy exports
  fetchTables,
  fetchTableById,
  deleteTable,
  saveTable,
};