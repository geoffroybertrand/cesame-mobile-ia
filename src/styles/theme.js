/**
 * Design System CESAME - Theme Global
 * Combine colors, typography, spacing
 */

// Re-export everything as named exports
export { default as colors } from './colors';
export { default as typography } from './typography';
export { spacing, borderRadius, shadows } from './spacing';

// Also import for default export
import colors from './colors';
import typography from './typography';
import { spacing, borderRadius, shadows } from './spacing';

// Export as theme object
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export default theme;
