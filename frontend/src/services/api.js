import { getAuthToken, setAuthToken, clearAuthToken } from '../utils/tokenStorage';

const API_URL = 'http://localhost:5000';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const api = {
  async fetchWithAuth(url, options = {}) {
    const token = getAuthToken();
    
    // Add authorization header
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };

    let response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });

    // If unauthorized (token expired), try to refresh
    if (response.status === 401) {
      if (isRefreshing) {
        // Wait for the token to be refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          headers.Authorization = `Bearer ${token}`;
          return fetch(url, { ...options, headers, credentials: 'include' });
        });
      }

      isRefreshing = true;

      try {
        // Refresh the token
        const refreshData = await this.refresh();
        const newToken = refreshData.token;
        setAuthToken(newToken);
        
        processQueue(null, newToken);
        isRefreshing = false;

        // Retry the original request with new token
        headers.Authorization = `Bearer ${newToken}`;
        response = await fetch(url, {
          ...options,
          headers,
          credentials: 'include'
        });
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        clearAuthToken();
        window.location.href = '/login';
        throw refreshError;
      }
    }

    return response;
  },

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
    const res = await this.fetchWithAuth(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, age, role })
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to update profile' }));
      throw new Error(errorData.message || 'Failed to update profile');
    }
    return res.json();
  },

  async createRoom(name) {
    const res = await this.fetchWithAuth(`${API_URL}/rooms/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to create room' }));
      throw new Error(errorData.message || 'Failed to create room');
    }
    return res.json();
  },

  async getMyRooms() {
    const res = await this.fetchWithAuth(`${API_URL}/rooms/my-rooms`, {
      method: 'GET'
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to fetch rooms' }));
      throw new Error(errorData.message || 'Failed to fetch rooms');
    }
    return res.json();
  },

  async getRoomById(roomId) {
    const res = await this.fetchWithAuth(`${API_URL}/rooms/${roomId}`, {
      method: 'GET'
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to fetch room' }));
      throw new Error(errorData.message || 'Failed to fetch room');
    }
    return res.json();
  },

  async joinRoom(inviteToken) {
    const res = await this.fetchWithAuth(`${API_URL}/rooms/join/${inviteToken}`, {
      method: 'POST'
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to join room' }));
      throw new Error(errorData.message || 'Failed to join room');
    }
    return res.json();
  },

  async leaveRoom(roomId) {
    const res = await this.fetchWithAuth(`${API_URL}/rooms/${roomId}/leave`, {
      method: 'POST'
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to leave room' }));
      throw new Error(errorData.message || 'Failed to leave room');
    }
    return res.json();
  },

  async deleteRoom(roomId) {
    const res = await this.fetchWithAuth(`${API_URL}/rooms/${roomId}`, {
      method: 'DELETE'
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to delete room' }));
      throw new Error(errorData.message || 'Failed to delete room');
    }
    return res.json();
  },

  async getMessages(roomId) {
    const res = await this.fetchWithAuth(`${API_URL}/messages/${roomId}?limit=100`, {
      method: 'GET'
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Failed to fetch messages' }));
      throw new Error(errorData.message || 'Failed to fetch messages');
    }
    return res.json();
  }
};

export default api;