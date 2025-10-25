/**
 * ChatInput - Input de chat avec style CESAME
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import SlashCommandsMenu from './SlashCommandsMenu';
import WhisperBackendRecognition from './WhisperBackendRecognition';
import { colors, typography, borderRadius, shadows, spacing } from '../../styles/theme';

const ChatInput = ({ onSend, disabled = false, messagesRemaining = null, isUnlimited = false }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [isRecordingActive, setIsRecordingActive] = useState(false);
  const [speechText, setSpeechText] = useState(''); // Texte en cours de dictée
  const [baseMessage, setBaseMessage] = useState(''); // Message avant la dictée

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim(), attachments);
      setMessage('');
      setAttachments([]);
    }
  };

  const handleAttach = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'image/*',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'text/markdown',
          'text/csv',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setAttachments([...attachments, file]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner le fichier');
    }
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSpeechToText = () => {
    if (!isRecordingActive) {
      // Démarrer la dictée - sauvegarder le message actuel
      setBaseMessage(message);
      setSpeechText('');
      setIsRecordingActive(true);
    } else {
      // Arrêter la dictée - finaliser le texte
      const finalMessage = baseMessage + (baseMessage && speechText ? ' ' : '') + speechText;
      setMessage(finalMessage);
      setSpeechText('');
      setBaseMessage('');
      setIsRecordingActive(false);
    }
  };

  const handleSpeechResult = (transcript, isFinal) => {
    console.log('[ChatInput] Speech result:', transcript, 'Final:', isFinal);

    // Toujours afficher le texte en temps-réel
    setSpeechText(transcript);

    // Mettre à jour le champ de texte avec base + texte dicté
    const displayMessage = baseMessage + (baseMessage && transcript ? ' ' : '') + transcript;
    setMessage(displayMessage);
  };

  const handleSpeechError = (error) => {
    console.error('[ChatInput] Speech error:', error);
    Alert.alert('Erreur', 'Erreur de reconnaissance vocale');
    setIsRecordingActive(false);
  };

  const handleSlashCommand = () => {
    setShowSlashCommands(!showSlashCommands);
  };

  const handleExecuteCommand = (command) => {
    switch (command) {
      case '/reset':
        Alert.alert(
          'Réinitialiser',
          'Voulez-vous vraiment réinitialiser la conversation ?',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Réinitialiser', onPress: () => console.log('Reset') }
          ]
        );
        break;
      case '/help':
        Alert.alert('Aide', 'Commandes disponibles :\n/reset - Réinitialiser\n/help - Afficher l\'aide\n/clear - Effacer l\'historique');
        break;
      case '/clear':
        Alert.alert(
          'Effacer',
          'Voulez-vous vraiment effacer l\'historique ?',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Effacer', onPress: () => console.log('Clear') }
          ]
        );
        break;
      default:
        break;
    }
  };

  const getMessageCounterColor = () => {
    if (isUnlimited) return colors.textSecondary;
    const percentage = (messagesRemaining / 50) * 100; // Assuming max 50 for demo
    if (percentage > 50) return '#22C55E'; // green
    if (percentage > 20) return '#F59E0B'; // orange
    return '#EF4444'; // red
  };

  return (
    <View style={styles.container}>
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <View style={styles.attachmentsContainer}>
          {attachments.map((file, index) => (
            <View key={index} style={styles.attachmentItem}>
              <Ionicons name="document" size={16} color={colors.accent} />
              <Text style={styles.attachmentName} numberOfLines={1}>
                {file.name}
              </Text>
              <TouchableOpacity onPress={() => handleRemoveAttachment(index)}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.inputContainer}>
        {/* Textarea */}
        <View style={styles.textAreaWrapper}>
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

        {/* Bottom Toolbar */}
        <View style={styles.toolbar}>
          {/* Left side buttons */}
          <View style={styles.toolbarLeft}>
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={handleAttach}
              disabled={disabled}
            >
              <Ionicons name="attach" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={handleSlashCommand}
              disabled={disabled}
            >
              <Text style={styles.slashIcon}>/</Text>
            </TouchableOpacity>
          </View>

          {/* Right side buttons */}
          <View style={styles.toolbarRight}>
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={handleSpeechToText}
              disabled={disabled}
            >
              <Ionicons
                name="mic-outline"
                size={20}
                color={isRecordingActive ? colors.accent : colors.textSecondary}
              />
            </TouchableOpacity>

            {/* Message Counter */}
            <View style={styles.messageCounter}>
              <Text style={[styles.counterText, { color: getMessageCounterColor() }]}>
                {isUnlimited ? '∞ illimité' : `${messagesRemaining || 0}`}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Slash Commands Menu */}
      <SlashCommandsMenu
        visible={showSlashCommands}
        onClose={() => setShowSlashCommands(false)}
        onSelectCommand={handleExecuteCommand}
      />

      {/* Whisper Backend Recognition (via MacBook server) */}
      <WhisperBackendRecognition
        isActive={isRecordingActive}
        onResult={handleSpeechResult}
        onError={handleSpeechError}
      />
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
  attachmentsContainer: {
    marginBottom: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.inputBg,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.small,
    marginBottom: spacing.xs,
  },
  attachmentName: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.small,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  inputContainer: {
    backgroundColor: colors.inputBg,
    borderRadius: borderRadius.button,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.subtle,
  },
  textAreaWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: 40,
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
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolbarButton: {
    padding: spacing.sm,
    marginRight: spacing.xs,
  },
  slashIcon: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    color: colors.textSecondary,
  },
  messageCounter: {
    paddingHorizontal: spacing.sm,
  },
  counterText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.small,
  },
});

export default ChatInput;
