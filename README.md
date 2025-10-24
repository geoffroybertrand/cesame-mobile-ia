# CESAME Agent IA - Application Mobile

Application mobile React Native + Expo pour iOS et Android, basée sur le frontend web CESAME.

## 📱 Description

Application de chat IA mobile avec:
- ✅ Design CESAME fidèle au web (couleurs terracotta, typographie Montserrat)
- ✅ Streaming SSE en temps réel
- ✅ Authentification JWT
- ✅ Cache local avec AsyncStorage
- ✅ Support markdown dans les messages
- ✅ Gestion multi-workspaces
- ✅ Interface responsive iOS/Android

## 🚀 Installation

### ⚠️ IMPORTANT - Lire en Premier

**Problème résolu:** L'application a été corrigée pour utiliser les bons endpoints API. Si vous aviez des problèmes de connexion, consultez `docs/CORRECTIONS_API.md` pour voir les changements.

**Point clé:** Sur appareil physique, vous DEVEZ utiliser votre IP locale (ex: `192.168.0.43`) et NON `localhost`.

### Prérequis
- Node.js >= 16
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app sur votre téléphone (pour tester)
- Backend CESAME/AnythingLLM en cours d'exécution

### Étapes

1. **Installer les dépendances**
```bash
npm install
```

2. **Configurer l'environnement**

Copier `.env.example` vers `.env` et configurer:
```bash
cp .env.example .env
```

Éditer `.env`:
```env
# Pour tester sur appareil physique, utilisez votre IP locale
API_BASE_URL=http://192.168.0.43:3001/api

# Pour simulateur iOS (si backend en local)
# API_BASE_URL=http://localhost:3001/api

# Pour production
# API_BASE_URL=https://your-backend-domain.com/api
```

**IMPORTANT**: Si vous testez sur un appareil physique (téléphone), vous DEVEZ utiliser l'IP locale de votre machine (pas `localhost`). Trouvez votre IP avec:
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

3. **Ajouter les polices Montserrat**

Télécharger Montserrat depuis [Google Fonts](https://fonts.google.com/specimen/Montserrat) et placer dans `assets/fonts/`:
- `Montserrat-Regular.ttf`
- `Montserrat-SemiBold.ttf`
- `Montserrat-Bold.ttf`

## 🎯 Lancement

### Mode développement
```bash
npm start
```

Puis:
- Scannez le QR code avec **Expo Go** (iOS/Android)
- Ou appuyez sur `i` pour iOS Simulator
- Ou appuyez sur `a` pour Android Emulator

### Build production

#### iOS (TestFlight)
```bash
eas build --platform ios
```

#### Android (APK)
```bash
eas build --platform android --profile preview
```

## 📂 Structure du Projet

```
cesame-mobile/
├── App.js                      # Point d'entrée
├── app.json                    # Config Expo
├── package.json
├── babel.config.js
│
├── src/
│   ├── components/
│   │   └── chat/
│   │       ├── MessageBubble.js    # Bulle de message
│   │       ├── MessageList.js      # Liste FlatList
│   │       └── ChatInput.js        # Input avec keyboard
│   │
│   ├── screens/
│   │   ├── LoginScreen.js          # Authentification
│   │   ├── WorkspacesScreen.js     # Liste workspaces
│   │   ├── ChatScreen.js           # Chat principal (SSE)
│   │   └── LoadingScreen.js        # Loading initial
│   │
│   ├── navigation/
│   │   └── AppNavigator.js         # React Navigation
│   │
│   ├── context/
│   │   ├── AuthContext.js          # État auth
│   │   └── ChatContext.js          # État chat
│   │
│   ├── services/
│   │   ├── api.js                  # Appels API (SSE)
│   │   └── storage.js              # AsyncStorage
│   │
│   ├── styles/
│   │   ├── colors.js               # Palette CESAME
│   │   ├── typography.js           # Montserrat
│   │   ├── spacing.js              # Espacements
│   │   └── theme.js                # Theme global
│   │
│   └── utils/
│       └── constants.js            # Constantes
│
├── assets/
│   ├── fonts/                      # Polices Montserrat
│   ├── icon.png
│   └── splash.png
│
├── docs/
│   ├── WEB_APP_ANALYSIS.md         # Analyse app web
│   └── TESTING_GUIDE.md            # Tests
│
└── _reference/
    └── web-frontend/               # Code web de référence
```

## 🎨 Design System

### Couleurs CESAME
```javascript
bgPrimary: '#FAF6F1'        // Fond beige clair
accent: '#C86A4B'           // Terracotta (principal)
accentDark: '#9E4930'       // Marron rougeâtre
textPrimary: '#3B2E29'      // Marron foncé
border: '#E8D6C7'           // Beige rosé
```

### Typographie
- **Font**: Montserrat (Regular, SemiBold, Bold)
- **Sizes**: 12-28px
- **Line heights**: 1.2-1.7

## 🔌 API Backend

L'application utilise l'API CESAME basée sur AnythingLLM.
Backend: https://github.com/geoffroybertrand/cesame-agent-ia

### Endpoints Principaux

**IMPORTANT**: Les endpoints sont sous `/api`, PAS `/api/v1`

```
POST   /api/request-token                     # Login (retourne {valid, user, token})
GET    /api/system/check-token                # Vérifier validité token
GET    /api/workspaces                        # Liste workspaces
GET    /api/workspace/:slug                   # Détails workspace
GET    /api/workspace/:slug/chats             # Historique
POST   /api/workspace/:slug/stream-chat       # Envoyer message (SSE)
GET    /api/workspace/:slug/suggested-messages # Messages suggérés
```

### Tester l'API

Utilisez le script de test fourni:
```bash
node test-api.js
```

Ce script va:
- ✅ Ping le serveur
- ✅ Tester l'authentification
- ✅ Vérifier le token
- ✅ Récupérer les workspaces
- ✅ Tester l'historique de chat

Voir `docs/API_ENDPOINTS.md` pour la documentation complète de l'API.

## 🔐 Authentification

- **Type**: Bearer Token (JWT)
- **Storage**: AsyncStorage
- **Clés**:
  - `cesame_auth_token`
  - `cesame_auth_user`

### Flow
1. User login → Receive JWT
2. Store token in AsyncStorage
3. Include token in all API requests
4. On 401 error → Clear auth → Redirect login

## 💬 Fonctionnalités Chat

### Streaming SSE
L'application utilise Server-Sent Events (SSE) comme le web:
- Connexion avec `@microsoft/fetch-event-source`
- Streaming en temps réel token par token
- Bouton stop generation
- Reconnexion automatique

### Cache Local
- Historique sauvegardé dans AsyncStorage
- Offline-first quand possible
- Synchronisation à chaque chargement

### Markdown
- Rendu avec `react-native-markdown-display`
- Support code blocks avec coloration
- Support formules (optionnel)

## 🧪 Tests

### Test sur Expo Go
1. Installer Expo Go sur votre téléphone
2. Lancer `npm start`
3. Scanner le QR code
4. Tester toutes les fonctionnalités

### Checklist Fonctionnalités
- [ ] Login avec credentials
- [ ] Affichage liste workspaces
- [ ] Sélection workspace → Chat
- [ ] Envoi message
- [ ] Réception streaming
- [ ] Affichage markdown
- [ ] Scroll automatique
- [ ] Gestion clavier (iOS/Android)
- [ ] Cache offline
- [ ] Stop generation
- [ ] Logout

## 🐛 Debugging

### Logs
```bash
# Voir les logs en temps réel
npm start

# Logs détaillés
expo start --dev-client
```

### Problèmes Courants

**1. "Connection refused" ou "Network request failed"**
- ❌ Vous utilisez `localhost` sur un appareil physique
- ✅ Solution: Utilisez votre IP locale (ex: `http://192.168.0.43:3001/api`)
- ✅ Assurez-vous que votre téléphone et ordinateur sont sur le même réseau WiFi

**2. "Invalid credentials" ou erreur 401**
- Vérifiez vos credentials (username/password)
- Testez d'abord avec le script: `node test-api.js`
- Vérifiez que le backend fonctionne: `curl http://192.168.0.43:3001/api/ping`

**3. SSE ne fonctionne pas**
- Vérifier `API_BASE_URL` dans `.env`
- Tester endpoint avec `node test-api.js`
- Vérifier les logs avec `[API]` prefix dans la console

**4. Polices ne chargent pas**
- Vérifier fichiers dans `assets/fonts/`
- Vérifier noms exacts dans App.js

**5. Performance lente**
- Activer Hermes (par défaut avec Expo)
- Limiter taille historique en cache
- Pagination messages

Pour plus de détails, consultez `TROUBLESHOOTING.md`

## 📦 Dépendances Principales

```json
{
  "expo": "~51.0.0",
  "react": "18.2.0",
  "react-native": "0.74.5",
  "@react-navigation/native": "^6.1.9",
  "@react-native-async-storage/async-storage": "1.23.1",
  "react-native-markdown-display": "^7.0.2",
  "@microsoft/fetch-event-source": "^2.0.1"
}
```

## 🚢 Déploiement

### iOS (App Store)
1. Créer compte Apple Developer
2. Configurer EAS Build
3. Build avec `eas build --platform ios`
4. Submit avec `eas submit --platform ios`

### Android (Play Store)
1. Créer compte Google Play Console
2. Build avec `eas build --platform android`
3. Submit avec `eas submit --platform android`

### Over-The-Air Updates
Expo permet des updates sans rebuild:
```bash
eas update --branch production --message "Fix bug"
```

## 📚 Documentation

- **WEB_APP_ANALYSIS.md**: Analyse complète du code web
- **API_INFO.md**: Documentation API CESAME

## 🤝 Contribution

Ce projet est basé sur le frontend web CESAME (AnythingLLM).

### Workflow
1. Fork le projet
2. Créer une branche feature
3. Commit avec messages clairs
4. Push et créer Pull Request

## 📄 Licence

Propriétaire - CESAME

---

## 🆘 Support

En cas de problème:
1. Vérifier les logs (`npm start`)
2. Consulter la documentation dans `/docs`
3. Tester l'API avec Postman
4. Clear cache: `expo start -c`

## ✨ Prochaines Étapes

Fonctionnalités futures:
- [ ] Threads de conversation
- [ ] Upload de fichiers
- [ ] Notifications push
- [ ] Mode dark
- [ ] Recherche dans historique
- [ ] Export conversations
- [ ] Text-to-Speech natif
- [ ] Speech-to-Text natif
# cesame-mobile-ia
