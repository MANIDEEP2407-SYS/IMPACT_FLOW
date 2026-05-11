import { create } from 'zustand';
import api from '../utils/api.js';

const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  fetchMe: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

export default useAuthStore;
