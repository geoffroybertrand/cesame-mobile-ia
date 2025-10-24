/**
 * SlashCommandsMenu - Menu popup des commandes slash
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, shadows, spacing } from '../../styles/theme';

const SLASH_COMMANDS = [
  {
    command: '/reset',
    description: 'Réinitialiser la conversation',
    icon: 'refresh',
  },
  {
    command: '/help',
    description: 'Afficher l\'aide',
    icon: 'help-circle',
  },
  {
    command: '/clear',
    description: 'Effacer l\'historique',
    icon: 'trash',
  },
];

const SlashCommandsMenu = ({ visible, onClose, onSelectCommand }) => {
  const handleSelectCommand = (command) => {
    onSelectCommand(command);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={styles.menu}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Commandes</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {SLASH_COMMANDS.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.commandItem}
                onPress={() => handleSelectCommand(item.command)}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={colors.accent}
                  style={styles.commandIcon}
                />
                <View style={styles.commandTextContainer}>
                  <Text style={styles.commandText}>{item.command}</Text>
                  <Text style={styles.commandDescription}>{item.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  menu: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.inputBg,
    borderRadius: borderRadius.large,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.h4,
    color: colors.textPrimary,
  },
  commandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  commandIcon: {
    marginRight: spacing.md,
  },
  commandTextContainer: {
    flex: 1,
  },
  commandText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.body,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  commandDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
  },
});

export default SlashCommandsMenu;
