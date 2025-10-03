import { io, Socket } from 'socket.io-client';

const API_BASE = 'http://localhost:3000';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    const errorMessage = errorData.message || `HTTP ${response.status}`;
    if (response.status === 401) {
      console.error('API 401 error:', errorMessage);
      localStorage.removeItem('auth_token');
      window.location.href = '/auth';
      throw new ApiError(response.status, 'Session expired. Please log in again.');
    }
    throw new ApiError(response.status, errorMessage);
  }
  return response.json();
};

export const api = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (email: string, password: string, username: string) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    });
    return handleResponse(response);
  },

  getRooms: async (token: string) => {
    const response = await fetch(`${API_BASE}/rooms`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  createRoom: async (token: string, name: string) => {
    const response = await fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    return handleResponse(response);
  },
};

let socket: Socket | null = null;
let currentToken: string | null = null;

export const getSocket = (token: string) => {
  if (socket && currentToken === token && socket.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  currentToken = token;
  socket = io(API_BASE, {
    auth: { token: `Bearer ${token}` },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Socket connected with token:', token);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
    if (error.message.includes('Invalid token') || error.message.includes('Unauthorized')) {
      console.log('Socket auth failed, clearing token');
      localStorage.removeItem('auth_token');
      window.location.href = '/auth';
    }
  });

  socket.on('error', (data) => {
    console.error('Socket error event:', data);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
};