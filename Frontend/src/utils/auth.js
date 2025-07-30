// Legacy auth utils - now using our own authentication system
// This file is kept for backward compatibility but is no longer used

// Helper to get current user token from localStorage
export function getCurrentToken() {
  return localStorage.getItem('token');
}

// Helper to check if user is authenticated
export function isUserAuthenticated() {
  const token = getCurrentToken();
  return !!token;
}

// Legacy function names for backward compatibility
export const auth = {
  currentUser: null // This is no longer used with our new auth system
};

export const db = null; // This is no longer used with our new auth system

// Helper to get user and token - updated for new system
export async function getFirebaseUserAndToken() {
  const token = getCurrentToken();
  if (!token) return null;
  
  try {
    const response = await fetch('http://localhost:8000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const user = await response.json();
      return { user, token };
    }
  } catch (error) {
    console.error('Error fetching user:', error);
  }
  
  return null;
}