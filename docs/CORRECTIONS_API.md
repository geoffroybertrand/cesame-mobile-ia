# 🔧 Corrections API - CESAME Mobile

## 📋 Résumé des Corrections

Suite à l'analyse approfondie du code web de référence, plusieurs corrections critiques ont été apportées pour assurer la connexion correcte à l'API AnythingLLM.

**Date:** 2024
**Problème initial:** L'application mobile ne se connectait pas correctement à l'API backend.

---

## 🎯 Corrections Principales

### 1. ✅ Endpoint d'Authentification Corrigé

**Avant (incorrect):**
```javascript
// src/services/api.js
async login(username, password) {
  const response = await this.post('/auth/login', { username, password });
  if (response.success && response.token) { ... }
}
```

**Après (correct):**
```javascript
// src/services/api.js
async login(username, password) {
  const response = await this.post('/request-token', { username, password });
  // Le backend retourne { valid, user, token, message }
  if (response.valid && response.token) { ... }
}
```

**Raison:**
Le backend AnythingLLM utilise `/api/request-token` et non `/api/auth/login`.
Le format de réponse est `{valid, user, token, message}` et non `{success, token, user}`.

**Référence:**
- `_reference/web-frontend/src/models/system.js:6-12`
- `docs/API_ENDPOINTS.md:18-42`

---

### 2. ✅ Format de Réponse d'Authentification

**AuthContext.js corrigé:**

```javascript
// src/context/AuthContext.js
const login = async (username, password) => {
  const response = await ApiService.login(username, password);

  // Correction: vérifier response.valid au lieu de response.success
  if (response.valid && response.token) {
    setAuthToken(response.token);
    setUser(response.user);
    setIsAuthenticated(true);
    return { success: true };
  }

  return { success: false, error: response.message || 'Login failed' };
};
```

---

### 3. ✅ Ajout de l'Endpoint Check Token

**Nouvel endpoint ajouté:**
```javascript
// src/services/api.js
async checkToken() {
  try {
    await this.get('/system/check-token');
    return true;
  } catch (error) {
    return false;
  }
}
```

**Usage:**
Permet de vérifier si un token stocké est toujours valide au démarrage de l'app.

**Référence:**
- `docs/API_ENDPOINTS.md:54-60`

---

### 4. ✅ Configuration .env.example Améliorée

**Avant:**
```env
API_BASE_URL=https://your-domain.com/api
```

**Après:**
```env
# IMPORTANT: Utilisez votre IP locale pour tester sur appareil physique
# Format: http://<votre-ip>:3001/api
#
# Exemples:
# - Simulateur iOS: http://localhost:3001/api
# - Appareil physique: http://192.168.0.43:3001/api (remplacez par votre IP)
# - Production: https://your-domain.com/api

API_BASE_URL=http://192.168.0.43:3001/api
```

**Raison:**
Clarifier la différence entre `localhost` (simulateur) et IP locale (appareil physique).

---

### 5. ✅ Ajout de Logs de Debug Détaillés

**Logs ajoutés dans api.js:**

```javascript
// Login
console.log('[API] 🔐 Login attempt:', { username, url });
console.log('[API] 🔐 Login response:', { valid, hasToken, hasUser });
console.log('[API] ✅ Login successful, token saved');

// Workspaces
console.log('[API] 📁 Fetching workspaces');
console.log('[API] 📁 Workspaces received:', count);

// Chat
console.log('[API] 💬 Fetching chat history for:', slug);
console.log('[API] 💬 Chat history received:', count);

// SSE
console.log('[API] 🌊 Starting SSE stream:', { slug, url });
console.log('[API] ✅ SSE connection established');
console.log('[API] 📨 SSE message received:', { type, hasText, close });
```

**Avantages:**
- Facilite le debug
- Permet de suivre le flow des requêtes
- Identifie rapidement où une erreur se produit

---

### 6. ✅ Script de Test API Créé

**Nouveau fichier:** `test-api.js`

**Usage:**
```bash
node test-api.js
```

**Ce qu'il teste:**
1. ✅ Ping du serveur (`/api/ping`)
2. ✅ Login (`/api/request-token`)
3. ✅ Validation du token (`/api/system/check-token`)
4. ✅ Liste des workspaces (`/api/workspaces`)
5. ✅ Détails d'un workspace (`/api/workspace/:slug`)
6. ✅ Historique de chat (`/api/workspace/:slug/chats`)
7. ✅ Messages suggérés (`/api/workspace/:slug/suggested-messages`)

**Sortie attendue:**
```
🚀 CESAME Mobile - API Test Suite

🏓 Testing server ping...
✅ Server is online!

🔐 Testing login with username: admin...
✅ Login successful!

📊 Test Summary
✅ Passed: 7/7
🎉 All tests passed! API is working correctly.
```

---

## 📝 Documentation Créée

### 1. `docs/API_ENDPOINTS.md`

Documentation complète de tous les endpoints API AnythingLLM:
- ✅ Authentification
- ✅ Workspaces
- ✅ Chat et historique
- ✅ Streaming SSE
- ✅ Threads
- ✅ Messages suggérés
- ✅ Fichiers
- ✅ System

**Total:** 50+ endpoints documentés avec exemples curl.

### 2. `TROUBLESHOOTING.md`

Guide de dépannage complet:
- 🌐 Problèmes de connexion API
- 🔐 Problèmes d'authentification
- 🌊 Problèmes de streaming SSE
- 🎨 Problèmes d'interface
- ⚡ Problèmes de performance
- 🛠️ Outils de diagnostic

### 3. `README.md` mis à jour

Sections ajoutées/modifiées:
- Instructions de configuration avec IP locale
- Section "Tester l'API" avec `test-api.js`
- Endpoints corrigés dans la documentation
- Nouveaux problèmes courants

---

## 🔍 Analyse Effectuée

### Fichiers Web Analysés

1. **`_reference/web-frontend/src/models/system.js`**
   - Endpoint auth: `/request-token` ✅
   - Format réponse: `{valid, user, token, message}` ✅

2. **`_reference/web-frontend/src/models/workspace.js`**
   - Endpoints workspaces ✅
   - Format SSE streaming ✅

3. **`_reference/web-frontend/src/utils/constants.js`**
   - Base URL: `/api` (pas `/api/v1`) ✅

4. **`_reference/web-frontend/src/utils/request.js`**
   - Headers format: `Authorization: Bearer <token>` ✅

5. **`_reference/web-frontend/src/pages/WorkspaceChat/index.jsx`**
   - Flow de chargement workspace ✅

6. **`_reference/web-frontend/src/components/ChatBubble/index.jsx`**
   - Rendu markdown ✅

---

## ✅ Checklist des Corrections

- [x] Endpoint login corrigé: `/auth/login` → `/request-token`
- [x] Format réponse corrigé: `response.success` → `response.valid`
- [x] Endpoint check-token ajouté
- [x] Logs de debug ajoutés partout
- [x] `.env.example` clarifié avec IP locale
- [x] Script `test-api.js` créé
- [x] Documentation `API_ENDPOINTS.md` créée
- [x] Documentation `TROUBLESHOOTING.md` créée
- [x] `README.md` mis à jour
- [x] `AuthContext.js` corrigé

---

## 🧪 Tests à Effectuer

### 1. Test Backend
```bash
# Vérifier que le backend est accessible
curl http://192.168.0.43:3001/api/ping

# Devrait retourner: {"online":true}
```

### 2. Test Authentication
```bash
# Tester le login
curl -X POST http://192.168.0.43:3001/api/request-token \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Devrait retourner: {"valid":true,"user":{...},"token":"..."}
```

### 3. Test Script Automatique
```bash
# Lancer le script de test
node test-api.js

# Devrait afficher: 🎉 All tests passed!
```

### 4. Test Application Mobile
```bash
# Créer le fichier .env
cp .env.example .env

# Éditer avec votre IP
nano .env

# Clear cache et lancer
expo start -c
```

**Dans l'app:**
1. Taper username/password
2. Vérifier logs dans console:
   ```
   [API] 🔐 Login attempt: { username: "admin", ... }
   [API] 🔐 Login response: { valid: true, ... }
   [API] ✅ Login successful, token saved
   [AuthContext] ✅ Login successful, updating context
   [API] 📁 Fetching workspaces
   [API] 📁 Workspaces received: 2
   ```
3. Sélectionner un workspace
4. Envoyer un message
5. Vérifier le streaming SSE fonctionne

---

## 🎯 Résultat Attendu

Après ces corrections, l'application devrait:

1. ✅ Se connecter correctement au backend
2. ✅ Login fonctionnel avec les credentials corrects
3. ✅ Token sauvegardé et utilisé dans toutes les requêtes
4. ✅ Liste des workspaces affichée
5. ✅ Historique de chat chargé
6. ✅ Streaming SSE fonctionnel pour les nouveaux messages
7. ✅ Logs de debug clairs et informatifs

---

## 📚 Références

- **API Backend:** AnythingLLM
- **Code Web:** `_reference/web-frontend/`
- **Documentation API:** `docs/API_ENDPOINTS.md`
- **Guide Web:** `docs/WEB_APP_ANALYSIS.md`
- **Troubleshooting:** `TROUBLESHOOTING.md`

---

## 🔄 Prochaines Étapes

1. **Tester l'application** avec les corrections
2. **Vérifier tous les logs** dans la console
3. **Utiliser `test-api.js`** pour valider le backend
4. **Consulter `TROUBLESHOOTING.md`** en cas de problème
5. **Adapter l'IP** dans `.env` selon votre réseau

---

**Note:** Ces corrections sont basées sur l'analyse complète du code web de référence et suivent exactement la même logique que l'application web fonctionnelle.
