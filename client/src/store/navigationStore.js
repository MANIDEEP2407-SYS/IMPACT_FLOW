import { create } from 'zustand';

const useNavigationStore = create((set, get) => ({
  stack: [],
  currentIndex: -1,

  push: (path) => {
    set((state) => {
      const newStack = state.stack.slice(0, state.currentIndex + 1);
      newStack.push(path);
      return {
        stack: newStack,
        currentIndex: newStack.length - 1,
      };
    });
  },

  canGoBack: () => get().currentIndex > 0,
  canGoForward: () => get().currentIndex < get().stack.length - 1,

  getBackPath: () => {
    const state = get();
    if (state.currentIndex > 0) {
      return state.stack[state.currentIndex - 1];
    }
    return null;
  },

  getForwardPath: () => {
    const state = get();
    if (state.currentIndex < state.stack.length - 1) {
      return state.stack[state.currentIndex + 1];
    }
    return null;
  },

  goBack: () => {
    set((state) => ({
      currentIndex: Math.max(0, state.currentIndex - 1),
    }));
  },

  goForward: () => {
    set((state) => ({
      currentIndex: Math.min(state.stack.length - 1, state.currentIndex + 1),
    }));
  },

  clear: () => set({ stack: [], currentIndex: -1 }),
}));

export default useNavigationStore;
