# API Endpoints - AnythingLLM Backend

## 🔍 Base URL

```
API_BASE = /api
```

En local: `http://192.168.0.43:3001/api`

**IMPORTANT**: L'URL `/api` retourne une page HTML si accédée directement dans le navigateur. Les vrais endpoints sont sous `/api/*` et retournent du JSON.

---

## 🔐 AUTHENTIFICATION

### Request Token (Login)
```http
POST /api/request-token
```

**Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response** (Success):
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "username": "user",
    "role": "admin" | "manager" | "default"
  },
  "token": "jwt_token_here",
  "message": null
}
```

**Response** (Error):
```json
{
  "valid": false,
  "user": null,
  "token": null,
  "message": "Could not validate login."
}
```

### Check Token
```http
GET /api/system/check-token
Headers: Authorization: Bearer {token}
```

Returns: `200 OK` if valid, `401` if invalid

### SSO Simple Login
```http
GET /api/request-token/sso/simple?token={publicToken}
```

---

## 📂 WORKSPACES

### List All Workspaces
```http
GET /api/workspaces
Headers: Authorization: Bearer {token}
```

**Response**:
```json
{
  "workspaces": [
    {
      "id": 1,
      "name": "General Workspace",
      "slug": "general",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Workspace by Slug
```http
GET /api/workspace/{slug}
Headers: Authorization: Bearer {token}
```

**Response**:
```json
{
  "workspace": {
    "id": 1,
    "name": "General Workspace",
    "slug": "general",
    // ... autres propriétés
  }
}
```

### Create Workspace
```http
POST /api/workspace/new
Headers: Authorization: Bearer {token}
Body: {
  "name": "string",
  // autres options
}
```

### Update Workspace
```http
POST /api/workspace/{slug}/update
Headers: Authorization: Bearer {token}
Body: { "name": "new name", ... }
```

### Delete Workspace
```http
DELETE /api/workspace/{slug}
Headers: Authorization: Bearer {token}
```

---

## 💬 CHAT

### Get Chat History
```http
GET /api/workspace/{slug}/chats
Headers: Authorization: Bearer {token}
```

**Response**:
```json
{
  "history": [
    {
      "id": 123,
      "prompt": "User question",
      "response": "Assistant response with **markdown**",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "include": true,
      "user": {
        "id": 1,
        "username": "user"
      }
    }
  ]
}
```

### Stream Chat (SSE)
```http
POST /api/workspace/{slug}/stream-chat
Headers:
  Authorization: Bearer {token}
  Content-Type: application/json
Body: {
  "message": "User question here",
  "attachments": []
}
```

**Response**: Server-Sent Events (SSE)

Format des événements:
```
event: message
data: {"id":"uuid","type":"textResponse","textResponse":"Some ","sources":[]}

event: message
data: {"id":"uuid","type":"textResponse","textResponse":"text ","sources":[]}

event: message
data: {"id":"uuid","type":"textResponse","textResponse":"here.","sources":[],"close":true}
```

**Types d'événements**:
- `textResponse`: Morceau de texte de la réponse
- `stopGeneration`: Génération arrêtée par l'utilisateur
- `abort`: Erreur ou abandon

**Propriétés**:
- `id`: UUID du message
- `type`: Type d'événement
- `textResponse`: Texte à ajouter à la réponse
- `sources`: Sources documentaires (RAG)
- `close`: `true` quand le stream est terminé
- `error`: Message d'erreur si problème

### Chat Feedback
```http
POST /api/workspace/{slug}/chat-feedback/{chatId}
Headers: Authorization: Bearer {token}
Body: { "feedback": true | false }
```

### Delete Chats
```http
DELETE /api/workspace/{slug}/delete-chats
Headers: Authorization: Bearer {token}
Body: { "chatIds": [1, 2, 3] }
```

### Update Chat Response
```http
POST /api/workspace/{slug}/update-chat
Headers: Authorization: Bearer {token}
Body: {
  "chatId": 123,
  "newText": "Updated response"
}
```

### Delete Edited Chats
```http
DELETE /api/workspace/{slug}/delete-edited-chats
Headers: Authorization: Bearer {token}
Body: { "startingId": 123 }
```

---

## 🧵 THREADS

### List Threads
```http
GET /api/workspace/{workspaceSlug}/threads
Headers: Authorization: Bearer {token}
```

### Create Thread
```http
POST /api/workspace/{workspaceSlug}/thread/new
Headers: Authorization: Bearer {token}
Body: { "name": "Thread name" }
```

### Get Thread
```http
GET /api/workspace/{workspaceSlug}/thread/{threadSlug}
Headers: Authorization: Bearer {token}
```

### Update Thread
```http
POST /api/workspace/{workspaceSlug}/thread/{threadSlug}/update
Headers: Authorization: Bearer {token}
Body: { "name": "New name" }
```

### Delete Thread
```http
DELETE /api/workspace/{workspaceSlug}/thread/{threadSlug}
Headers: Authorization: Bearer {token}
```

### Get Thread Chat History
```http
GET /api/workspace/{workspaceSlug}/thread/{threadSlug}/chats
Headers: Authorization: Bearer {token}
```

### Stream Thread Chat
```http
POST /api/workspace/{workspaceSlug}/thread/{threadSlug}/stream-chat
Headers: Authorization: Bearer {token}
Body: { "message": "question", "attachments": [] }
```

Format SSE identique au chat workspace.

### Fork Thread
```http
POST /api/workspace/{slug}/thread/fork
Headers: Authorization: Bearer {token}
Body: {
  "threadSlug": "thread-to-fork",
  "chatId": 123
}
```

---

## 📋 MESSAGES SUGGÉRÉS

### Get Suggested Messages
```http
GET /api/workspace/{slug}/suggested-messages
Headers: Authorization: Bearer {token}
```

**Response**:
```json
{
  "suggestedMessages": [
    {
      "heading": "Question rapide",
      "message": "Explique-moi..."
    }
  ]
}
```

### Set Suggested Messages
```http
POST /api/workspace/{slug}/suggested-messages
Headers: Authorization: Bearer {token}
Body: {
  "messages": [
    { "heading": "...", "message": "..." }
  ]
}
```

---

## 📤 FICHIERS

### Upload File
```http
POST /api/workspace/{slug}/upload
Headers: Authorization: Bearer {token}
Body: FormData with file
Query params: ?extractTextOnly=true (optional)
```

### Upload Link
```http
POST /api/workspace/{slug}/upload-link
Headers: Authorization: Bearer {token}
Body: { "link": "https://..." }
```

### Upload and Embed
```http
POST /api/workspace/{slug}/upload-and-embed
Headers: Authorization: Bearer {token}
Body: FormData
```

### Delete and Unembed
```http
DELETE /api/workspace/{slug}/remove-and-unembed
Headers: Authorization: Bearer {token}
Body: { "documentLocation": "path/to/doc" }
```

---

## 🖼️ IMAGES

### Upload Workspace Profile Picture
```http
POST /api/workspace/{slug}/upload-pfp
Headers: Authorization: Bearer {token}
Body: FormData
```

### Get Workspace Profile Picture
```http
GET /api/workspace/{slug}/pfp
Headers: Authorization: Bearer {token}
```

Returns: Blob (image)

### Remove Profile Picture
```http
DELETE /api/workspace/{slug}/remove-pfp
Headers: Authorization: Bearer {token}
```

### Get Logo
```http
GET /api/system/logo?theme=default|light|dark
```

Returns: Blob (image)

---

## ⚙️ SYSTEM

### Ping
```http
GET /api/ping
```

Returns: `{ "online": true }`

### Setup Check
```http
GET /api/setup-complete
```

### System Keys
```http
GET /api/system/system-vectors?slug={workspaceSlug}
Headers: Authorization: Bearer {token}
```

### Multi-User Mode
```http
GET /api/system/multi-user-mode
Headers: Authorization: Bearer {token}
```

### Update User
```http
POST /api/system/user
Headers: Authorization: Bearer {token}
Body: { username, email, ... }
```

### Delete Account
```http
DELETE /api/system/delete-account
Headers: Authorization: Bearer {token}
```

### Forgot Password
```http
POST /api/system/forgot-password
Headers: Authorization: Bearer {token}
Body: { "email": "user@example.com" }
```

### Reset Password
```http
POST /api/system/reset-password
Headers: Authorization: Bearer {token}
Body: {
  "token": "reset_token",
  "newPassword": "...",
  "confirmPassword": "..."
}
```

---

## 👥 ADMIN

### List Users
```http
GET /api/admin/users
Headers: Authorization: Bearer {token}
```

### List Admin Workspaces
```http
GET /api/admin/workspaces
Headers: Authorization: Bearer {token}
```

### Create Admin Workspace
```http
POST /api/admin/workspaces/new
Headers: Authorization: Bearer {token}
Body: { name, ... }
```

---

## 🔑 HEADERS REQUIS

Tous les endpoints authentifiés nécessitent:

```javascript
{
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json' // Pour les requêtes avec body JSON
}
```

---

## 🚨 CODES D'ERREUR

- `200`: Success
- `204`: No Content (succès sans données)
- `401`: Non authentifié (token invalide/expiré)
- `403`: Pas de permission
- `404`: Ressource non trouvée
- `429`: Rate limit atteint
- `500`: Erreur serveur

---

## 📝 NOTES IMPORTANTES

1. **Base URL**: Toujours `/api` et NON `/api/v1`
2. **Token**: JWT Bearer Token dans le header Authorization
3. **SSE**: Le streaming utilise Server-Sent Events, pas WebSocket
4. **Slug**: Les workspaces sont identifiés par leur `slug`, pas leur `id`
5. **Cache**: Les tokens sont stockés dans localStorage (web) ou AsyncStorage (mobile)

---

## 🧪 TESTER L'API

### Avec cURL

```bash
# Test login
curl -X POST http://192.168.0.43:3001/api/request-token \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Test get workspaces
curl http://192.168.0.43:3001/api/workspaces \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Test chat history
curl http://192.168.0.43:3001/api/workspace/general/chats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Avec Postman/Insomnia

1. Créer requête POST vers `/api/request-token`
2. Body JSON: `{"username":"admin","password":"password"}`
3. Copier le `token` de la réponse
4. Utiliser ce token dans les headers des autres requêtes

---

## 📱 IMPLÉMENTATION MOBILE

Voir `src/services/api.js` pour l'implémentation React Native complète.

Points clés:
- Utiliser `@microsoft/fetch-event-source` pour SSE
- Stocker token dans AsyncStorage
- Gérer reconnexion automatique
- Parser chaque événement SSE en JSON
