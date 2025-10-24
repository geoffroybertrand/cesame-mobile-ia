/**
 * Service de stockage local avec AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

class StorageService {
  /**
   * Sauvegarder une valeur
   */
  async setItem(key, value) {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
      return true;
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      return false;
    }
  }

  /**
   * Récupérer une valeur
   */
  async getItem(key, parse = true) {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) return null;

      if (parse) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  }

  /**
   * Supprimer une valeur
   */
  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all storage
   */
  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // Auth specific methods
  async saveAuthToken(token) {
    return this.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  async getAuthToken() {
    return this.getItem(STORAGE_KEYS.AUTH_TOKEN, false);
  }

  async saveAuthUser(user) {
    return this.setItem(STORAGE_KEYS.AUTH_USER, user);
  }

  async getAuthUser() {
    return this.getItem(STORAGE_KEYS.AUTH_USER);
  }

  async clearAuth() {
    await this.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await this.removeItem(STORAGE_KEYS.AUTH_USER);
    await this.removeItem(STORAGE_KEYS.AUTH_TIMESTAMP);
  }

  // Chat history cache
  async saveChatHistory(workspaceSlug, history) {
    const key = `${STORAGE_KEYS.CHAT_HISTORY_PREFIX}${workspaceSlug}`;
    return this.setItem(key, history);
  }

  async getChatHistory(workspaceSlug) {
    const key = `${STORAGE_KEYS.CHAT_HISTORY_PREFIX}${workspaceSlug}`;
    return this.getItem(key);
  }

  async clearChatHistory(workspaceSlug) {
    const key = `${STORAGE_KEYS.CHAT_HISTORY_PREFIX}${workspaceSlug}`;
    return this.removeItem(key);
  }

  // Workspace selection
  async saveSelectedWorkspace(workspaceSlug) {
    return this.setItem(STORAGE_KEYS.SELECTED_WORKSPACE, workspaceSlug);
  }

  async getSelectedWorkspace() {
    return this.getItem(STORAGE_KEYS.SELECTED_WORKSPACE, false);
  }

  // Message count
  async saveMessageCount(count) {
    return this.setItem(STORAGE_KEYS.MESSAGE_COUNT, count);
  }

  async getMessageCount() {
    return this.getItem(STORAGE_KEYS.MESSAGE_COUNT);
  }

  // Thread ID management
  async saveThreadId(workspaceSlug, threadId) {
    const key = `${STORAGE_KEYS.THREAD_ID_PREFIX}${workspaceSlug}`;
    return this.setItem(key, threadId);
  }

  async getThreadId(workspaceSlug) {
    const key = `${STORAGE_KEYS.THREAD_ID_PREFIX}${workspaceSlug}`;
    return this.getItem(key, false);
  }

  async clearThreadId(workspaceSlug) {
    const key = `${STORAGE_KEYS.THREAD_ID_PREFIX}${workspaceSlug}`;
    return this.removeItem(key);
  }
}

export default new StorageService();
