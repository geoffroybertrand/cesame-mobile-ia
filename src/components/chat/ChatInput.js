/**
 * ChatInput - Input de chat avec style CESAME
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, shadows, spacing } from '../../styles/theme';

const ChatInput = ({ onSend, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Posez votre question..."
          placeholderTextColor={colors.textPlaceholder}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={2000}
          editable={!disabled}
        />
        <TouchableOpacity
          style={[styles.sendButton, disabled && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={disabled || !message.trim()}
        >
          <Ionicons
            name="send"
            size={20}
            color={message.trim() && !disabled ? colors.accent : colors.textPlaceholder}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.bgPrimary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputContainer: {
    backgroundColor: colors.inputBg,
    borderRadius: borderRadius.button,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 50,
    ...shadows.subtle,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.body,
    color: colors.textPrimary,
    maxHeight: 120,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    marginLeft: spacing.sm,
    padding: spacing.sm,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatInput;
