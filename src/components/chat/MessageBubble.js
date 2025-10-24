/**
 * MessageBubble - Composant bulle de message
 * Style identique à l'application web CESAME
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { colors, typography, borderRadius, shadows } from '../../styles/theme';

const MessageBubble = ({ message, isUser }) => {
  const bubbleStyle = isUser ? styles.userBubble : styles.assistantBubble;

  return (
    <View style={[styles.container, isUser && styles.userContainer]}>
      <View style={[styles.bubble, bubbleStyle]}>
        <Markdown style={markdownStyles}>
          {message}
        </Markdown>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'flex-start',
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: borderRadius.bubble,
    padding: 16,
  },
  userBubble: {
    backgroundColor: colors.userBubble,
    ...shadows.subtle,
  },
  assistantBubble: {
    backgroundColor: colors.assistantBubble,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
});

const markdownStyles = {
  body: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.body,
    color: colors.textPrimary,
    lineHeight: typography.sizes.body * typography.lineHeights.normal,
  },
  strong: {
    fontFamily: typography.fontFamily.semibold,
    fontWeight: '600',
  },
  em: {
    fontStyle: 'italic',
  },
  link: {
    color: colors.accent,
    textDecorationLine: 'underline',
  },
  code_inline: {
    fontFamily: 'Courier',
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  code_block: {
    fontFamily: 'Courier',
    backgroundColor: colors.bgSecondary,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
};

export default MessageBubble;
