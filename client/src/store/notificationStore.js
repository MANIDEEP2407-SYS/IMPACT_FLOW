import { create } from 'zustand';
import api from '../utils/api.js';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetch: async () => {
    try {
      const { data } = await api.get('/notifications/my');
      const notifications = data.notifications;
      set({ notifications, unreadCount: notifications.filter(n => !n.read).length });
    } catch {}
  },

  markRead: async (id) => {
    await api.put(`/notifications/${id}/read`);
    set(s => ({
      notifications: s.notifications.map(n => n._id === id ? { ...n, read: true } : n),
      unreadCount: Math.max(s.unreadCount - 1, 0),
    }));
  },

  markAllRead: async () => {
    await api.put('/notifications/read-all');
    set(s => ({
      notifications: s.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },
}));

export default useNotificationStore;
