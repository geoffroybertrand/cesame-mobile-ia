/**
 * WorkspacesScreen - Liste des workspaces disponibles
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import ApiService from '../services';
import Sidebar from '../components/navigation/Sidebar';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

const WorkspacesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { setWorkspace } = useChat();
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setIsLoading(true);
      const data = await ApiService.getWorkspaces();
      setWorkspaces(data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkspacePress = async (workspace) => {
    setWorkspace(workspace);
    navigation.navigate('Chat', { workspaceSlug: workspace.slug });
  };

  const renderWorkspace = ({ item }) => (
    <TouchableOpacity
      style={styles.workspaceCard}
      onPress={() => handleWorkspacePress(item)}
    >
      <View style={styles.workspaceIcon}>
        <Ionicons name="chatbubbles" size={24} color={colors.accent} />
      </View>
      <View style={styles.workspaceInfo}>
        <Text style={styles.workspaceName}>{item.name}</Text>
        <Text style={styles.workspaceSlug}>@{item.slug}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuButton}>
            <Ionicons name="menu" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mes Conversations</Text>
          <View style={styles.menuButton} />
        </View>

        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>

        <Sidebar
          visible={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          navigation={navigation}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Conversations</Text>
        <View style={styles.menuButton} />
      </View>

      {user && (
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Bonjour, {user.username}</Text>
        </View>
      )}

      <FlatList
        data={workspaces}
        renderItem={renderWorkspace}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={loadWorkspaces}
      />

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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.h3,
    color: colors.accent,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgPrimary,
  },
  greeting: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  greetingText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  workspaceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    ...shadows.card,
  },
  workspaceIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.medium,
    backgroundColor: colors.accentWithOpacity(0.1),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  workspaceInfo: {
    flex: 1,
  },
  workspaceName: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.body,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  workspaceSlug: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
  },
});

export default WorkspacesScreen;
