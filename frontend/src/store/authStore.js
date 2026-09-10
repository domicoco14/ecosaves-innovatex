import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenStorage } from '../lib/tokenStorage';
import { api } from '../lib/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Signup user action — calls FastAPI POST /users/signup
       */
      signup: async (firstName, lastName, email) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/users/signup', {
            first_name: firstName,
            last_name: lastName,
            email,
          });
          set({ isLoading: false });
          return response.data; // { message, user_id }
        } catch (err) {
          const message = err.response?.data?.detail || 'Failed to sign up';
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      /**
       * Verify OTP action — calls FastAPI POST /users/verify-otp
       */
      verifyOtp: async (email, otpCode) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/users/verify-otp', {
            email,
            otp_code: otpCode,
          });
          set({ isLoading: false });
          return response.data; // { message, verified }
        } catch (err) {
          const message = err.response?.data?.detail || 'Invalid or expired OTP';
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      /**
       * Set Password action — calls FastAPI POST /users/set-password
       */
      setPassword: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/users/set-password', {
            email,
            password,
          });
          set({ isLoading: false });
          return response.data; // { message }
        } catch (err) {
          const message = err.response?.data?.detail || 'Failed to set password';
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      /**
       * Login user action — calls FastAPI POST /users/login,
       * stores JWT in SecureStore, fetches profile via GET /users/me
       */
      loginApi: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/users/login', {
            email,
            password,
          });
          const { access_token } = response.data;

          if (access_token) {
            await tokenStorage.setToken(access_token);
          }

          // Fetch logged in user profile
          const userResponse = await api.get('/users/me');
          const userData = userResponse.data;

          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return userData;
        } catch (err) {
          const message = err.response?.data?.detail || 'Invalid credentials';
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      /**
       * Legacy/Direct Login user action
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
       * Lock session when app is backgrounded/closed
       */
      lockSession: () => {
        const { isAuthenticated } = get();
        if (isAuthenticated) {
          set({
            isAuthenticated: false,
          });
        }
      },

      /**
       * Biometric login quick authentication
       */
      biometricLogin: async () => {
        set({ isLoading: true, error: null });
        // Simulates biometric hardware verification
        return new Promise((resolve) => {
          setTimeout(() => {
            const fallbackUser = get().user || {
              first_name: 'Dominion',
              last_name: 'Akinsola',
              email: 'dominion@ecosaves.ng',
              blaze_linked: true,
              blaze_account_number: '1441002006858',
            };
            set({
              user: fallbackUser,
              isAuthenticated: true,
              isLoading: false,
            });
            resolve(fallbackUser);
          }, 800);
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
       * Clear error message
       */
      clearError: () => set({ error: null }),

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
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
