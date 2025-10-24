# Analyse de l'Application Web CESAME

## 📋 Vue d'Ensemble

Application web de chat IA basée sur **AnythingLLM**, personnalisée pour CESAME avec une identité visuelle unique et des fonctionnalités sur mesure.

## 🏗️ Architecture Frontend

### Framework & Versions
- **Framework**: React 18.2.0
- **Builder**: Vite 4.3.0
- **State Management**: React Context API
  - `AuthContext`: Gestion utilisateur et authentification
  - `MessageCountContext`: Compteur de messages
  - `ThemeContext`: Thème de l'application
  - `LogoContext`: Logo personnalisé
  - `PfpContext`: Photo de profil
- **Routing**: React Router DOM v6.3.0
- **Styling**: Tailwind CSS 3.3.1 + CSS custom
- **Internationalisation**: i18next 23.11.3

### Dépendances Clés

#### Chat & Messaging
- `@microsoft/fetch-event-source`: ^2.0.1 (Server-Sent Events pour streaming)
- `markdown-it`: ^13.0.1 (Rendu markdown)
- `dompurify`: ^3.0.8 (Sanitization HTML)
- `highlight.js`: ^11.9.0 (Coloration syntaxique)
- `katex`: ^0.6.0 (Formules mathématiques)

#### UI & UX
- `@phosphor-icons/react`: ^2.1.7 (Icônes)
- `react-toastify`: ^9.1.3 (Notifications)
- `react-tooltip`: ^5.25.2 (Tooltips)
- `react-loading-skeleton`: ^3.1.0 (Loaders)
- `@tremor/react`: ^3.15.1 (Composants analytics)

#### Audio & Speech
- `@mintplex-labs/piper-tts-web`: ^1.0.4 (Text-to-Speech)
- `react-speech-recognition`: ^3.10.0 (Speech-to-Text)

## 🗂️ Structure des Composants

```
src/
├── App.jsx                      # Point d'entrée, routing principal
├── main.jsx                     # Rendu React
├── AuthContext.jsx              # Context authentification
├── ThemeContext.jsx             # Context thème
├── LogoContext.jsx              # Context logo
├── PfpContext.jsx               # Context photo de profil
│
├── components/
│   ├── ChatBubble/              # Bulle de message (user + assistant)
│   ├── WorkspaceChat/           # Container principal du chat
│   │   ├── ChatContainer/       # Logique du chat
│   │   ├── ChatHistory/         # Historique des messages
│   │   ├── PromptInput/         # Input utilisateur
│   │   └── LoadingChat/         # État de chargement
│   ├── Sidebar/                 # Sidebar navigation
│   │   ├── ActiveWorkspaces/    # Liste des workspaces
│   │   ├── ThreadContainer/     # Threads de conversation
│   │   └── SidebarUserMenu/     # Menu utilisateur
│   ├── UserIcon/                # Avatar utilisateur
│   ├── MessageCounter/          # Compteur de messages
│   ├── RemainingMessagesIndicator/
│   └── [36 autres composants]
│
├── pages/
│   ├── Main/                    # Page d'accueil
│   ├── WorkspaceChat/           # Page chat workspace
│   ├── Login/                   # Page login
│   ├── ForgotPassword/
│   ├── ResetPassword/
│   ├── UserSettings/            # Paramètres utilisateur
│   ├── PaymentPlans/            # Plans de paiement
│   ├── PaymentSuccess/
│   ├── PaymentCancel/
│   ├── AccountDeleted/
│   └── [17 pages admin/settings]
│
├── models/                      # Services API
│   ├── workspace.js             # API workspace & chat
│   ├── workspaceThread.js       # API threads
│   ├── admin.js                 # API admin
│   ├── system.js                # API système
│   ├── invite.js                # API invitations
│   └── [10 autres models]
│
├── utils/
│   ├── request.js               # Headers & auth
│   ├── constants.js             # Constantes globales
│   ├── session.js               # Gestion session
│   ├── chat/
│   │   ├── index.js
│   │   ├── markdown.js          # Rendu markdown
│   │   ├── purify.js            # Sanitization
│   │   └── agent.js
│   └── [autres utils]
│
└── hooks/                       # Hooks personnalisés
    └── [16 hooks]
```

## 🔌 API Backend

### Base URL
```javascript
const API_BASE = import.meta.env.VITE_API_BASE || "/api";
// En production: https://[domain]/api
```

### Authentication
- **Type**: Bearer Token (JWT)
- **Storage**: localStorage
  - `anythingllm_authToken`: Token JWT
  - `anythingllm_user`: Objet utilisateur sérialisé JSON
  - `anythingllm_authTimestamp`: Timestamp de connexion
- **Headers**:
  ```javascript
  {
    Authorization: `Bearer ${token}`
  }
  ```

### Endpoints Principaux

#### 🔐 Authentification
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/register
POST   /api/auth/forgot-password
POST   /api/auth/reset-password/:token
```

#### 💬 Chat & Workspaces
```
GET    /api/workspaces                          # Liste des workspaces
GET    /api/workspace/:slug                     # Détails d'un workspace
POST   /api/workspace/new                       # Créer workspace
POST   /api/workspace/:slug/update              # Modifier workspace
DELETE /api/workspace/:slug                     # Supprimer workspace

GET    /api/workspace/:slug/chats               # Historique chat
POST   /api/workspace/:slug/stream-chat         # Envoyer message (SSE streaming)
POST   /api/workspace/:slug/chat-feedback/:id   # Feedback message
DELETE /api/workspace/:slug/delete-chats        # Supprimer messages
POST   /api/workspace/:slug/update-chat         # Modifier réponse
DELETE /api/workspace/:slug/delete-edited-chats # Supprimer messages édités

GET    /api/workspace/:slug/suggested-messages  # Messages suggérés
POST   /api/workspace/:slug/suggested-messages  # Définir messages suggérés

POST   /api/workspace/:slug/upload              # Upload fichier
POST   /api/workspace/:slug/upload-link         # Upload lien
POST   /api/workspace/:slug/upload-and-embed    # Upload + embed
DELETE /api/workspace/:slug/remove-and-unembed  # Supprimer fichier embedé
POST   /api/workspace/:slug/update-embeddings   # Modifier embeddings

GET    /api/workspace/:slug/pfp                 # Photo de profil workspace
POST   /api/workspace/:slug/upload-pfp          # Upload photo profil
DELETE /api/workspace/:slug/remove-pfp          # Supprimer photo profil

GET    /api/workspace/:slug/tts/:chatId         # Text-to-Speech
```

#### 🧵 Threads
```
GET    /api/workspace/:slug/threads             # Liste threads
GET    /api/workspace/:slug/thread/:threadSlug  # Détails thread
POST   /api/workspace/:slug/thread/new          # Créer thread
POST   /api/workspace/:slug/thread/:threadSlug/update  # Modifier thread
DELETE /api/workspace/:slug/thread/:threadSlug  # Supprimer thread

GET    /api/workspace/:slug/thread/:threadSlug/chats   # Historique thread
POST   /api/workspace/:slug/thread/:threadSlug/stream-chat  # Message thread (SSE)
POST   /api/workspace/:slug/thread/fork         # Forker thread
```

#### 👥 Utilisateurs & Admin
```
GET    /api/admin/users                         # Liste utilisateurs
POST   /api/admin/users/new                     # Créer utilisateur
POST   /api/admin/user/:id                      # Modifier utilisateur
DELETE /api/admin/user/:id                      # Supprimer utilisateur

GET    /api/admin/invites                       # Invitations
POST   /api/admin/invite/new                    # Créer invitation

GET    /api/system/system-vectors               # Config système
GET    /api/system/logo                         # Logo personnalisé
POST   /api/system/upload-logo                  # Upload logo
DELETE /api/system/remove-logo                  # Supprimer logo
```

#### 💳 Paiements (Spécifique CESAME)
```
POST   /api/payment/create-checkout-session
GET    /api/payment/success
POST   /api/user/delete-account
```

## 📨 Format des Messages

### Request Body - Envoyer un message
```javascript
{
  message: string,              // Texte du message
  attachments: [                // Optionnel: fichiers attachés
    {
      name: string,
      type: string,
      content: string
    }
  ]
}
```

### Response Format - Message streaming (SSE)
```javascript
// Format des événements SSE
{
  id: string,                   // UUID du message
  type: string,                 // "textResponse" | "stopGeneration" | "abort"
  textResponse: string,         // Texte de la réponse
  sources: [],                  // Sources documentaires
  close: boolean,               // Fin du stream
  error: string | null          // Message d'erreur éventuel
}
```

### Structure Historique
```javascript
{
  history: [
    {
      id: number,
      prompt: string,           // Message utilisateur
      response: string,         // Réponse assistant
      createdAt: timestamp,
      include: boolean,         // Inclure dans contexte
      user: {
        username: string
      }
    }
  ]
}
```

## 🎨 Design System

### Palette de Couleurs CESAME

#### Couleurs Principales
```css
--cesame-bg-primary: #FAF6F1;        /* Beige très clair - fond principal */
--cesame-bg-secondary: #F7F0E8;      /* Beige clair - fond secondaire */
--cesame-sidebar-bg: #FAF6F1;        /* Fond sidebar */
--cesame-input-bg: #FFFFFF;          /* Blanc - inputs */

--cesame-text-primary: #3B2E29;      /* Marron foncé - texte principal */
--cesame-text-secondary: #6B5954;    /* Marron moyen - texte secondaire */

--cesame-accent: #C86A4B;            /* Orange terracotta - couleur principale */
--cesame-accent-light: #E8BBA8;      /* Orange clair */
--cesame-accent-dark: #9E4930;       /* Orange foncé */

--cesame-border: #E8D6C7;            /* Beige rosé - bordures */
```

#### Couleurs Sémantiques
```css
--danger: #F04438;
--error: #B42318;
--warn: #C86A4B;
--success: #05603A;
```

### Typographie
```css
font-family: "Montserrat", -apple-system, BlinkMacSystemFont,
             "Segoe UI", Roboto, sans-serif;
```

### Tailles
- Headers: `xx-large` (h1), `x-large` (h2), `large` (h3)
- Body: `14px` / `0.875rem`
- Small: `13px`

### Espacements & Bordures
- Border radius standard: `18-20px` (bulles de chat)
- Border radius buttons: `20px`
- Border radius cards: `12-16px`
- Shadows: `0 1px 4px rgba(0, 0, 0, 0.05)` (standard)
- Shadows elevated: `0 2px 6px rgba(0, 0, 0, 0.08)`

### Composants Spécifiques

#### Bulles de Chat
```css
.cesame-user-bubble {
  background-color: #EFEEEA;
  color: #000000;
  border-radius: 18px;
  padding: 12px 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.cesame-assistant-bubble {
  background-color: #FFFFFF;
  color: #000000;
  border-radius: 18px;
  padding: 16px 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #E8D6C7;
}
```

#### Input de Chat
```css
.cesame-chat-input {
  background-color: white;
  border-radius: 20px;
  border: 1px solid #E8D6C7;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  min-height: 85px;
}
```

#### Sidebar
```css
.cesame-sidebar-container {
  background-color: #FAF6F1;
  border-radius: 16px;
  border: 1px solid #E8D6C7;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}
```

## 🔄 Flux Utilisateur Principal

### 1. Authentification
```
Login Page → POST /api/auth/login → Store token + user → Redirect to Main
```

### 2. Chargement Initial
```
Main Page → GET /api/workspaces → Display workspaces list
```

### 3. Entrer dans un Workspace
```
Click workspace → Navigate to /workspace/:slug
↓
GET /api/workspace/:slug → Load workspace details
GET /api/workspace/:slug/chats → Load chat history
GET /api/workspace/:slug/suggested-messages → Load suggestions
GET /api/workspace/:slug/pfp → Load workspace avatar
```

### 4. Envoyer un Message
```
User types message → Click send
↓
POST /api/workspace/:slug/stream-chat (SSE)
↓
Receive events:
  - textResponse events (streaming)
  - sources (si RAG)
  - close event
↓
Update chat history locally
```

### 5. Gestion des Threads
```
Click "New thread" → POST /api/workspace/:slug/thread/new
Select thread → Navigate to /workspace/:slug/t/:threadSlug
Fork conversation → POST /api/workspace/:slug/thread/fork
```

## 💾 Storage & State

### LocalStorage
```javascript
// Authentication
anythingllm_authToken: string
anythingllm_user: JSON string
anythingllm_authTimestamp: timestamp

// Preferences
anythingllm_appearance_settings: JSON
anythingllm_completed_questionnaire: boolean
anythingllm_pinned_document_alert: boolean
anythingllm_watched_document_alert: boolean
```

### Context State
- **AuthContext**: `user`, `authToken`
- **ThemeContext**: `theme` (light/dark)
- **MessageCountContext**: `messageCount`, `limit`
- **LogoContext**: `logo` (URL custom logo)
- **PfpContext**: `pfp` (URL photo de profil)

## 🔧 Fonctionnalités Clés

### Chat Features
- ✅ Streaming SSE (Server-Sent Events)
- ✅ Markdown rendering (markdown-it + highlight.js)
- ✅ Code syntax highlighting
- ✅ Math formulas (KaTeX)
- ✅ Message editing
- ✅ Message deletion
- ✅ Conversation history
- ✅ Threads / branching conversations
- ✅ Suggested messages
- ✅ File attachments
- ✅ Feedback on messages (thumbs up/down)

### Audio
- ✅ Text-to-Speech (Piper TTS)
- ✅ Speech-to-Text (Web Speech API)

### Documents
- ✅ Upload files
- ✅ Upload links
- ✅ Embedding management
- ✅ RAG (Retrieval Augmented Generation)
- ✅ Pin documents
- ✅ Watch documents

### Multi-utilisateurs
- ✅ User roles (admin, manager, user)
- ✅ Workspace sharing
- ✅ Invitations
- ✅ User management

### Spécifique CESAME
- ✅ Message counter / limits
- ✅ Payment integration (Stripe probable)
- ✅ Subscription management
- ✅ Account deletion
- ✅ Custom branding (logo, colors)
- ✅ Google OAuth integration

## 🔒 Sécurité

### Sanitization
- DOMPurify pour tous les contenus HTML
- Markdown rendering sécurisé
- XSS protection

### CORS
Headers configurés côté backend avec `baseHeaders()`

### File Upload
- Validation côté client et serveur
- Types de fichiers limités

## 🌐 Internationalisation

Langues supportées:
- Anglais (en)
- Français (fr)
- Espagnol (es)
- Allemand (de)
- Italien (it)
- Portugais (pt_BR)
- Chinois (zh, zh_TW)
- Japonais
- Coréen (ko)
- Russe (ru)
- Arabe (ar)
- Hébreu (he)
- Néerlandais (nl)
- Turc (tr)
- Vietnamien (vn)
- Farsi (fa)

## 📱 Responsive Design

- Desktop-first approach
- Mobile optimizations avec `isMobile` (react-device-detect)
- Sidebar cachée sur mobile
- Inputs adaptés au clavier mobile
- Touch-friendly UI

## 🎯 Points Clés pour l'App Mobile

### À Porter sur Mobile
1. **Architecture streaming SSE** → Utiliser EventSource ou équivalent React Native
2. **Authentification JWT** → AsyncStorage pour le token
3. **Markdown rendering** → Bibliothèque React Native markdown
4. **Structure messages** → Exact same format
5. **Design CESAME** → Couleurs et styles identiques
6. **Workspaces & Threads** → Même logique de navigation
7. **Message limits** → Counter et gestion abonnements

### À Simplifier
1. Pas de drag & drop files (utiliser picker natif)
2. Pas de TTS/STT web (utiliser APIs natives)
3. UI simplifiée sans tous les settings admin
4. Focus sur chat principal et historique

### Optimisations Mobiles
1. Lazy loading des messages (pagination)
2. Cache intelligent (AsyncStorage)
3. Reconnexion automatique SSE
4. Gestion offline gracieuse
5. Notifications push (optionnel)
