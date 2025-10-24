/**
 * Mock API Service - Pour tester l'UI sans backend
 * Active le mode démo pour valider l'interface
 */

import uuid from 'react-native-uuid';
import StorageService from './storage';

const DEMO_USER = {
  id: 1,
  username: 'geoffbertrand@gmail.com',
  email: 'geoffbertrand@gmail.com',
};

const DEMO_TOKEN = 'demo_token_' + Date.now();

const DEMO_WORKSPACES = [
  {
    id: 1,
    slug: 'bateson',
    name: 'Bateson',
    description: 'Assistant de recherche',
  },
  {
    id: 2,
    slug: 'cesame',
    name: 'CESAME',
    description: 'Agent IA principal',
  },
  {
    id: 3,
    slug: 'support',
    name: 'Support Client',
    description: 'Assistance technique',
  },
];

const DEMO_MESSAGES = [
  {
    id: 1,
    prompt: 'Bonjour, comment vas-tu ?',
    response: 'Bonjour ! Je vais très bien, merci. Je suis votre assistant IA CESAME. Comment puis-je vous aider aujourd\'hui ?',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    prompt: 'Peux-tu m\'expliquer ce qu\'est React Native ?',
    response: 'React Native est un framework de développement d\'applications mobiles créé par Facebook. Il permet de créer des applications natives pour iOS et Android en utilisant JavaScript et React.\n\nLes principaux avantages sont :\n- **Code partagé** : Un seul code pour iOS et Android\n- **Performance native** : Utilise des composants natifs\n- **Hot Reload** : Mise à jour en temps réel pendant le développement\n- **Grande communauté** : Nombreuses bibliothèques disponibles',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

class MockApiService {
  constructor() {
    this.currentThreadId = null;
  }

  /**
   * Simulate network delay
   */
  async delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Login
   */
  async login(username, password) {
    console.log('[MockAPI] Login request for:', username);
    await this.delay(800);

    // Accept any credentials in demo mode
    await StorageService.saveAuthToken(DEMO_TOKEN);
    await StorageService.saveAuthUser(DEMO_USER);

    console.log('[MockAPI] Login successful (demo mode)');
    return {
      valid: true,
      token: DEMO_TOKEN,
      user: DEMO_USER,
      message: 'Login successful (demo mode)',
    };
  }

  /**
   * Logout
   */
  async logout() {
    console.log('[MockAPI] Logout request (demo mode)');
    await this.delay(300);
    await StorageService.clearAuth();
    this.currentThreadId = null;
    console.log('[MockAPI] Logout successful');
  }

  /**
   * Get workspaces
   */
  async getWorkspaces() {
    console.log('[MockAPI] Fetching workspaces (demo mode)');
    await this.delay(600);
    console.log(`[MockAPI] Retrieved ${DEMO_WORKSPACES.length} workspaces`);
    return DEMO_WORKSPACES;
  }

  /**
   * Get chat history
   */
  async getChatHistory(workspaceSlug) {
    console.log('[MockAPI] Fetching chat history for:', workspaceSlug, '(demo mode)');
    await this.delay(500);
    console.log(`[MockAPI] Retrieved ${DEMO_MESSAGES.length} messages`);
    return DEMO_MESSAGES;
  }

  /**
   * Get or create thread ID
   */
  async getOrCreateThreadId(workspaceSlug) {
    if (!this.currentThreadId) {
      const storedThreadId = await StorageService.getThreadId(workspaceSlug);
      if (storedThreadId) {
        this.currentThreadId = storedThreadId;
      } else {
        this.currentThreadId = uuid.v4();
        await StorageService.saveThreadId(workspaceSlug, this.currentThreadId);
      }
    }
    return this.currentThreadId;
  }

  /**
   * Reset thread
   */
  async resetThread(workspaceSlug) {
    this.currentThreadId = null;
    await StorageService.clearThreadId(workspaceSlug);
  }

  /**
   * Stream chat (simulated)
   */
  async streamChat(workspaceSlug, message, callbacks = {}) {
    const { onMessage, onError, onClose } = callbacks;

    try {
      console.log('[MockAPI] Starting chat stream (demo mode) for:', workspaceSlug);
      await this.delay(500);

      // Simulate AI response
      const demoResponse = this.generateDemoResponse(message);

      // Stream the response word by word
      const words = demoResponse.split(' ');
      let accumulatedText = '';

      for (let i = 0; i < words.length; i++) {
        const word = words[i] + (i < words.length - 1 ? ' ' : '');
        accumulatedText += word;

        if (onMessage) {
          onMessage({
            type: 'textResponse',
            textResponse: word,
            fullText: accumulatedText,
          });
        }

        // Simulate typing delay
        await this.delay(50 + Math.random() * 100);
      }

      // Send close signal
      if (onMessage) {
        onMessage({ close: true });
      }

      if (onClose) {
        onClose();
      }

      console.log('[MockAPI] Stream completed');

    } catch (error) {
      console.error('[MockAPI] Stream chat error:', error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }

  /**
   * Generate a demo response based on the message
   */
  generateDemoResponse(message) {
    const responses = [
      `C'est une excellente question concernant "${message}". En mode démo, je simule une réponse de l'IA. L'interface fonctionne parfaitement avec le streaming en temps réel, comme vous pouvez le voir.`,

      `Je comprends votre demande sur "${message}". Dans un environnement de production, je serais connecté au backend CESAME et pourrais vous fournir des réponses détaillées et contextuelles basées sur votre workspace.`,

      `Merci pour votre message concernant "${message}". Cette interface mobile réplique toutes les fonctionnalités de l'application web : authentification, navigation entre workspaces, chat en temps réel avec streaming SSE, et plus encore.`,

      `Votre question "${message}" est bien reçue ! L'application mobile CESAME offre une expérience utilisateur fluide avec :\n\n• Streaming de réponses en temps réel\n• Historique des conversations\n• Support markdown\n• Mode offline avec cache\n• Interface adaptée au mobile`,
    ];

    // Return a random response
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

// Export singleton instance
export default new MockApiService();
