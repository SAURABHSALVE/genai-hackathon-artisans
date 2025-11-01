// src/store.js
import { create } from 'zustand';

const useStore = create((set) => ({
  arImageUrl: null,
  setArImageUrl: (url) => set({ arImageUrl: url }),
}));

export default useStore;
