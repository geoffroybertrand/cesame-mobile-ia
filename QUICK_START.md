# 🚀 Guide de Démarrage Rapide - CESAME Mobile

## ⏱️ Démarrage en 5 Minutes

### 1️⃣ Vérifier le Backend (1 min)

```bash
# Tester que le backend est accessible
curl http://192.168.0.43:3001/api/ping

# ✅ Devrait retourner: {"online":true}
```

**❌ Si erreur "Connection refused":**
- Assurez-vous que le backend AnythingLLM est démarré
- Vérifiez l'IP (remplacez `192.168.0.43` par votre IP locale)

**Trouver votre IP:**
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

---

### 2️⃣ Tester l'API Complète (1 min)

```bash
# Dans le dossier cesame-mobile/
node test-api.js
```

**✅ Résultat attendu:**
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

**❌ Si le test échoue:**
- Vérifiez les credentials dans `test-api.js` (ligne 62: `testLogin('admin', 'password')`)
- Consultez `TROUBLESHOOTING.md`

---

### 3️⃣ Configurer l'Application (1 min)

```bash
# Créer le fichier .env
cp .env.example .env
```

**Éditer `.env`:**
```env
API_BASE_URL=http://192.168.0.43:3001/api
```

**⚠️ IMPORTANT:**
- **Simulateur iOS:** Utilisez `http://localhost:3001/api`
- **Appareil physique:** Utilisez votre IP locale `http://192.168.0.43:3001/api`
- Téléphone et ordinateur doivent être sur le même réseau WiFi

---

### 4️⃣ Installer les Dépendances (1 min)

```bash
# Installer les packages npm
npm install

# Ou avec yarn
yarn install
```

---

### 5️⃣ Lancer l'Application (1 min)

```bash
# Lancer Expo
npm start

# Ou avec cache clear (recommandé la première fois)
expo start -c
```

**Options:**
- Appuyez sur `i` pour iOS Simulator
- Appuyez sur `a` pour Android Emulator
- Scannez le QR code avec **Expo Go** sur votre téléphone

---

## ✅ Checklist de Vérification

Avant de lancer l'app, assurez-vous que:

- [ ] Backend est accessible (`curl http://192.168.0.43:3001/api/ping` fonctionne)
- [ ] `test-api.js` passe tous les tests
- [ ] `.env` existe et contient la bonne IP
- [ ] `npm install` terminé sans erreur
- [ ] Sur appareil physique: même réseau WiFi que l'ordinateur

---

## 📱 Utiliser l'Application

### 1. **Login**

Lancez l'app et entrez:
- **Username:** `admin` (ou votre username)
- **Password:** `password` (ou votre password)

**Logs attendus dans la console:**
```
[API] 🔐 Login attempt: { username: "admin", ... }
[API] 🔐 Login response: { valid: true, ... }
[API] ✅ Login successful, token saved
[AuthContext] ✅ Login successful, updating context
```

### 2. **Liste des Workspaces**

Après login, vous devriez voir la liste des workspaces.

**Logs attendus:**
```
[API] 📁 Fetching workspaces
[API] 📁 Workspaces received: 2
```

### 3. **Chat**

Sélectionnez un workspace et envoyez un message.

**Logs attendus:**
```
[API] 💬 Fetching chat history for: general
[API] 💬 Chat history received: 5 messages
[API] 🌊 Starting SSE stream: { slug: "general", ... }
[API] ✅ SSE connection established
[API] 📨 SSE message received: { type: "textResponse", ... }
```

---

## 🐛 Problèmes Courants

### ❌ "Network request failed"

**Cause:** Mauvaise URL dans `.env`

**Solution:**
1. Vérifiez `.env`:
   ```env
   API_BASE_URL=http://192.168.0.43:3001/api
   ```
2. Clear cache:
   ```bash
   expo start -c
   ```

### ❌ "Invalid credentials"

**Cause:** Mauvais username/password

**Solution:**
1. Testez avec curl:
   ```bash
   curl -X POST http://192.168.0.43:3001/api/request-token \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"password"}'
   ```
2. Si curl fonctionne, clear AsyncStorage dans l'app

### ❌ "Could not connect to development server"

**Cause:** Expo ne trouve pas le serveur Metro

**Solution:**
```bash
# Tuer tous les processus Node
killall node

# Relancer Expo
expo start -c
```

### ❌ SSE ne stream pas

**Cause:** Connexion SSE bloquée

**Solution:**
1. Vérifiez les logs:
   ```
   [API] 🌊 Starting SSE stream
   [API] ✅ SSE connection established
   ```
2. Si pas de `SSE connection established`, vérifiez le backend
3. Testez avec curl:
   ```bash
   TOKEN="votre_token"
   curl -X POST http://192.168.0.43:3001/api/workspace/general/stream-chat \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"message":"Test","attachments":[]}'
   ```

---

## 📚 Documentation Complète

Pour plus de détails:

- **API Endpoints:** `docs/API_ENDPOINTS.md`
- **Corrections API:** `docs/CORRECTIONS_API.md`
- **Troubleshooting:** `TROUBLESHOOTING.md`
- **Analyse Web App:** `docs/WEB_APP_ANALYSIS.md`
- **README:** `README.md`

---

## 🆘 Besoin d'Aide?

1. **Vérifier les logs** dans Metro bundler (console où vous avez lancé `npm start`)
2. **Filtrer par `[API]`** pour voir uniquement les requêtes API
3. **Consulter `TROUBLESHOOTING.md`** pour les erreurs spécifiques
4. **Tester l'API** avec `node test-api.js`

---

## ⚡ Commandes Utiles

```bash
# Lancer l'app
npm start

# Lancer avec cache clear
expo start -c

# Tester l'API
node test-api.js

# Voir les logs
# (dans Metro bundler, les logs s'affichent automatiquement)

# Build iOS
eas build --platform ios

# Build Android
eas build --platform android
```

---

**Dernière mise à jour:** 2024

**Note:** Ce guide suppose que vous avez déjà le backend AnythingLLM configuré et en cours d'exécution. Si ce n'est pas le cas, consultez la documentation du backend CESAME.
