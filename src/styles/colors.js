/**
 * Design System CESAME - Couleurs
 * Extrait de l'application web pour garantir une cohérence visuelle
 */

export const colors = {
  // Backgrounds
  bgPrimary: '#FAF6F1',        // Fond principal - beige très clair
  bgSecondary: '#F7F0E8',      // Fond secondaire - beige clair
  sidebarBg: '#FAF6F1',        // Fond sidebar
  inputBg: '#FFFFFF',          // Fond inputs - blanc pur

  // Text
  textPrimary: '#3B2E29',      // Texte principal - marron foncé
  textSecondary: '#6B5954',    // Texte secondaire - marron moyen
  textPlaceholder: 'rgba(107, 89, 84, 0.5)', // Placeholder

  // Accent Colors - Terracotta
  accent: '#C86A4B',           // Couleur principale - orange terracotta
  accentLight: '#E8BBA8',      // Accent clair - rose pêche
  accentDark: '#9E4930',       // Accent foncé - marron rougeâtre

  // Borders
  border: '#E8D6C7',           // Bordures - beige rosé

  // Semantic Colors
  danger: '#F04438',           // Rouge danger
  error: '#B42318',            // Rouge erreur
  warn: '#C86A4B',             // Orange warning (même que accent)
  success: '#05603A',          // Vert succès

  // Chat Bubbles (du brief)
  userBubble: '#EFEEEA',           // Bulle utilisateur - beige grisé
  userBubbleLatest: '#F0EAE0',     // Dernier message utilisateur
  assistantBubble: '#FFFFFF',      // Bulle assistant - blanc

  // Workspaces & Threads (du brief)
  workspaceExpanded: '#F0E1DD',    // Background workspace actif
  threadActive: '#F9F7F4',         // Thread actif
  threadActiveBorder: '#CECAC7',   // Bordure thread actif
  threadHover: 'rgba(200, 106, 75, 0.08)', // Hover thread
  newThreadBg: '#F9E9E4',          // Bouton nouvelle conversation
  newThreadHover: '#F5DFD9',       // Hover nouvelle conversation

  // Message Counter (du brief)
  counterGreen: '#22C55E',         // > 50%
  counterOrange: '#F59E0B',        // 20-50%
  counterRed: '#EF4444',           // < 20%

  // States (avec opacité)
  accentWithOpacity: (opacity = 0.1) => `rgba(200, 106, 75, ${opacity})`,

  // Loader
  loader: '#3B2E29',

  // Shadow
  shadow: 'rgba(0, 0, 0, 0.05)',
  shadowElevated: 'rgba(0, 0, 0, 0.08)',
};

export default colors;
