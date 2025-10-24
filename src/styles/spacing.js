/**
 * Design System CESAME - Espacements
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  bubble: 18,      // Pour les bulles de chat
  button: 20,      // Pour les boutons
  full: 9999,      // Circulaire
};

export const shadows = {
  // Standard shadow pour cartes
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  // Shadow élevée pour éléments importants
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  // Shadow subtile
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
};

export default {
  spacing,
  borderRadius,
  shadows,
};
