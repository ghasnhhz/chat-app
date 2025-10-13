import { getAuthToken, setAuthToken, clearAuthToken } from '../utils/tokenStorage';

const API_URL = 'http://localhost:5000';

const api = {
  async register(email, password) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(errorData.message || 'Registration failed');
    }
    const data = await res.json();
    if (data.token) setAuthToken(data.token);
    return data;
  },

  async login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(errorData.message || 'Login failed');
    }
    const data = await res.json();
    if (data.token) setAuthToken(data.token);
    return data;
  },

  async logout() {
    const res = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Logout failed' }));
      throw new Error(errorData.message || 'Logout failed');
    }
    clearAuthToken();
    return res.json();
  },

  async refresh() {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'GET',
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error('Session expired');
    }
    const data = await res.json();
    if (data.token) setAuthToken(data.token);
    return data;
  },

  async createProfile(username, age, role) {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token');
    
    const res = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ username, age, role }),
      credentials: 'include'
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to update profile' }));
      throw new Error(errorData.message || 'Failed to update profile');
    }
    return res.json();
  },

  async createRoom(name) {
    const token = getAuthToken();
    const res = await fetch(`${API_URL}/rooms/create`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name }),
      credentials: 'include'
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to create room' }));
      throw new Error(errorData.message || 'Failed to create room');
    }
    return res.json();
  },

  async getMyRooms() {
    const token = getAuthToken();
    const res = await fetch(`${API_URL}/rooms/my-rooms`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to fetch rooms' }));
      throw new Error(errorData.message || 'Failed to fetch rooms');
    }
    return res.json();
  },

  async getRoomById(roomId) {
    const token = getAuthToken();
    const res = await fetch(`${API_URL}/rooms/${roomId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to fetch room' }));
      throw new Error(errorData.message || 'Failed to fetch room');
    }
    return res.json();
  },

  async joinRoom(inviteToken) {
    const token = getAuthToken();
    const res = await fetch(`${API_URL}/rooms/join/${inviteToken}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to join room' }));
      throw new Error(errorData.message || 'Failed to join room');
    }
    return res.json();
  },

  async leaveRoom(roomId) {
    const token = getAuthToken();
    const res = await fetch(`${API_URL}/rooms/${roomId}/leave`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to leave room' }));
      throw new Error(errorData.message || 'Failed to leave room');
    }
    return res.json();
  },

  async deleteRoom(roomId) {
    const token = getAuthToken();
    const res = await fetch(`${API_URL}/rooms/${roomId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to delete room' }));
      throw new Error(errorData.message || 'Failed to delete room');
    }
    return res.json();
  }
};

export default api;