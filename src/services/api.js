/**
 * API Service - Gestion des appels API
 * Réplique les fonctionnalités de l'application web
 */

import { fetchEventSource } from '@microsoft/fetch-event-source';
import uuid from 'react-native-uuid';
import { API_BASE_URL, HTTP_STATUS, TIMEOUTS } from '../utils/constants';
import StorageService from './storage';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.currentThreadId = null;
  }

  /**
   * Get authentication headers
   */
  async getAuthHeaders(contentType = 'application/json') {
    const token = await StorageService.getAuthToken();
    const headers = {
      'Content-Type': contentType,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Make authenticated API request
   */
  async request(endpoint, options = {}) {
    try {
      const headers = await this.getAuthHeaders(options.contentType);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        timeout: options.timeout || TIMEOUTS.API_REQUEST,
      });

      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`[API] Request error for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Login
   */
  async login(username, password) {
    try {
      console.log('[API] Login request for:', username);

      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      // Save token and user
      if (response.token) {
        await StorageService.saveAuthToken(response.token);
      }
      if (response.user) {
        await StorageService.saveAuthUser(response.user);
      }

      console.log('[API] Login successful');
      return response;
    } catch (error) {
      console.error('[API] Login error:', error);
      throw error;
    }
  }

  /**
   * Logout
   */
  async logout() {
    try {
      console.log('[API] Logout request');

      // Try to call logout endpoint (may fail if token expired)
      try {
        await this.request('/auth/logout', {
          method: 'POST',
        });
      } catch (error) {
        console.warn('[API] Logout endpoint failed, clearing local data anyway');
      }

      // Clear local storage
      await StorageService.clearAuth();
      this.currentThreadId = null;

      console.log('[API] Logout successful');
    } catch (error) {
      console.error('[API] Logout error:', error);
      throw error;
    }
  }

  /**
   * Get user workspaces
   */
  async getWorkspaces() {
    try {
      console.log('[API] Fetching workspaces');

      const response = await this.request('/workspaces', {
        method: 'GET',
      });

      console.log(`[API] Retrieved ${response.length} workspaces`);
      return response;
    } catch (error) {
      console.error('[API] Get workspaces error:', error);
      throw error;
    }
  }

  /**
   * Get chat history for a workspace
   */
  async getChatHistory(workspaceSlug) {
    try {
      console.log('[API] Fetching chat history for:', workspaceSlug);

      // Get or create thread ID
      const threadId = await this.getOrCreateThreadId(workspaceSlug);

      const response = await this.request(
        `/workspace/${workspaceSlug}/thread/${threadId}/history`,
        {
          method: 'GET',
        }
      );

      console.log(`[API] Retrieved ${response.length} messages`);
      return response;
    } catch (error) {
      console.error('[API] Get chat history error:', error);
      // Return empty array on error (offline mode)
      return [];
    }
  }

  /**
   * Get or create thread ID for a workspace
   */
  async getOrCreateThreadId(workspaceSlug) {
    if (!this.currentThreadId) {
      // Try to get from storage
      const storedThreadId = await StorageService.getThreadId(workspaceSlug);

      if (storedThreadId) {
        this.currentThreadId = storedThreadId;
      } else {
        // Create new thread ID
        this.currentThreadId = uuid.v4();
        await StorageService.saveThreadId(workspaceSlug, this.currentThreadId);
      }
    }

    return this.currentThreadId;
  }

  /**
   * Reset thread (start new conversation)
   */
  async resetThread(workspaceSlug) {
    this.currentThreadId = null;
    await StorageService.clearThreadId(workspaceSlug);
  }

  /**
   * Stream chat with Server-Sent Events (SSE)
   */
  async streamChat(workspaceSlug, message, callbacks = {}) {
    const { onMessage, onError, onClose, signal } = callbacks;

    try {
      console.log('[API] Starting chat stream for:', workspaceSlug);

      const threadId = await this.getOrCreateThreadId(workspaceSlug);
      const url = `${this.baseUrl}/workspace/${workspaceSlug}/thread/${threadId}/stream-chat`;
      const headers = await this.getAuthHeaders('text/plain;charset=UTF-8');

      let accumulatedText = '';

      await fetchEventSource(url, {
        method: 'POST',
        headers: {
          ...headers,
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          message: message,
          attachments: [],
        }),
        signal,

        onopen: async (response) => {
          if (response.ok) {
            console.log('[API] SSE connection opened');
            return;
          }

          // Handle errors
          const error = await response.text();
          throw new Error(error || `HTTP ${response.status}`);
        },

        onmessage: (event) => {
          // Parse SSE event data
          const data = event.data;

          if (data === '[DONE]') {
            console.log('[API] Stream completed');
            if (onMessage) {
              onMessage({ close: true });
            }
            return;
          }

          try {
            const parsed = JSON.parse(data);

            // Accumulate text
            if (parsed.textResponse) {
              accumulatedText += parsed.textResponse;
            }

            // Call onMessage callback
            if (onMessage) {
              onMessage({
                type: 'textResponse',
                textResponse: parsed.textResponse || '',
                fullText: accumulatedText,
                ...parsed,
              });
            }

            // Check for close signal
            if (parsed.close) {
              console.log('[API] Stream closed by server');
            }

            // Check for errors
            if (parsed.error) {
              console.error('[API] Stream error from server:', parsed.error);
            }

          } catch (error) {
            // If not JSON, treat as plain text
            accumulatedText += data;
            if (onMessage) {
              onMessage({
                type: 'textResponse',
                textResponse: data,
                fullText: accumulatedText,
              });
            }
          }
        },

        onerror: (error) => {
          console.error('[API] SSE error:', error);
          if (onError) {
            onError(error);
          }
          throw error; // Rethrow to stop reconnection
        },

        onclose: () => {
          console.log('[API] SSE connection closed');
          if (onClose) {
            onClose();
          }
        },

        // Disable automatic reconnection
        openWhenHidden: false,
      });

    } catch (error) {
      console.error('[API] Stream chat error:', error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }
}

// Export singleton instance
export default new ApiService();
