# Système de Validation - Exemple Complet

## 🎯 Avant / Après

### ❌ AVANT (avec try-catch partout)

```typescript
router.patch("/:id42/permission", requireAdmin, async (req, res) => {
	try {
		const id42 = parseInt(req.params.id42);
		const { permission } = req.body;

		// Validation manuelle
		if (isNaN(id42)) {
			return res.status(400).json({ error: "Invalid user ID" });
		}

		if (permission === undefined) {
			return res.status(400).json({ error: "Permission is required" });
		}

		if (![0, 1, 2].includes(permission)) {
			return res.status(400).json({ error: "Invalid permission" });
		}

		const user = await db.updateUser(id42, { permission });

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		res.json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
});
```

**Problèmes :**
- 😞 Beaucoup de code répétitif
- 😞 Validation mélangée avec la logique métier
- 😞 Messages d'erreur peu informatifs
- 😞 Difficile à maintenir
- 😞 Try-catch cache tous les types d'erreurs

---

### ✅ APRÈS (avec middlewares de validation)

```typescript
router.patch(
	"/:id42/permission",
	requireAdmin,
	validateNumericParam("id42"),
	validatePermission,
	asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
		const id42 = parseInt(req.params.id42);
		const { permission } = req.body;

		const user = await db.updateUser(id42, { permission });

		if (!user) {
			return res.status(404).json({ 
				error: "User not found",
				id42 
			});
		}

		res.json(user);
	})
);
```

**Avantages :**
- ✅ Code clair et concis
- ✅ Validations réutilisables
- ✅ Messages d'erreur détaillés et cohérents
- ✅ Facile à tester
- ✅ Séparation des préoccupations

---

## 📝 Scénarios de Test

### Scénario 1 : Permission manquante

**Requête :**
```bash
curl -X PATCH http://localhost:3001/api/users/123456/permission \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_ADMIN_TOKEN" \
  -d '{}'
```

**Réponse :**
```json
{
  "error": "Permission field is required",
  "validPermissions": {
    "USER": 0,
    "PNJ": 1,
    "ADMIN": 2
  }
}
```

**Status :** `400 Bad Request`

---

### Scénario 2 : Type de permission incorrect

**Requête :**
```bash
curl -X PATCH http://localhost:3001/api/users/123456/permission \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_ADMIN_TOKEN" \
  -d '{"permission": "admin"}'
```

**Réponse :**
```json
{
  "error": "Permission must be a number",
  "received": "string",
  "validPermissions": {
    "USER": 0,
    "PNJ": 1,
    "ADMIN": 2
  }
}
```

**Status :** `400 Bad Request`

---

### Scénario 3 : Valeur de permission invalide

**Requête :**
```bash
curl -X PATCH http://localhost:3001/api/users/123456/permission \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_ADMIN_TOKEN" \
  -d '{"permission": 99}'
```

**Réponse :**
```json
{
  "error": "Invalid permission level",
  "received": 99,
  "validPermissions": {
    "USER": 0,
    "PNJ": 1,
    "ADMIN": 2
  }
}
```

**Status :** `400 Bad Request`

---

### Scénario 4 : ID utilisateur invalide

**Requête :**
```bash
curl -X PATCH http://localhost:3001/api/users/abc/permission \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_ADMIN_TOKEN" \
  -d '{"permission": 1}'
```

**Réponse :**
```json
{
  "error": "Parameter 'id42' must be a valid number",
  "received": "abc"
}
```

**Status :** `400 Bad Request`

---

### Scénario 5 : Utilisateur introuvable

**Requête :**
```bash
curl -X PATCH http://localhost:3001/api/users/999999/permission \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_ADMIN_TOKEN" \
  -d '{"permission": 1}'
```

**Réponse :**
```json
{
  "error": "User not found",
  "id42": 999999
}
```

**Status :** `404 Not Found`

---

### Scénario 6 : Succès

**Requête :**
```bash
curl -X PATCH http://localhost:3001/api/users/123456/permission \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_ADMIN_TOKEN" \
  -d '{"permission": 1}'
```

**Réponse :**
```json
{
  "message": "User permission updated successfully",
  "user": {
    "id": 1,
    "id42": 123456,
    "login": "jdoe",
    "image": "https://...",
    "pool_month": "october",
    "pool_year": "2024",
    "permission": 1
  }
}
```

**Status :** `200 OK`

---

## 🔧 Créer ses Propres Validations

### Exemple : Validation d'email

```typescript
export const validateEmail = (req: Request, res: Response, next: NextFunction) => {
	const { email } = req.body;

	if (!email) {
		return res.status(400).json({
			error: "Email is required"
		});
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	
	if (!emailRegex.test(email)) {
		return res.status(400).json({
			error: "Invalid email format",
			received: email
		});
	}

	next();
};

// Utilisation
router.post("/register", validateEmail, asyncHandler(async (req, res) => {
	// email est garanti valide
}));
```

### Exemple : Validation de date

```typescript
export const validateDate = (fieldName: string) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const dateStr = req.body[fieldName];

		if (!dateStr) {
			return res.status(400).json({
				error: `Field '${fieldName}' is required`
			});
		}

		const date = new Date(dateStr);

		if (isNaN(date.getTime())) {
			return res.status(400).json({
				error: `Field '${fieldName}' must be a valid date`,
				received: dateStr,
				format: "YYYY-MM-DD or ISO 8601"
			});
		}

		next();
	};
};

// Utilisation
router.post("/event", validateDate("startDate"), asyncHandler(async (req, res) => {
	// startDate est une date valide
}));
```

---

## 📊 Résumé des Améliorations

| Aspect | Avant | Après |
|--------|-------|-------|
| **Code** | 20+ lignes par route | 5-10 lignes |
| **Réutilisabilité** | ❌ Code dupliqué | ✅ Middlewares réutilisables |
| **Messages d'erreur** | Vagues | Précis et informatifs |
| **Maintenabilité** | ⚠️ Difficile | ✅ Facile |
| **Tests** | ⚠️ Complexes | ✅ Simples |
| **Expérience dev** | 😞 Frustrant | 😊 Agréable |

---

## ✨ Résultat Final

Au lieu d'avoir des erreurs génériques comme :
```json
{
  "error": "Internal server error"
}
```

Vous obtenez maintenant des erreurs précises :
```json
{
  "error": "Permission field is required",
  "validPermissions": {
    "USER": 0,
    "PNJ": 1,
    "ADMIN": 2
  }
}
```

**Cela améliore :**
- 🎯 L'expérience développeur (API claire)
- 🐛 Le debugging (erreurs explicites)
- 📖 La documentation (auto-documentant)
- 🔒 La sécurité (validation stricte)
- ♻️ La maintenabilité (code réutilisable)
