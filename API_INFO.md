# API Backend CESAME Agent IA

## 🔗 URLs

- **Production**: https://[votre-domaine].com (À configurer dans .env)
- **Dev local**: http://localhost:3000 (si backend local)
- **Base API Path**: `/api`

Configuration dans votre app mobile:
```javascript
const API_BASE_URL = process.env.API_BASE_URL || 'https://your-domain.com/api';
```

## 🔐 Authentication

### Type
**Bearer Token (JWT)**

### Headers Requis
```javascript
{
  'Authorization': `Bearer ${authToken}`,
  'Content-Type': 'application/json'
}
```

### Storage
Dans l'application mobile, utiliser **AsyncStorage** pour:
```javascript
{
  'auth_token': string,           // Le JWT token
  'auth_user': JSON.stringify({   // Objet utilisateur
    id: number,
    username: string,
    role: 'admin' | 'manager' | 'default',
    // ...autres champs
  }),
  'auth_timestamp': timestamp
}
```

### Endpoints Auth
```
POST /api/auth/login
Body: { username: string, password: string }
Response: { success: boolean, token: string, user: object }

POST /api/auth/logout
Headers: { Authorization: Bearer token }

POST /api/forgot-password
Body: { email: string }

POST /api/reset-password/:token
Body: { newPassword: string }
```

## 📡 Endpoints Principaux

### 💬 Chat & Messaging

#### Récupérer les Workspaces
```
GET /api/workspaces
Headers: Authorization Bearer
Response: {
  workspaces: [
    {
      id: number,
      name: string,
      slug: string,
      createdAt: timestamp,
      // ...
    }
  ]
}
```

#### Détails d'un Workspace
```
GET /api/workspace/:slug
Response: {
  workspace: {
    id: number,
    name: string,
    slug: string,
    // ...configuration
  }
}
```

#### Récupérer l'Historique
```
GET /api/workspace/:slug/chats
Response: {
  history: [
    {
      id: number,
      prompt: string,        // Message utilisateur
      response: string,      // Réponse assistant
      createdAt: timestamp,
      user: { username: string }
    }
  ]
}
```

#### Envoyer un Message (STREAMING SSE)
```
POST /api/workspace/:slug/stream-chat
Headers: {
  Authorization: Bearer token,
  Content-Type: application/json
}
Body: {
  message: string,
  attachments: []  // Optionnel
}

Response: Server-Sent Events (SSE)
Format des événements:
{
  id: string,
  type: "textResponse" | "stopGeneration" | "abort",
  textResponse: string,
  sources: [],
  close: boolean,
  error: string | null
}
```

**Important pour React Native:**
- Utiliser `react-native-sse` ou `@microsoft/fetch-event-source` (polyfill)
- Gérer la reconnexion automatique
- Parser chaque event `data:` en JSON

#### Threads

```
GET /api/workspace/:slug/threads
Response: { threads: [...] }

GET /api/workspace/:slug/thread/:threadSlug
Response: { thread: {...} }

POST /api/workspace/:slug/thread/new
Body: { name: string }

GET /api/workspace/:slug/thread/:threadSlug/chats
Response: { history: [...] }

POST /api/workspace/:slug/thread/:threadSlug/stream-chat
Body: { message: string, attachments: [] }
// Même format SSE que pour workspace
```

#### Messages Suggérés
```
GET /api/workspace/:slug/suggested-messages
Response: {
  suggestedMessages: [
    { heading: string, message: string },
    ...
  ]
}
```

#### Feedback sur Messages
```
POST /api/workspace/:slug/chat-feedback/:chatId
Body: { feedback: true | false }  // thumbs up/down
```

### 👤 Utilisateur

```
GET /api/user/settings
Response: { user: {...} }

POST /api/user/update
Body: { username, email, ... }

POST /api/user/delete-account
```

### 🏞️ Médias

```
GET /api/workspace/:slug/pfp
Response: Blob (image)

GET /api/system/logo
Response: Blob (image)
```

### 💳 Paiements (Spécifique CESAME)

```
POST /api/payment/create-checkout-session
Body: { planId: string }

GET /api/payment/success
```

## 📝 Format Messages

### Message Utilisateur
```json
{
  "message": "Votre question ici",
  "attachments": []  // Pour version future avec upload
}
```

### Réponse Streaming (SSE)
```
data: {"id":"uuid","type":"textResponse","textResponse":"Début de ","sources":[]}
data: {"id":"uuid","type":"textResponse","textResponse":"la réponse...","sources":[]}
data: {"id":"uuid","type":"textResponse","textResponse":"complète.","sources":[],"close":true}
```

### Structure Historique
```json
{
  "history": [
    {
      "id": 123,
      "prompt": "Question utilisateur",
      "response": "Réponse de l'assistant avec **markdown**",
      "createdAt": "2024-10-15T10:30:00.000Z",
      "include": true,
      "user": {
        "id": 1,
        "username": "john_doe"
      }
    }
  ]
}
```

## 🎨 Design

### Couleurs CESAME (À utiliser dans React Native)

```javascript
export const colors = {
  // Backgrounds
  bgPrimary: '#FAF6F1',        // Fond principal
  bgSecondary: '#F7F0E8',      // Fond secondaire
  sidebarBg: '#FAF6F1',        // Sidebar
  inputBg: '#FFFFFF',          // Inputs

  // Text
  textPrimary: '#3B2E29',      // Texte principal
  textSecondary: '#6B5954',    // Texte secondaire

  // Accent
  accent: '#C86A4B',           // Couleur principale (terracotta)
  accentLight: '#E8BBA8',      // Accent clair
  accentDark: '#9E4930',       // Accent foncé

  // Borders
  border: '#E8D6C7',           // Bordures

  // Semantic
  danger: '#F04438',
  error: '#B42318',
  warn: '#C86A4B',
  success: '#05603A',

  // Chat Bubbles
  userBubble: '#EFEEEA',
  assistantBubble: '#FFFFFF',
};
```

### Typography
```javascript
export const typography = {
  fontFamily: 'Montserrat',  // À charger avec expo-font
  sizes: {
    h1: 28,
    h2: 24,
    h3: 20,
    body: 14,
    small: 13,
  },
  weights: {
    regular: '400',
    semibold: '600',
    bold: '700',
  }
};
```

### Spacing
```javascript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const borderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  bubble: 18,
  button: 20,
};
```

## 💾 Storage Local (AsyncStorage)

### Clés à utiliser
```javascript
const STORAGE_KEYS = {
  AUTH_TOKEN: 'cesame_auth_token',
  AUTH_USER: 'cesame_auth_user',
  AUTH_TIMESTAMP: 'cesame_auth_timestamp',

  // Cache
  SELECTED_WORKSPACE: 'cesame_selected_workspace',
  CHAT_HISTORY_PREFIX: 'cesame_chat_history_',  // + workspaceSlug

  // Preferences
  THEME: 'cesame_theme',
  LANGUAGE: 'cesame_language',
  MESSAGE_COUNT: 'cesame_message_count',
};
```

### Exemple de stockage
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sauvegarder le token
await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));

// Récupérer
const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
const userStr = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER);
const user = userStr ? JSON.parse(userStr) : null;

// Cache de l'historique (pour offline)
await AsyncStorage.setItem(
  `${STORAGE_KEYS.CHAT_HISTORY_PREFIX}${workspaceSlug}`,
  JSON.stringify(history)
);
```

## 🔄 Gestion des Sessions

### Workflow
1. **Login**: Stocker token + user dans AsyncStorage
2. **App Start**: Vérifier token dans AsyncStorage
3. **API Calls**: Inclure token dans tous les headers
4. **Token Expiry**: Détecter erreur 401 → redirect login
5. **Logout**: Clear AsyncStorage + redirect

### Reconnexion Automatique
```javascript
// Vérifier au démarrage
const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
if (token) {
  // Tester la validité
  const isValid = await validateToken(token);
  if (isValid) {
    // User est connecté
  } else {
    // Token expiré, clear et redirect login
    await AsyncStorage.clear();
  }
}
```

## 🚨 Gestion d'Erreurs

### Codes HTTP
- `200`: Success
- `401`: Non authentifié (redirect login)
- `403`: Pas de permission
- `404`: Resource non trouvée
- `429`: Rate limit (message limit atteint)
- `500`: Erreur serveur

### Messages d'Erreur
```javascript
try {
  const response = await fetch(url, options);
  if (!response.ok) {
    switch(response.status) {
      case 401:
        // Clear auth et redirect login
        await logout();
        break;
      case 429:
        // Message limit reached
        showMessageLimitModal();
        break;
      default:
        throw new Error(`HTTP ${response.status}`);
    }
  }
  return await response.json();
} catch (error) {
  // Gestion erreur réseau
  if (!navigator.onLine) {
    // Mode offline
  }
  throw error;
}
```

## 📊 Compteur de Messages

L'app web CESAME a un système de compteur de messages par utilisateur.

### Endpoints
```
GET /api/user/message-count
Response: { count: number, limit: number }
```

### Logique
- Incrémenter après chaque message envoyé
- Afficher indicateur quand proche de la limite
- Bloquer si limite atteinte (HTTP 429)
- Proposer upgrade plan

## 🔔 Notifications (Optionnel pour V2)

Pour notifications push:
```
POST /api/user/register-push-token
Body: { token: string, platform: 'ios' | 'android' }
```

## 🌐 Internationalisation

L'API supporte le header `Accept-Language` pour certaines réponses.

```javascript
headers: {
  'Accept-Language': 'fr-FR',  // ou 'en-US', 'es-ES', etc.
}
```

## 📱 Spécificités React Native

### EventSource (SSE)
```bash
npm install react-native-sse
# ou
npm install @microsoft/fetch-event-source
```

### AsyncStorage
```bash
npx expo install @react-native-async-storage/async-storage
```

### Markdown
```bash
npm install react-native-markdown-display
```

### KeyboardAvoidingView
Utiliser pour l'input de chat:
```javascript
<KeyboardAvoidingView behavior="padding">
```

## 🧪 Tests API

### Base URL de Test
```
http://localhost:3000/api  // Si backend local
```

### Exemple cURL
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Get workspaces
curl http://localhost:3000/api/workspaces \
  -H "Authorization: Bearer YOUR_TOKEN"

# Send message (note: streaming ne marche pas bien avec curl)
curl -X POST http://localhost:3000/api/workspace/general/stream-chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Bonjour!"}'
```

## 📖 Documentation Complète

Voir aussi:
- `docs/WEB_APP_ANALYSIS.md` - Analyse complète de l'app web
- `docs/ARCHITECTURE.md` - Architecture de l'app mobile (à créer)
- `docs/API_INTEGRATION.md` - Guide d'intégration API détaillé (à créer)
