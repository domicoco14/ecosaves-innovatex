import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'ecosaves_user_token';

export const tokenStorage = {
  /**
   * Retrieve stored auth token from SecureStore
   */
  async getToken() {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error fetching token from SecureStore:', error);
      return null;
    }
  },

  /**
   * Store auth token securely in SecureStore
   */
  async setToken(token) {
    try {
      if (token) {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error storing token in SecureStore:', error);
    }
  },

  /**
   * Remove stored token from SecureStore
   */
  async removeToken() {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token from SecureStore:', error);
    }
  },
};
