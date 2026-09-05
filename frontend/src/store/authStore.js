import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenStorage } from '../lib/tokenStorage';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Login user action — stores non-sensitive user profile in AsyncStorage
       * and stores sensitive auth token in expo-secure-store.
       */
      login: async (userData, token) => {
        if (token) {
          await tokenStorage.setToken(token);
        }
        set({
          user: userData,
          isAuthenticated: true,
          error: null,
        });
      },

      /**
       * Logout user action — clears token from SecureStore and resets auth state
       */
      logout: async () => {
        await tokenStorage.removeToken();
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      /**
       * Update user profile information
       */
      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : userData,
        }));
      },

      /**
       * Set loading state
       */
      setLoading: (isLoading) => set({ isLoading }),

      /**
       * Set error message
       */
      setError: (error) => set({ error }),
    }),
    {
      name: 'ecosaves_auth_storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist non-sensitive user state in AsyncStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
