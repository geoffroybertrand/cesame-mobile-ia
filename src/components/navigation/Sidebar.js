/**
 * Sidebar - Menu latéral avec workspaces expandables et threads
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import ApiService from '../../services';
import ThreadService from '../../services/threads';
import StorageService from '../../services/storage';
import { colors, typography, spacing, borderRadius, shadows } from '../../styles/theme';

const Sidebar = ({ visible, onClose, navigation, currentRoute }) => {
  const { user, logout } = useAuth();
  const { setWorkspace } = useChat();
  const [workspaces, setWorkspaces] = useState([]);
  const [threads, setThreads] = useState({});
  const [expandedWorkspace, setExpandedWorkspace] = useState(null);
  const [loadingThreads, setLoadingThreads] = useState({});
  const [creatingThread, setCreatingThread] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-300));

  useEffect(() => {
    if (visible) {
      loadWorkspaces();
      loadExpandedState();
      // Slide in
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide out
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const loadWorkspaces = async () => {
    try {
      const data = await ApiService.getWorkspaces();
      setWorkspaces(data);

      // Load threads for first workspace or current workspace
      if (data.length > 0) {
        const firstSlug = data[0].slug;
        loadThreadsForWorkspace(firstSlug);
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
    }
  };

  const loadExpandedState = async () => {
    try {
      const saved = await StorageService.getItem('expandedWorkspace', false);
      if (saved) {
        setExpandedWorkspace(saved);
      }
    } catch (error) {
      console.error('Error loading expanded state:', error);
    }
  };

  const saveExpandedState = async (slug) => {
    try {
      await StorageService.setItem('expandedWorkspace', slug);
    } catch (error) {
      console.error('Error saving expanded state:', error);
    }
  };

  const loadThreadsForWorkspace = async (workspaceSlug) => {
    if (threads[workspaceSlug]) return; // Already loaded

    setLoadingThreads(prev => ({ ...prev, [workspaceSlug]: true }));
    try {
      const data = await ThreadService.getThreads(workspaceSlug);
      setThreads(prev => ({ ...prev, [workspaceSlug]: data }));
    } catch (error) {
      console.error('Error loading threads:', error);
    } finally {
      setLoadingThreads(prev => ({ ...prev, [workspaceSlug]: false }));
    }
  };

  const handleWorkspaceToggle = async (workspace) => {
    const newExpanded = expandedWorkspace === workspace.slug ? null : workspace.slug;
    setExpandedWorkspace(newExpanded);
    await saveExpandedState(newExpanded);

    // Load threads if expanding
    if (newExpanded) {
      loadThreadsForWorkspace(workspace.slug);
    }
  };

  const handleNewThread = async (workspaceSlug) => {
    setCreatingThread(workspaceSlug);
    try {
      const newThread = await ThreadService.createThread(workspaceSlug);

      // Refresh threads
      setThreads(prev => ({
        ...prev,
        [workspaceSlug]: [newThread, ...(prev[workspaceSlug] || [])],
      }));

      // Navigate to new thread
      navigation.navigate('Chat', {
        workspaceSlug,
        threadSlug: newThread.slug
      });
      onClose();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer la conversation');
    } finally {
      setCreatingThread(null);
    }
  };

  const handleThreadPress = (workspaceSlug, thread) => {
    navigation.navigate('Chat', {
      workspaceSlug,
      threadSlug: thread.slug
    });
    onClose();
  };

  const handleDeleteThread = (workspaceSlug, thread) => {
    Alert.alert(
      'Supprimer la conversation',
      `Voulez-vous vraiment supprimer "${thread.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await ThreadService.deleteThread(workspaceSlug, thread.slug);

              // Remove from local state
              setThreads(prev => ({
                ...prev,
                [workspaceSlug]: prev[workspaceSlug].filter(t => t.slug !== thread.slug),
              }));

              // Navigate back to workspace if deleted thread was active
              navigation.navigate('Chat', { workspaceSlug });
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer la conversation');
            }
          },
        },
      ]
    );
  };

  const handleRenameThread = (workspaceSlug, thread) => {
    Alert.prompt(
      'Renommer la conversation',
      'Nouveau nom :',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Renommer',
          onPress: async (newName) => {
            if (!newName || newName.trim() === '') return;

            try {
              await ThreadService.renameThread(workspaceSlug, thread.slug, newName.trim());

              // Update local state
              setThreads(prev => ({
                ...prev,
                [workspaceSlug]: prev[workspaceSlug].map(t =>
                  t.slug === thread.slug ? { ...t, name: newName.trim() } : t
                ),
              }));
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de renommer la conversation');
            }
          },
        },
      ],
      'plain-text',
      thread.name
    );
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        onPress: () => {
          logout();
          onClose();
        },
        style: 'destructive'
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Background overlay */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Sidebar content */}
        <Animated.View
          style={[
            styles.sidebar,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <SafeAreaView style={styles.container} edges={['top', 'left']}>
            {/* Logo */}
            <View style={styles.header}>
              <Text style={styles.logo}>CESAME</Text>
              <Text style={styles.subtitle}>Agent IA</Text>
            </View>

            {/* Workspaces List with Threads */}
            <ScrollView style={styles.workspacesList} showsVerticalScrollIndicator={false}>
              {workspaces.map((workspace) => (
                <View key={workspace.id} style={styles.workspaceContainer}>
                  {/* Workspace Header */}
                  <TouchableOpacity
                    style={[
                      styles.workspaceHeader,
                      expandedWorkspace === workspace.slug && styles.workspaceHeaderExpanded
                    ]}
                    onPress={() => handleWorkspaceToggle(workspace)}
                  >
                    <Ionicons
                      name={expandedWorkspace === workspace.slug ? "chevron-down" : "chevron-forward"}
                      size={16}
                      color={colors.accent}
                      style={styles.workspaceChevron}
                    />
                    <Ionicons
                      name="grid-outline"
                      size={18}
                      color={colors.accent}
                      style={styles.workspaceIconSmall}
                    />
                    <Text
                      style={[
                        styles.workspaceName,
                        expandedWorkspace === workspace.slug && styles.workspaceNameExpanded
                      ]}
                      numberOfLines={1}
                    >
                      {workspace.name}
                    </Text>
                  </TouchableOpacity>

                  {/* Threads List (when expanded) */}
                  {expandedWorkspace === workspace.slug && (
                    <View style={styles.threadsContainer}>
                      {/* New Thread Button */}
                      <TouchableOpacity
                        style={styles.newThreadButton}
                        onPress={() => handleNewThread(workspace.slug)}
                        disabled={creatingThread === workspace.slug}
                      >
                        {creatingThread === workspace.slug ? (
                          <ActivityIndicator size="small" color={colors.accent} />
                        ) : (
                          <Ionicons name="add" size={18} color={colors.textPrimary} />
                        )}
                        <Text style={styles.newThreadText}>
                          {creatingThread === workspace.slug ? 'Création...' : 'Nouvelle Conversation'}
                        </Text>
                      </TouchableOpacity>

                      {/* Loading */}
                      {loadingThreads[workspace.slug] && (
                        <View style={styles.loadingThreads}>
                          <ActivityIndicator size="small" color={colors.accent} />
                        </View>
                      )}

                      {/* Thread Items */}
                      {threads[workspace.slug]?.map((thread) => (
                        <View key={thread.id} style={styles.threadRow}>
                          <TouchableOpacity
                            style={styles.threadItem}
                            onPress={() => handleThreadPress(workspace.slug, thread)}
                          >
                            <Text style={styles.threadName} numberOfLines={1}>
                              {thread.name}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.threadMenu}
                            onPress={() => {
                              Alert.alert(
                                thread.name,
                                'Options',
                                [
                                  {
                                    text: 'Renommer',
                                    onPress: () => handleRenameThread(workspace.slug, thread),
                                  },
                                  {
                                    text: 'Supprimer',
                                    onPress: () => handleDeleteThread(workspace.slug, thread),
                                    style: 'destructive',
                                  },
                                  {
                                    text: 'Annuler',
                                    style: 'cancel',
                                  },
                                ]
                              );
                            }}
                          >
                            <Ionicons name="ellipsis-horizontal" size={16} color={colors.textSecondary} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            {/* User Menu at Bottom */}
            <View style={styles.footer}>
              <View style={styles.divider} />

              {/* User Info Button */}
              <TouchableOpacity
                style={styles.userInfo}
                onPress={() => setShowUserMenu(!showUserMenu)}
                activeOpacity={0.7}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user?.username?.slice(0, 2)?.toUpperCase() || 'AA'}
                  </Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {user?.username || 'Utilisateur'}
                  </Text>
                  <View style={styles.planBadgeContainer}>
                    <Text style={styles.planLabel}>Forfait</Text>
                    <View style={styles.planBadge}>
                      <Text style={styles.planBadgeText}>Gratuit</Text>
                    </View>
                  </View>
                </View>
                <Ionicons
                  name={showUserMenu ? "chevron-down" : "chevron-up"}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <View style={styles.userMenuDropdown}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      Alert.alert('Compte', 'Gestion du compte');
                      setShowUserMenu(false);
                    }}
                  >
                    <Ionicons name="person-outline" size={18} color={colors.textPrimary} />
                    <Text style={styles.menuItemText}>Compte</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      Alert.alert('Forfaits', 'Voir les forfaits disponibles');
                      setShowUserMenu(false);
                    }}
                  >
                    <Ionicons name="card-outline" size={18} color={colors.textPrimary} />
                    <Text style={styles.menuItemText}>Forfaits</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      Alert.alert('Support', 'Contactez support@cesame.fr');
                      setShowUserMenu(false);
                    }}
                  >
                    <Ionicons name="help-circle-outline" size={18} color={colors.textPrimary} />
                    <Text style={styles.menuItemText}>Support</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      Alert.alert('Confidentialité', 'Voir les CGU');
                      setShowUserMenu(false);
                    }}
                  >
                    <Ionicons name="shield-checkmark-outline" size={18} color={colors.textPrimary} />
                    <Text style={styles.menuItemText}>Confidentialité et données</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      Alert.alert('Consultation', 'Réserver une consultation');
                      setShowUserMenu(false);
                    }}
                  >
                    <Ionicons name="calendar-outline" size={18} color={colors.textPrimary} />
                    <Text style={styles.menuItemText}>Réserver une consultation</Text>
                  </TouchableOpacity>

                  <View style={styles.menuDivider} />

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                  >
                    <Ionicons name="log-out-outline" size={18} color={colors.danger} />
                    <Text style={[styles.menuItemText, { color: colors.danger }]}>Déconnexion</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    width: '85%',
    maxWidth: 350,
    backgroundColor: '#FAF6F1',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  logo: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 28,
    color: colors.accent,
  },
  subtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  workspacesList: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  workspaceContainer: {
    marginBottom: spacing.xs,
  },
  workspaceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.small,
  },
  workspaceHeaderExpanded: {
    backgroundColor: '#F0E1DD',
  },
  workspaceChevron: {
    marginRight: spacing.xs,
  },
  workspaceIconSmall: {
    marginRight: spacing.sm,
  },
  workspaceName: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.body,
    color: colors.textPrimary,
    flex: 1,
  },
  workspaceNameExpanded: {
    fontFamily: typography.fontFamily.bold,
  },
  threadsContainer: {
    marginTop: spacing.xs,
    paddingLeft: spacing.xl,
  },
  newThreadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9E9E4',
    borderRadius: 20,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  newThreadText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.small,
    color: colors.textPrimary,
    marginLeft: spacing.xs,
  },
  loadingThreads: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  threadItem: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.small,
  },
  threadName: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    color: '#6B5954',
  },
  threadMenu: {
    padding: spacing.xs,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: '#F9F7F4',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.inputBg,
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    ...shadows.subtle,
  },
  userMenuDropdown: {
    backgroundColor: colors.inputBg,
    borderRadius: borderRadius.medium,
    padding: spacing.xs,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.body,
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.body,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  planBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.tiny,
    color: colors.textSecondary,
    marginRight: 6,
  },
  planBadge: {
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  planBadgeText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    color: colors.textSecondary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.small,
  },
  menuItemText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.body,
    color: colors.textPrimary,
    marginLeft: spacing.md,
    flex: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
    marginHorizontal: spacing.sm,
  },
});

export default Sidebar;
