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
import * as IntentLauncher from 'expo-intent-launcher';
import SlashCommandsMenu from './SlashCommandsMenu';
import { colors, typography, borderRadius, shadows, spacing } from '../../styles/theme';

const ChatInput = ({ onSend, disabled = false, messagesRemaining = null, isUnlimited = false }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [isRecordingActive, setIsRecordingActive] = useState(false);

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

  const handleSpeechToText = async () => {
    // Empêcher les clics multiples
    if (isRecordingActive) {
      console.log('Speech recognition already active, ignoring click');
      return;
    }

    if (Platform.OS === 'android') {
      setIsRecordingActive(true);
      try {
        // Lancer l'Intent de reconnaissance vocale native d'Android
        const result = await IntentLauncher.startActivityAsync(
          'android.speech.action.RECOGNIZE_SPEECH',
          {
            extra: {
              'android.speech.extra.LANGUAGE_MODEL': 'free_form',
              'android.speech.extra.LANGUAGE': 'fr-FR',
              'android.speech.extra.PROMPT': 'Parlez maintenant...',
              'android.speech.extra.MAX_RESULTS': 5,
              'android.speech.extra.PARTIAL_RESULTS': true,
              'android.speech.extra.PREFER_OFFLINE': true, // Utiliser modèle local si disponible
              'android.speech.extra.SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS': 3000, // 3 secondes de silence
              'android.speech.extra.SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS': 3000,
            },
          }
        );

        // Débugger le résultat complet
        console.log('Intent result:', JSON.stringify(result, null, 2));
        console.log('Result code:', result.resultCode);
        console.log('Result data:', result.data);

        // Récupérer le texte reconnu
        // result.resultCode -1 = Success sur Android
        if (result.resultCode === -1 || result.resultCode === IntentLauncher.ResultCode.Success) {
          console.log('Success! Looking for results...');

          // Les résultats sont dans result.extra, pas result.data !
          const matches = result.extra?.['android.speech.extra.RESULTS'];

          console.log('Matches found:', matches);

          if (matches && matches.length > 0) {
            const spokenText = matches[0];
            console.log('Spoken text:', spokenText);

            // Ajouter le texte au message existant
            const newMessage = message + (message ? ' ' : '') + spokenText;
            console.log('Setting new message:', newMessage);
            setMessage(newMessage);
          } else {
            console.log('No matches found in result.extra');
          }
        } else if (result.resultCode === IntentLauncher.ResultCode.Canceled || result.resultCode === 0) {
          // L'utilisateur a annulé
          console.log('Speech recognition canceled');
        } else {
          console.log('Unknown result code:', result.resultCode);
        }
      } catch (error) {
        console.error('Speech recognition error:', error);
        Alert.alert(
          'Erreur',
          'Impossible de lancer la reconnaissance vocale. Assurez-vous que Google Voice est installé.'
        );
      } finally {
        // Toujours réinitialiser l'état
        setIsRecordingActive(false);
      }
    } else {
      // Pour iOS, on pourrait implémenter une solution différente
      Alert.alert(
        'Non disponible',
        'La reconnaissance vocale n\'est disponible que sur Android pour le moment.'
      );
    }
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
              disabled={disabled || isRecordingActive}
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
