/**
 * ChatScreen - Écran principal du chat
 * Avec streaming SSE comme l'application web
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../context/ChatContext';
import ApiService from '../services';
import StorageService from '../services/storage';
import Sidebar from '../components/navigation/Sidebar';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import { colors, typography, spacing } from '../styles/theme';

const ChatScreen = ({ route, navigation }) => {
  const { workspaceSlug, threadSlug } = route.params;
  const { currentWorkspace, messages, setMessages, isStreaming, setIsStreaming } = useChat();

  const [isLoading, setIsLoading] = useState(true);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    loadChatHistory();

    return () => {
      // Cleanup: abort any ongoing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [workspaceSlug, threadSlug]);

  const loadChatHistory = async () => {
    try {
      setIsLoading(true);

      // Try to load from cache first (use threadSlug in key if available)
      const cacheKey = threadSlug || workspaceSlug;
      const cachedHistory = await StorageService.getChatHistory(cacheKey);
      if (cachedHistory) {
        setMessages(cachedHistory);
      }

      // Load from API
      const history = await ApiService.getChatHistory(workspaceSlug);

      // Transform history to match our message format
      const formattedMessages = [];
      history.forEach((item) => {
        // User message
        formattedMessages.push({
          id: `user-${item.id}`,
          type: 'user',
          prompt: item.prompt,
          createdAt: item.createdAt,
        });

        // Assistant response
        formattedMessages.push({
          id: `assistant-${item.id}`,
          type: 'assistant',
          response: item.response,
          createdAt: item.createdAt,
        });
      });

      setMessages(formattedMessages);

      // Cache for offline access
      await StorageService.saveChatHistory(workspaceSlug, formattedMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'historique');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (messageText) => {
    // Add user message immediately
    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      prompt: messageText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    setCurrentStreamingMessage('');

    // Create abort controller for this stream
    abortControllerRef.current = new AbortController();

    try {
      await ApiService.streamChat(
        workspaceSlug,
        messageText,
        {
          onMessage: (data) => {
            if (data.type === 'textResponse') {
              setCurrentStreamingMessage((prev) => prev + data.textResponse);
            }

            if (data.close) {
              // Stream finished - add complete assistant message
              const assistantMessage = {
                id: `assistant-${Date.now()}`,
                type: 'assistant',
                response: currentStreamingMessage + (data.textResponse || ''),
                createdAt: new Date().toISOString(),
              };

              setMessages((prev) => [...prev, assistantMessage]);
              setCurrentStreamingMessage('');
              setIsStreaming(false);

              // Save to cache
              StorageService.saveChatHistory(workspaceSlug, [
                ...messages,
                userMessage,
                assistantMessage,
              ]);
            }

            if (data.error) {
              Alert.alert('Erreur', data.error);
              setIsStreaming(false);
            }
          },
          onError: (error) => {
            console.error('Stream error:', error);
            Alert.alert('Erreur', 'Erreur de connexion au serveur');
            setIsStreaming(false);
          },
          onClose: () => {
            setIsStreaming(false);
          },
          signal: abortControllerRef.current.signal,
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Erreur', error.message || 'Impossible d\'envoyer le message');
      setIsStreaming(false);
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setCurrentStreamingMessage('');
      Alert.alert('Génération arrêtée');
    }
  };

  // Create display messages including streaming message
  const displayMessages = [...messages];
  if (isStreaming && currentStreamingMessage) {
    displayMessages.push({
      id: 'streaming',
      type: 'assistant',
      response: currentStreamingMessage,
      isStreaming: true,
    });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Menu */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentWorkspace?.name || workspaceSlug}
          </Text>
        </View>

        {isStreaming ? (
          <TouchableOpacity onPress={handleStopGeneration} style={styles.stopButton}>
            <Ionicons name="stop-circle" size={24} color={colors.danger} />
          </TouchableOpacity>
        ) : (
          <View style={styles.stopButton} />
        )}
      </View>

      {/* Messages */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <MessageList messages={displayMessages} isLoading={isStreaming && !currentStreamingMessage} />
      )}

      {/* Input */}
      <ChatInput onSend={handleSendMessage} disabled={isStreaming} />

      {/* Sidebar */}
      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bgPrimary,
  },
  menuButton: {
    padding: spacing.sm,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.h4,
    color: colors.textPrimary,
  },
  stopButton: {
    padding: spacing.sm,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;
