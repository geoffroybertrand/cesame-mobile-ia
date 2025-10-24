/**
 * Constantes globales de l'application
 */

import Constants from 'expo-constants';

// API Configuration
export const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3000/api';

// AsyncStorage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'cesame_auth_token',
  AUTH_USER: 'cesame_auth_user',
  AUTH_TIMESTAMP: 'cesame_auth_timestamp',

  // Cache
  SELECTED_WORKSPACE: 'cesame_selected_workspace',
  CHAT_HISTORY_PREFIX: 'cesame_chat_history_',
  THREAD_ID_PREFIX: 'cesame_thread_id_',

  // Preferences
  THEME: 'cesame_theme',
  LANGUAGE: 'cesame_language',
  MESSAGE_COUNT: 'cesame_message_count',
};

// Event Names
export const EVENTS = {
  ABORT_STREAM: 'ABORT_STREAM_EVENT',
  MESSAGE_RECEIVED: 'MESSAGE_RECEIVED',
  MESSAGE_SENT: 'MESSAGE_SENT',
};

// Message Types (SSE)
export const MESSAGE_TYPES = {
  TEXT_RESPONSE: 'textResponse',
  STOP_GENERATION: 'stopGeneration',
  ABORT: 'abort',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMIT: 429,
  SERVER_ERROR: 500,
};

// Timeouts (ms)
export const TIMEOUTS = {
  API_REQUEST: 30000,
  SSE_RECONNECT: 3000,
};

export default {
  API_BASE_URL,
  STORAGE_KEYS,
  EVENTS,
  MESSAGE_TYPES,
  HTTP_STATUS,
  TIMEOUTS,
};
