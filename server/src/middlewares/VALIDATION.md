# Validation Middleware - Guide d'Utilisation

## 📋 Vue d'ensemble

Le système de validation fournit des middlewares réutilisables pour valider les données de requête et gérer les erreurs de manière cohérente.

## 🛠️ Middlewares Disponibles

### 1. `validateBody(requiredFields: string[])`

Valide que le corps de la requête contient tous les champs requis.

**Utilisation :**
```typescript
import { validateBody } from "../middlewares/validation";

router.post("/create", validateBody(["name", "description"]), (req, res) => {
	// Les champs name et description sont garantis présents
});
```

**Réponse en cas d'erreur :**
```json
{
	"error": "Missing required fields",
	"missing": ["name"],
	"requiredFields": ["name", "description"]
}
```

---

### 2. `validatePermission`

Valide qu'un niveau de permission valide est fourni dans le corps de la requête.

**Utilisation :**
```typescript
import { validatePermission } from "../middlewares/validation";

router.patch("/user/:id/permission", validatePermission, (req, res) => {
	// req.body.permission est garanti valide
});
```

**Réponses possibles :**
```json
// Champ manquant
{
	"error": "Permission field is required",
	"validPermissions": {
		"USER": 0,
		"PNJ": 1,
		"ADMIN": 2
	}
}

// Type incorrect
{
	"error": "Permission must be a number",
	"received": "string",
	"validPermissions": { ... }
}

// Valeur invalide
{
	"error": "Invalid permission level",
	"received": 99,
	"validPermissions": { ... }
}
```

---

### 3. `validateNumericParam(paramName: string)`

Valide qu'un paramètre d'URL est un nombre valide et positif.

**Utilisation :**
```typescript
import { validateNumericParam } from "../middlewares/validation";

router.get("/user/:id", validateNumericParam("id"), (req, res) => {
	const id = parseInt(req.params.id); // Garanti valide
});
```

**Réponses possibles :**
```json
// Paramètre manquant
{
	"error": "Parameter 'id' is required"
}

// Pas un nombre
{
	"error": "Parameter 'id' must be a valid number",
	"received": "abc"
}

// Nombre négatif
{
	"error": "Parameter 'id' must be positive",
	"received": -5
}
```

---

### 4. `validateNonEmptyString(fieldName: string)`

Valide qu'un champ est une chaîne non vide.

**Utilisation :**
```typescript
import { validateNonEmptyString } from "../middlewares/validation";

router.post("/guild", 
	validateNonEmptyString("name"),
	validateNonEmptyString("motto"),
	(req, res) => {
		// Les champs sont garantis non vides
	}
);
```

**Réponses possibles :**
```json
// Pas une string
{
	"error": "Field 'name' must be a string",
	"received": "number"
}

// String vide
{
	"error": "Field 'name' cannot be empty"
}
```

---

### 5. `asyncHandler(fn: Function)`

Enveloppe les gestionnaires async pour capturer automatiquement les erreurs.

**Sans asyncHandler :**
```typescript
router.get("/data", async (req, res) => {
	try {
		const data = await db.getData();
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
	}
});
```

**Avec asyncHandler (✅ bon) :**
```typescript
import { asyncHandler } from "../middlewares/validation";

router.get("/data", asyncHandler(async (req, res) => {
	const data = await db.getData();
	res.json(data);
}));
// Les erreurs sont automatiquement capturées et gérées
```

---

### 6. `errorHandler`

Gestionnaire d'erreurs global à placer à la fin de la chaîne de middlewares.

**Configuration :**
```typescript
import { errorHandler } from "../middlewares/validation";

// Toutes vos routes...

// À la fin
app.use(errorHandler);
```

---

## 🎯 Exemples Complets

### Exemple 1 : Route Simple avec Validations

```typescript
import { validateBody, validateNumericParam, asyncHandler } from "../middlewares/validation";

router.post(
	"/teams/:guildId/create",
	validateNumericParam("guildId"),
	validateBody(["name", "leaderId"]),
	asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
		const guildId = parseInt(req.params.guildId);
		const { name, leaderId } = req.body;

		const team = await db.createTeam({
			guild_id: guildId,
			leader_id: leaderId,
			name
		});

		res.status(201).json(team);
	})
);
```

### Exemple 2 : Validation Multiple

```typescript
import { 
	validateBody, 
	validateNonEmptyString, 
	validateNumericParam,
	asyncHandler 
} from "../middlewares/validation";

router.post(
	"/guilds",
	requireAdmin,
	validateBody(["name", "motto", "description", "primary_color", "place", "old_job"]),
	validateNonEmptyString("name"),
	validateNonEmptyString("motto"),
	asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
		const guild = await db.createGuild(req.body);
		res.status(201).json(guild);
	})
);
```

### Exemple 3 : Validation Personnalisée

```typescript
import { asyncHandler, ValidationError } from "../middlewares/validation";

const validateTeamName = (req: Request, res: Response, next: NextFunction) => {
	const { name } = req.body;
	
	if (name && name.length > 50) {
		return res.status(400).json({
			error: "Team name too long",
			maxLength: 50,
			received: name.length
		});
	}
	
	next();
};

router.post(
	"/teams",
	validateBody(["name"]),
	validateTeamName,
	asyncHandler(async (req, res) => {
		// ...
	})
);
```

---

## 🔄 Combinaison avec les Permissions

```typescript
import { requireAdmin, requirePNJ, AuthenticatedRequest } from "../middlewares/auth";
import { validatePermission, validateNumericParam, asyncHandler } from "../middlewares/validation";

// Seuls les admins peuvent changer les permissions
router.patch(
	"/users/:id42/permission",
	requireAdmin,                    // 1. Vérifier que l'utilisateur est admin
	validateNumericParam("id42"),    // 2. Valider que id42 est un nombre
	validatePermission,              // 3. Valider que permission est valide
	asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
		const id42 = parseInt(req.params.id42);
		const { permission } = req.body;
		
		const user = await db.updateUser(id42, { permission });
		
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		
		res.json(user);
	})
);
```

---

## 📊 Codes d'Erreur HTTP

| Code | Signification | Quand l'utiliser |
|------|---------------|------------------|
| 400  | Bad Request   | Données invalides, champs manquants |
| 401  | Unauthorized  | Token manquant ou invalide |
| 403  | Forbidden     | Permissions insuffisantes |
| 404  | Not Found     | Ressource introuvable |
| 500  | Server Error  | Erreur interne (automatique via errorHandler) |

---

## ✅ Bonnes Pratiques

### ✅ DO

```typescript
// Utiliser asyncHandler pour les routes async
router.get("/data", asyncHandler(async (req, res) => {
	const data = await db.getData();
	res.json(data);
}));

// Combiner plusieurs validations
router.post("/create", 
	validateBody(["name"]),
	validateNonEmptyString("name"),
	asyncHandler(async (req, res) => { ... })
);

// Retourner des messages d'erreur clairs
if (!resource) {
	return res.status(404).json({ 
		error: "Resource not found",
		id: req.params.id 
	});
}
```

### ❌ DON'T

```typescript
// Ne pas utiliser try-catch partout
router.get("/data", async (req, res) => {
	try {
		// ...
	} catch (error) {
		res.status(500).json({ error: "Error" }); // Message vague
	}
});

// Ne pas oublier de valider les données
router.post("/create", async (req, res) => {
	const { name } = req.body; // name pourrait être undefined !
	await db.create({ name });
});

// Ne pas renvoyer d'erreurs vagues
res.status(500).json({ error: "Error" }); // ❌
res.status(400).json({ error: "Missing name field" }); // ✅
```

---

## 🧪 Tests

### Test 1 : Champ manquant
```bash
curl -X PATCH http://localhost:3001/api/users/123/permission \
  -H "Content-Type: application/json" \
  -d '{}'

# Réponse : 400
# {
#   "error": "Permission field is required",
#   "validPermissions": { "USER": 0, "PNJ": 1, "ADMIN": 2 }
# }
```

### Test 2 : Type incorrect
```bash
curl -X PATCH http://localhost:3001/api/users/123/permission \
  -H "Content-Type: application/json" \
  -d '{"permission": "admin"}'

# Réponse : 400
# {
#   "error": "Permission must be a number",
#   "received": "string"
# }
```

### Test 3 : Valeur invalide
```bash
curl -X PATCH http://localhost:3001/api/users/123/permission \
  -H "Content-Type: application/json" \
  -d '{"permission": 99}'

# Réponse : 400
# {
#   "error": "Invalid permission level",
#   "received": 99
# }
```

---

## 🎁 Résumé

Le système de validation permet :
- ✅ **Validation automatique** des données
- ✅ **Messages d'erreur clairs** et cohérents
- ✅ **Code plus propre** sans try-catch partout
- ✅ **Réutilisabilité** des validations communes
- ✅ **Meilleure expérience développeur** avec des erreurs explicites
