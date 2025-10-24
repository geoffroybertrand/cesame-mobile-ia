/**
 * MessageList - Liste des messages avec FlatList
 */

import React, { useRef, useEffect } from 'react';
import { FlatList, View, StyleSheet, ActivityIndicator } from 'react-native';
import MessageBubble from './MessageBubble';
import { colors } from '../../styles/theme';

const MessageList = ({ messages, isLoading }) => {
  const flatListRef = useRef(null);

  // Auto-scroll vers le bas à chaque nouveau message
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderItem = ({ item }) => (
    <MessageBubble
      message={item.type === 'user' ? item.prompt : item.response}
      isUser={item.type === 'user'}
    />
  );

  const renderFooter = () => {
    if (!isLoading) return null;

    return (
      <View style={styles.loadingContainer}>
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color={colors.accent} />
        </View>
      </View>
    );
  };

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderItem}
      keyExtractor={(item, index) => `message-${index}`}
      contentContainerStyle={styles.contentContainer}
      ListFooterComponent={renderFooter}
      onContentSizeChange={() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }}
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  loadingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingIndicator: {
    backgroundColor: colors.assistantBubble,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default MessageList;
