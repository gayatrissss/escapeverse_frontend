import { create } from 'zustand';
import api from '../api/client.js';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('ev_user') || 'null'),
  token: localStorage.getItem('ev_token') || null,
  isAuthenticated: !!localStorage.getItem('ev_token'),
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('ev_token', data.token);
      localStorage.setItem('ev_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
      return data;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  register: async (username, email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/register', { username, email, password });
      localStorage.setItem('ev_token', data.token);
      localStorage.setItem('ev_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
      return data;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  guestLogin: async () => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/guest');
      localStorage.setItem('ev_token', data.token);
      localStorage.setItem('ev_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
      return data;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('ev_token');
    localStorage.removeItem('ev_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    const updated = { ...useAuthStore.getState().user, ...userData };
    localStorage.setItem('ev_user', JSON.stringify(updated));
    set({ user: updated });
  }
}));
