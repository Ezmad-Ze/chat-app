import { io, Socket } from 'socket.io-client';

const API_BASE = 'http://localhost:3000';

export const api = {
  login: (email: string, password: string) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(res => res.json()),

  register: (email: string, password: string, username: string) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    }).then(res => res.json()),
};

let socket: Socket | null = null;

export const getSocket = (token: string) => {
  if (!socket) {
    socket = io(API_BASE, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
    });
  }
  return socket;
};