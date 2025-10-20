# Système de Permissions

## 📋 Niveaux de Permission

Le système utilise 3 niveaux de permissions hiérarchiques :

| Niveau | Nom    | Valeur | Description |
|--------|--------|--------|-------------|
| 0      | USER   | 0      | Utilisateur standard |
| 1      | PNJ    | 1      | Organisateur / PNJ (peut donner des énigmes) |
| 2      | ADMIN  | 2      | Administrateur (accès complet) |

## 🔐 Middlewares Disponibles

### Authentification de base
- `verifyToken` - Vérifie le JWT et attache l'utilisateur à la requête
- `publicRoute` - Route accessible sans authentification

### Par niveau de permission
- `requireAuth` - Nécessite d'être connecté (permission >= 0)
- `requirePNJ` - Nécessite permission PNJ ou supérieure (permission >= 1)
- `requireAdmin` - Nécessite permission Admin (permission = 2)

### Personnalisé
- `requirePermission(level)` - Créer un middleware pour un niveau spécifique
  - `level = null` : Route publique
  - `level = 0` : USER
  - `level = 1` : PNJ
  - `level = 2` : ADMIN

## 🛣️ Utilisation dans les Routes

### Exemple 1: Route publique
```typescript
router.get("/public", publicRoute, (req, res) => {
	res.json({ message: "Accessible par tous" });
});
```

### Exemple 2: Route utilisateur authentifié
```typescript
router.get("/profile", requireAuth, (req: AuthenticatedRequest, res) => {
	res.json({ user: req.user });
});
```

### Exemple 3: Route PNJ
```typescript
router.post("/enigma", requirePNJ, (req: AuthenticatedRequest, res) => {
	// Seuls les PNJ et admins peuvent accéder
	res.json({ message: "Énigme créée" });
});
```

### Exemple 4: Route Admin
```typescript
router.patch("/users/:id/permission", requireAdmin, async (req, res) => {
	// Seuls les admins peuvent modifier les permissions
});
```

## 🔄 Type AuthenticatedRequest

Quand une route utilise un middleware d'authentification, utilisez le type `AuthenticatedRequest` :

```typescript
import { AuthenticatedRequest } from "../middlewares/auth";

router.get("/route", requireAuth, (req: AuthenticatedRequest, res) => {
	// req.user est disponible et typé
	const userId = req.user?.id;
	const permission = req.user?.permission;
});
```

## 📡 Routes API Disponibles

### Routes de Test
- `GET /api/test/public` - Route publique
- `GET /api/test/user` - Nécessite authentification
- `GET /api/test/pnj` - Nécessite permission PNJ
- `GET /api/test/admin` - Nécessite permission Admin

### Routes Utilisateurs
- `GET /api/users/me` - Obtenir ses propres informations (authentifié)
- `PATCH /api/users/:id42/permission` - Modifier la permission d'un utilisateur (admin uniquement)

## 🔧 Modifier les Permissions d'un Utilisateur

Pour donner la permission PNJ à un utilisateur :

```bash
curl -X PATCH http://localhost:3001/api/users/123456/permission \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{"permission": 1}'
```

Pour donner la permission Admin :

```bash
curl -X PATCH http://localhost:3001/api/users/123456/permission \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{"permission": 2}'
```

## 🗃️ Base de Données

La colonne `permission` a été ajoutée à la table `users` :

```sql
ALTER TABLE users ADD COLUMN permission INTEGER DEFAULT 0;
```

Par défaut, tous les nouveaux utilisateurs ont la permission `USER` (0).

## ⚠️ Important

- Les permissions sont **hiérarchiques** : un admin peut accéder aux routes PNJ et USER
- Un PNJ peut accéder aux routes USER
- Les utilisateurs ne peuvent accéder qu'aux routes USER
- Les routes publiques sont accessibles sans authentification

## 🧪 Tests

Pour tester les permissions, utilisez les routes de test :

1. Connectez-vous via `/api/auth`
2. Testez `/api/test/user` - devrait fonctionner
3. Testez `/api/test/pnj` - devrait échouer (403)
4. Demandez à un admin de modifier votre permission
5. Re-testez les routes protégées
