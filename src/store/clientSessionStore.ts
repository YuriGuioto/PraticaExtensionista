import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ClientProfile {
  name: string;
  contact: string;
  code?: string;
}

interface ClientSessionState {
  profile: ClientProfile | null;
  login: (profile: ClientProfile) => void;
  logout: () => void;
}

export const useClientSessionStore = create<ClientSessionState>()(
  persist(
    (set) => ({
      profile: null,
      login: (profile) => set({ profile }),
      logout: () => set({ profile: null }),
    }),
    { name: 'acai-client-session' },
  ),
);
