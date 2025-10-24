/**
 * LoginScreen - Écran de connexion
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';

const LoginScreen = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    const result = await login(username.trim(), password);
    setIsLoading(false);

    if (!result.success) {
      Alert.alert('Erreur de connexion', result.error || 'Identifiants invalides');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>CESAME Agent IA</Text>
        <Text style={styles.subtitle}>Connexion</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nom d'utilisateur"
            placeholderTextColor={colors.textPlaceholder}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor={colors.textPlaceholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.h1,
    color: colors.accent,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
  form: {
    gap: spacing.lg,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.body,
    color: colors.textPrimary,
    ...shadows.subtle,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.button,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.card,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.body,
    color: '#FFFFFF',
  },
});

export default LoginScreen;
