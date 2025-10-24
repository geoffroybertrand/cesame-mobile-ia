# 🔧 Guide de Dépannage - CESAME Mobile

Ce guide vous aide à résoudre les problèmes courants lors du développement et de l'utilisation de l'application mobile CESAME.

## 📋 Table des Matières

1. [Problèmes de Connexion API](#problèmes-de-connexion-api)
2. [Problèmes d'Authentification](#problèmes-dauthentification)
3. [Problèmes de Streaming (SSE)](#problèmes-de-streaming-sse)
4. [Problèmes d'Interface](#problèmes-dinterface)
5. [Problèmes de Performance](#problèmes-de-performance)
6. [Outils de Diagnostic](#outils-de-diagnostic)

---

## 🌐 Problèmes de Connexion API

### ❌ Erreur: "Network request failed" ou "Connection refused"

**Symptômes:**
- L'app ne peut pas se connecter au backend
- Erreur dans la console: `TypeError: Network request failed`
- Timeout après quelques secondes

**Causes possibles:**

#### 1. Vous utilisez `localhost` sur un appareil physique

**❌ Mauvais:**
```env
API_BASE_URL=http://localhost:3001/api
```

**✅ Correct:**
```env
API_BASE_URL=http://192.168.0.43:3001/api
```

**Solution:**
1. Trouvez votre IP locale:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. Mettez à jour `.env`:
   ```env
   API_BASE_URL=http://<VOTRE_IP>:3001/api
   ```

3. Redémarrez l'application:
   ```bash
   expo start -c
   ```

#### 2. Backend non accessible depuis le réseau local

**Vérification:**
```bash
# Sur votre ordinateur, testez si le backend écoute sur toutes les interfaces
netstat -an | grep 3001
```

**Solution:**
Le backend doit écouter sur `0.0.0.0:3001` et non `127.0.0.1:3001`.

Vérifiez la configuration du backend AnythingLLM.

#### 3. Firewall bloque la connexion

**Solution macOS:**
```bash
# Autoriser les connexions entrantes sur le port 3001
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /path/to/backend
```

**Solution Windows:**
Ajoutez une règle dans Windows Defender Firewall pour autoriser le port 3001.

---

### ❌ Erreur: "Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON"

**Symptômes:**
- L'API retourne du HTML au lieu de JSON
- Erreur de parsing JSON

**Cause:**
Vous accédez à `/api` directement au lieu d'un endpoint spécifique.

**Explication:**
- `/api` → Retourne une page HTML (normal)
- `/api/ping` → Retourne du JSON (correct)
- `/api/request-token` → Retourne du JSON (correct)

**Solution:**
Vérifiez que votre code appelle les bons endpoints. Utilisez le script de test:
```bash
node test-api.js
```

---

## 🔐 Problèmes d'Authentification

### ❌ Erreur: "Invalid credentials" ou "Could not validate login"

**Vérification 1: Backend accessible**
```bash
# Testez le ping
curl http://192.168.0.43:3001/api/ping

# Devrait retourner: {"online":true}
```

**Vérification 2: Credentials corrects**
```bash
# Testez le login manuellement
curl -X POST http://192.168.0.43:3001/api/request-token \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

**Réponse attendue:**
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": null
}
```

**Solution:**
1. Vérifiez que vous utilisez les bons credentials
2. Consultez les logs du backend
3. Assurez-vous que le user existe dans la base de données

---

### ❌ Erreur 401: "Unauthorized" après login réussi

**Symptômes:**
- Login fonctionne
- Les requêtes suivantes retournent 401

**Cause:**
Token non envoyé ou mal formaté dans les headers.

**Vérification dans le code:**

Vérifiez `src/services/api.js`:
```javascript
async getHeaders(additionalHeaders = {}) {
  const token = await StorageService.getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...additionalHeaders,
  };
}
```

**Logs à vérifier:**
```
[API] 🔐 Login successful, token saved
[API] 📁 Fetching workspaces
[API] ❌ HTTP 401
```

Si vous voyez 401 après un login réussi:
1. Vérifiez que le token est bien sauvegardé dans AsyncStorage
2. Vérifiez que le header `Authorization: Bearer <token>` est bien envoyé
3. Testez le token avec curl:
   ```bash
   TOKEN="votre_token_ici"
   curl http://192.168.0.43:3001/api/workspaces \
     -H "Authorization: Bearer $TOKEN"
   ```

**Solution:**
Clear le cache AsyncStorage:
```javascript
// Dans l'app, ou via React Native Debugger
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.clear();
```

---

## 🌊 Problèmes de Streaming (SSE)

### ❌ SSE ne se connecte pas

**Symptômes:**
- Message envoyé mais pas de réponse
- Loading infini
- Erreur: "SSE connection failed"

**Vérification 1: URL correcte**

Dans les logs, vérifiez:
```
[API] 🌊 Starting SSE stream: {
  slug: "general",
  url: "http://192.168.0.43:3001/api/workspace/general/stream-chat"
}
```

**Vérification 2: Headers corrects**

Le header `Authorization` doit être présent.

**Vérification 3: Test manuel**

Testez l'endpoint SSE avec curl:
```bash
TOKEN="votre_token_ici"
curl -X POST http://192.168.0.43:3001/api/workspace/general/stream-chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Test","attachments":[]}'
```

Vous devriez voir des événements SSE streamer en temps réel.

**Solution:**
1. Assurez-vous que `@microsoft/fetch-event-source` est installé
2. Vérifiez que vous n'avez pas de proxy qui bloque SSE
3. Sur certains réseaux d'entreprise, SSE peut être bloqué

---

### ❌ SSE se déconnecte après quelques secondes

**Cause:**
Timeout réseau ou problème de keep-alive.

**Solution:**

Modifiez `src/services/api.js`:
```javascript
await fetchEventSource(url, {
  method: 'POST',
  headers,
  body: JSON.stringify({ message, attachments: [] }),
  signal,
  openWhenHidden: true,

  // Ajoutez ces options:
  heartbeatTimeout: 60000,  // 60 secondes

  // ...reste du code
});
```

---

## 🎨 Problèmes d'Interface

### ❌ Polices Montserrat ne chargent pas

**Symptômes:**
- Texte affiché avec police système par défaut
- Warning dans les logs: "Font 'Montserrat-Regular' is not loaded"

**Solution:**

1. Vérifiez que les fichiers existent:
   ```bash
   ls -la assets/fonts/
   # Devrait afficher:
   # Montserrat-Regular.ttf
   # Montserrat-SemiBold.ttf
   # Montserrat-Bold.ttf
   ```

2. Vérifiez les noms dans `App.js`:
   ```javascript
   const [fontsLoaded] = useFonts({
     'Montserrat-Regular': require('./assets/fonts/Montserrat-Regular.ttf'),
     'Montserrat-SemiBold': require('./assets/fonts/Montserrat-SemiBold.ttf'),
     'Montserrat-Bold': require('./assets/fonts/Montserrat-Bold.ttf'),
   });
   ```

3. Clear le cache et redémarrez:
   ```bash
   expo start -c
   ```

---

### ❌ Clavier cache l'input sur Android

**Symptômes:**
- Input non visible quand clavier ouvert
- Scroll ne fonctionne pas

**Solution:**

Dans `src/screens/ChatScreen.js`, assurez-vous d'utiliser `KeyboardAvoidingView`:

```javascript
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
>
  {/* Votre contenu */}
</KeyboardAvoidingView>
```

---

### ❌ Markdown ne s'affiche pas correctement

**Symptômes:**
- Code blocks non formatés
- Liens non cliquables
- Styles manquants

**Solution:**

Vérifiez la configuration dans `src/components/chat/MessageBubble.js`:

```javascript
import Markdown from 'react-native-markdown-display';

<Markdown
  style={{
    body: { color: colors.textPrimary },
    code_inline: {
      backgroundColor: '#F5F5F5',
      fontFamily: 'Courier',
      fontSize: 13,
      padding: 4,
      borderRadius: 4,
    },
    fence: {
      backgroundColor: '#F5F5F5',
      borderRadius: 8,
      padding: 12,
    },
  }}
>
  {message.content}
</Markdown>
```

---

## ⚡ Problèmes de Performance

### ❌ Scroll lent avec beaucoup de messages

**Solution 1: Limiter l'historique**

Dans `src/screens/ChatScreen.js`:
```javascript
// Limiter à 50 messages
const limitedHistory = chatHistory.slice(-50);
```

**Solution 2: Optimiser FlatList**

```javascript
<FlatList
  data={messages}
  renderItem={renderMessage}
  keyExtractor={(item) => item.id.toString()}

  // Optimisations:
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  initialNumToRender={20}
  windowSize={10}

  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT, // Hauteur fixe si possible
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

---

### ❌ App lente au démarrage

**Causes:**
- Trop de données en cache
- Polices lourdes
- Images non optimisées

**Solution:**

1. Clear le cache:
   ```javascript
   import AsyncStorage from '@react-native-async-storage/async-storage';

   // Limiter la taille du cache
   const MAX_CACHE_SIZE = 100; // 100 messages max
   ```

2. Lazy load des composants:
   ```javascript
   const ChatScreen = React.lazy(() => import('./screens/ChatScreen'));
   ```

---

## 🛠️ Outils de Diagnostic

### 1. Script de Test API

**Usage:**
```bash
node test-api.js
```

**Ce qu'il teste:**
- ✅ Ping serveur
- ✅ Login
- ✅ Validation token
- ✅ Liste workspaces
- ✅ Détails workspace
- ✅ Historique chat
- ✅ Messages suggérés

**Résultat attendu:**
```
🚀 ============================================================
🚀 CESAME Mobile - API Test Suite
🚀 ============================================================

🏓 Testing server ping...
✅ Server is online!

🔐 Testing login with username: admin...
✅ Login successful!
👤 User: admin (admin)
🔑 Token: eyJhbGciOiJIUzI1NiI...

📊 ============================================================
📊 Test Summary
📊 ============================================================

ℹ️  Total tests: 7
✅ Passed: 7

🎉 All tests passed! API is working correctly.
```

---

### 2. Logs de Debug

L'application contient des logs détaillés préfixés par `[API]`.

**Activer les logs:**
Les logs sont déjà activés dans `src/services/api.js`.

**Filtrer les logs:**
```bash
# Dans Metro bundler
# Tapez 'j' pour ouvrir Chrome DevTools

# Filtrez par "[API]" pour voir uniquement les logs API
```

**Exemples de logs:**
```
[API] 🔐 Login attempt: { username: "admin", url: "http://..." }
[API] 🔐 Login response: { valid: true, hasToken: true, hasUser: true }
[API] ✅ Login successful, token saved
[API] 📁 Fetching workspaces
[API] 📁 Workspaces received: 2
[API] 🌊 Starting SSE stream: { slug: "general", ... }
[API] ✅ SSE connection established
[API] 📨 SSE message received: { type: "textResponse", hasText: true }
```

---

### 3. React Native Debugger

**Installation:**
```bash
brew install --cask react-native-debugger
```

**Usage:**
1. Lancez React Native Debugger
2. Dans l'app, secouez l'appareil (ou Cmd+D sur simulateur)
3. Sélectionnez "Debug"
4. Inspectez:
   - Network requests
   - AsyncStorage
   - Redux state (si utilisé)
   - Console logs

---

### 4. Postman / Insomnia

Utilisez Postman pour tester les endpoints manuellement.

**Collection Postman:**

1. **Ping**
   ```
   GET http://192.168.0.43:3001/api/ping
   ```

2. **Login**
   ```
   POST http://192.168.0.43:3001/api/request-token
   Headers: Content-Type: application/json
   Body: {"username":"admin","password":"password"}
   ```

3. **Get Workspaces**
   ```
   GET http://192.168.0.43:3001/api/workspaces
   Headers: Authorization: Bearer <TOKEN>
   ```

---

### 5. Expo DevTools

**Usage:**
```bash
expo start
# Appuyez sur 'd' pour ouvrir DevTools
```

**Fonctionnalités:**
- Voir les logs
- Recharger l'app
- Toggle performance monitor
- Activer/désactiver fast refresh

---

## 📞 Besoin d'Aide Supplémentaire?

### Checklist de Debug

Avant de demander de l'aide, vérifiez:

- [ ] Backend est accessible (`curl http://192.168.0.43:3001/api/ping`)
- [ ] Credentials sont corrects (testez avec `test-api.js`)
- [ ] `.env` contient la bonne IP (pas `localhost` sur appareil physique)
- [ ] Téléphone et ordinateur sur même réseau WiFi
- [ ] Cache Expo cleared (`expo start -c`)
- [ ] AsyncStorage cleared
- [ ] Logs `[API]` vérifiés dans la console
- [ ] Postman/curl test réussi
- [ ] Backend logs consultés

### Informations à Fournir

Quand vous demandez de l'aide, incluez:

1. **Environnement:**
   - OS: iOS/Android
   - Version: XX
   - Simulator ou appareil physique
   - Expo version

2. **Logs:**
   - Logs complets de la console
   - Logs du backend
   - Screenshot de l'erreur

3. **Configuration:**
   - Contenu de `.env` (sans credentials)
   - Commande utilisée pour lancer l'app

4. **Tests effectués:**
   - Résultat de `node test-api.js`
   - Résultat de `curl` tests
   - Autres debug tentés

---

## 🔗 Ressources

- [Documentation Expo](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [AnythingLLM Docs](https://docs.anythingllm.com/)
- [API Endpoints Documentation](docs/API_ENDPOINTS.md)
- [Web App Analysis](docs/WEB_APP_ANALYSIS.md)

---

**Dernière mise à jour:** 2024
