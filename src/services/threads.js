/**
 * Thread Service - Gestion des conversations (threads)
 */

import ApiService from './api';
import MockApiService from './mockApi';
import config from '../config';

class ThreadService {
  constructor() {
    this.api = config.demoMode ? MockApiService : ApiService;
  }

  /**
   * Get all threads for a workspace
   */
  async getThreads(workspaceSlug) {
    try {
      console.log('[ThreadService] Fetching threads for:', workspaceSlug);

      if (config.demoMode) {
        // Mode démo : retourner des threads mock
        return this.getMockThreads(workspaceSlug);
      }

      const response = await this.api.request(`/workspace/${workspaceSlug}/threads`, {
        method: 'GET',
      });

      console.log(`[ThreadService] Retrieved ${response.threads?.length || 0} threads`);
      return response.threads || [];
    } catch (error) {
      console.error('[ThreadService] Get threads error:', error);
      return [];
    }
  }

  /**
   * Create new thread
   */
  async createThread(workspaceSlug) {
    try {
      console.log('[ThreadService] Creating thread for:', workspaceSlug);

      if (config.demoMode) {
        // Mode démo : simuler création
        return this.createMockThread(workspaceSlug);
      }

      const response = await this.api.request(`/workspace/${workspaceSlug}/thread/new`, {
        method: 'POST',
      });

      if (response.error) {
        throw new Error(response.error);
      }

      console.log('[ThreadService] Thread created:', response.thread.slug);
      return response.thread;
    } catch (error) {
      console.error('[ThreadService] Create thread error:', error);
      throw error;
    }
  }

  /**
   * Delete thread
   */
  async deleteThread(workspaceSlug, threadSlug) {
    try {
      console.log('[ThreadService] Deleting thread:', threadSlug);

      if (config.demoMode) {
        // Mode démo : simuler suppression
        return { success: true };
      }

      const response = await this.api.request(
        `/workspace/${workspaceSlug}/thread/${threadSlug}`,
        {
          method: 'DELETE',
        }
      );

      console.log('[ThreadService] Thread deleted');
      return response;
    } catch (error) {
      console.error('[ThreadService] Delete thread error:', error);
      throw error;
    }
  }

  /**
   * Rename thread
   */
  async renameThread(workspaceSlug, threadSlug, newName) {
    try {
      console.log('[ThreadService] Renaming thread:', threadSlug, 'to:', newName);

      if (config.demoMode) {
        // Mode démo : simuler renommage
        return {
          thread: { slug: threadSlug, name: newName },
          message: 'Thread renamed',
        };
      }

      const response = await this.api.request(
        `/workspace/${workspaceSlug}/thread/${threadSlug}/update`,
        {
          method: 'POST',
          body: JSON.stringify({ name: newName }),
        }
      );

      console.log('[ThreadService] Thread renamed');
      return response;
    } catch (error) {
      console.error('[ThreadService] Rename thread error:', error);
      throw error;
    }
  }

  /**
   * Get thread chat history
   */
  async getThreadHistory(workspaceSlug, threadSlug) {
    try {
      console.log('[ThreadService] Fetching history for thread:', threadSlug);

      if (config.demoMode) {
        // Utiliser l'API mock existante
        return await this.api.getChatHistory(workspaceSlug);
      }

      const response = await this.api.request(
        `/workspace/${workspaceSlug}/thread/${threadSlug}/chats`,
        {
          method: 'GET',
        }
      );

      console.log(`[ThreadService] Retrieved ${response.history?.length || 0} messages`);
      return response.history || [];
    } catch (error) {
      console.error('[ThreadService] Get thread history error:', error);
      return [];
    }
  }

  /**
   * Mock threads for demo mode
   */
  getMockThreads(workspaceSlug) {
    const mockThreads = {
      bateson: [
        {
          id: 1,
          slug: 'chat-1',
          name: 'Chat',
          workspace_id: 1,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          lastUpdatedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 2,
          slug: 'synthese-2',
          name: '/synthèse',
          workspace_id: 1,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          lastUpdatedAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 3,
          slug: 'hypocondriaque-3',
          name: "J'avais lu qu'un hypoc...",
          workspace_id: 1,
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          lastUpdatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      cesame: [
        {
          id: 4,
          slug: 'conversation-1',
          name: 'Nouvelle conversation',
          workspace_id: 2,
          createdAt: new Date(Date.now() - 43200000).toISOString(),
          lastUpdatedAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ],
      support: [],
    };

    return mockThreads[workspaceSlug] || [];
  }

  /**
   * Create mock thread for demo
   */
  createMockThread(workspaceSlug) {
    const newThread = {
      id: Date.now(),
      slug: `thread-${Date.now()}`,
      name: 'Nouvelle conversation',
      workspace_id: 1,
      createdAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    };

    return newThread;
  }
}

export default new ThreadService();
