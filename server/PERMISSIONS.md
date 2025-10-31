# 🔐 Système de Permissions - Guide Complet

## ✅ Ce qui a été implémenté

### 1. **Enum de Permissions** (`database.ts`)
```typescript
export enum UserPermission {
	USER = 0,   // Utilisateur standard
	PNJ = 1,    // Organisateur / PNJ
	ADMIN = 2   // Administrateur
}
```

### 2. **Colonne Permission dans la table Users**
- Colonne `permission` ajoutée avec valeur par défaut `0` (USER)
- Migration automatique disponible via `npm run migrate`

### 3. **Middlewares d'Authentification** (`middlewares/auth.ts`)

#### Middlewares de base :
- `verifyToken` - Vérifie le JWT et charge l'utilisateur
- `requirePermission(level)` - Factory pour créer des middlewares personnalisés

#### Middlewares prêts à l'emploi :
- `publicRoute` - Route publique (null permission)
- `requireAuth` - User ou supérieur (permission >= 0)
- `requirePNJ` - PNJ ou Admin (permission >= 1)
- `requireAdmin` - Admin uniquement (permission = 2)

### 4. **Routes de Test** (`routes/test.ts`)
Exemples de routes avec différents niveaux de permissions :
- `GET /api/test/public` - Publique
- `GET /api/test/user` - Authentifié
- `GET /api/test/pnj` - PNJ+
- `GET /api/test/admin` - Admin

### 5. **Routes Utilisateurs** (`routes/users.ts`)
- `GET /api/users/me` - Informations utilisateur actuel
- `PATCH /api/users/:id42/permission` - Modifier permission (admin)

### 6. **Broadcast Admin Messages** (`routes/events.ts`)
- `POST /api/events/broadcast` - Envoyer un message admin à tous les sockets connectés. Corps attendu : `{ title: string, subtitle?: string, content: string }`. `subtitle` est optionnel (par défaut le timestamp sera utilisé).
- `POST /api/events/broadcast/:id` - Envoyer un message admin à un utilisateur spécifique. Corps attendu identique.

### 6. **Type AuthenticatedRequest**
Type TypeScript pour accéder aux infos utilisateur dans les routes :
```typescript
interface AuthenticatedRequest extends Request {
	user?: {
		id: number;
		permission: UserPermission;
	};
}
```

## 🚀 Utilisation

### Dans une route

```typescript
import { requireAuth, requirePNJ, requireAdmin, AuthenticatedRequest } from "../middlewares/auth";

// Route publique
router.get("/public", (req, res) => {
	res.json({ message: "Public" });
});

// Route utilisateur
router.get("/profile", requireAuth, (req: AuthenticatedRequest, res) => {
	const userId = req.user!.id;
	res.json({ userId });
});

// Route PNJ
router.post("/enigma", requirePNJ, (req: AuthenticatedRequest, res) => {
	// Créer une énigme
});

// Route Admin
router.delete("/user/:id", requireAdmin, (req: AuthenticatedRequest, res) => {
	// Supprimer un utilisateur
});
```

### Vérification manuelle dans le contrôleur

```typescript
router.get("/something", verifyToken, (req: AuthenticatedRequest, res) => {
	if (req.user!.permission < UserPermission.PNJ) {
		return res.status(403).json({ error: "PNJ required" });
	}
	// ...
});
```

## 🗃️ Base de Données

### Migration
Si vous avez déjà des utilisateurs dans votre base de données :
```bash
npm run migrate
```

### Nouvelle installation
La colonne sera créée automatiquement au démarrage du serveur.

## 🔧 Gestion des Permissions

### Promouvoir un utilisateur en PNJ
```bash
curl -X PATCH http://localhost:3001/api/users/123456/permission \
  -H "Content-Type: application/json" \
  -H "Cookie: token=ADMIN_JWT_TOKEN" \
  -d '{"permission": 1}'
```

### Promouvoir en Admin
```bash
curl -X PATCH http://localhost:3001/api/users/123456/permission \
  -H "Content-Type: application/json" \
  -H "Cookie: token=ADMIN_JWT_TOKEN" \
  -d '{"permission": 2}'
```

### Premier Admin
Pour créer le premier admin, vous devrez modifier directement la base de données :
```bash
sqlite3 database.db "UPDATE users SET permission = 2 WHERE id42 = YOUR_ID42;"
```

## 📊 Hiérarchie des Permissions

```
ADMIN (2)
  ├─ Accès à toutes les routes admin
  ├─ Accès à toutes les routes PNJ
  └─ Accès à toutes les routes user

PNJ (1)
  ├─ Accès à toutes les routes PNJ
  └─ Accès à toutes les routes user

USER (0)
  └─ Accès aux routes user uniquement

PUBLIC (null)
  └─ Accessible sans authentification
```

## 🧪 Tests

### 1. Se connecter
```
GET http://localhost:3001/api/auth
```

### 2. Tester route user (devrait marcher)
```
GET http://localhost:3001/api/test/user
Cookie: token=YOUR_JWT
```

### 3. Tester route PNJ (devrait échouer avec 403)
```
GET http://localhost:3001/api/test/pnj
Cookie: token=YOUR_JWT
```

### 4. Se promouvoir (nécessite un admin existant)
```
PATCH http://localhost:3001/api/users/YOUR_ID42/permission
Cookie: token=ADMIN_JWT
Body: {"permission": 1}
```

### 5. Re-tester route PNJ (devrait marcher)
```
GET http://localhost:3001/api/test/pnj
Cookie: token=YOUR_JWT
```

## 📁 Fichiers Créés/Modifiés

### Nouveaux fichiers :
- ✅ `src/middlewares/auth.ts` - Middlewares de permissions
- ✅ `src/middlewares/README.md` - Documentation middlewares
- ✅ `src/routes/test.ts` - Routes de test
- ✅ `src/routes/users.ts` - Routes utilisateurs
- ✅ `src/db/migrate.ts` - Script de migration
- ✅ `PERMISSIONS.md` - Ce fichier

### Fichiers modifiés :
- ✅ `src/db/database.ts` - Enum + colonne permission
- ✅ `src/db/README.md` - Documentation DB mise à jour
- ✅ `src/index.ts` - Routes et middlewares ajoutés
- ✅ `package.json` - Script migrate ajouté

## ⚠️ Important

1. **Premier Admin** : Doit être créé manuellement en DB
2. **JWT** : Contient l'ID utilisateur, les permissions sont rechargées à chaque requête
3. **Sécurité** : Les cookies sont httpOnly, secure, sameSite=strict
4. **Migration** : Exécuter `npm run migrate` si base existante

## 🎯 Prochaines Étapes Suggérées

1. Créer des routes pour les énigmes (PNJ)
2. Créer un dashboard admin
3. Ajouter des logs d'audit pour les changements de permissions
4. Ajouter une route pour lister tous les utilisateurs (admin)
5. Implémenter la gestion des équipes et guildes avec permissions
