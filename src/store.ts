import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  groqKeys: string[];
  activeKeyIndex: number;
  theme: 'dark' | 'light';
  language: 'my' | 'en';
  isSettingsOpen: boolean;
  adminPanelOpen: boolean;
  addGroqKey: (key: string) => void;
  removeGroqKey: (index: number) => void;
  nextActiveKey: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setLanguage: (lang: 'my' | 'en') => void;
  setSettingsOpen: (isOpen: boolean) => void;
  setAdminPanelOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      groqKeys: [],
      activeKeyIndex: 0,
      theme: 'dark',
      language: 'my',
      isSettingsOpen: false,
      adminPanelOpen: false,
      addGroqKey: (key) => set((state) => ({
        groqKeys: state.groqKeys.length < 5 ? [...state.groqKeys, key] : state.groqKeys
      })),
      removeGroqKey: (index) => set((state) => ({
        groqKeys: state.groqKeys.filter((_, i) => i !== index),
        activeKeyIndex: 0 // reset index to avoid out of bounds
      })),
      nextActiveKey: () => set((state) => {
        if (state.groqKeys.length === 0) return state;
        return { activeKeyIndex: (state.activeKeyIndex + 1) % state.groqKeys.length };
      }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
      setAdminPanelOpen: (adminPanelOpen) => set({ adminPanelOpen })
    }),
    {
      name: 'deeplearn-ai-storage',
      partialize: (state) => ({ groqKeys: state.groqKeys, theme: state.theme, language: state.language })
    }
  )
);
