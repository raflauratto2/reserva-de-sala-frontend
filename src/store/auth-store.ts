import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/models/User';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user?: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (token: string, user?: User) => {
        localStorage.setItem('auth_token', token);
        set({ token, isAuthenticated: true, user: user || null });
      },
      setUser: (user: User) => {
        set({ user });
      },
      logout: () => {
        localStorage.removeItem('auth_token');
        set({ user: null, token: null, isAuthenticated: false });
      },
      isAdmin: () => {
        const { user } = get();
        return user?.admin === true;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

