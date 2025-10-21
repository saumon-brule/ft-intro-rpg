# Base de données RPG

## Structure des tables

### Table `users`
Stocke les informations des utilisateurs 42.

| Colonne      | Type     | Description                    |
|--------------|----------|--------------------------------|
| id           | INTEGER  | Clé primaire auto-incrémentée  |
| id42         | INTEGER  | ID unique de l'utilisateur 42  |
| login        | TEXT     | Login de l'utilisateur         |
| image        | TEXT     | URL de l'image de profil       |
| pool_month   | TEXT     | Mois de piscine                |
| pool_year    | TEXT     | Année de piscine               |
| permission   | INTEGER  | Niveau de permission (0=USER, 1=PNJ, 2=ADMIN) |
| created_at   | DATETIME | Date de création               |
| updated_at   | DATETIME | Date de dernière modification  |

### Table `guilds`
Stocke les informations des guildes.

| Colonne       | Type     | Description                    |
|---------------|----------|--------------------------------|
| id            | INTEGER  | Clé primaire auto-incrémentée  |
| motto         | TEXT     | Devise de la guilde            |
| description   | TEXT     | Description de la guilde       |
| primary_color | TEXT     | Couleur primaire (hex)         |
| place         | TEXT     | Lieu de la guilde              |
| old_job       | TEXT     | Ancien métier associé          |
| created_at    | DATETIME | Date de création               |
<!-- leader_id and state_lock removed from teams schema -->
### Table `teams`
Stocke les informations des équipes.

| Colonne    | Type     | Description                           |
|------------|----------|---------------------------------------|
| id         | INTEGER  | Clé primaire auto-incrémentée         |
| guild_id   | INTEGER  | ID de la guilde (référence `guilds.id`) |
| xp         | INTEGER  | Points d'expérience (défaut: 0)       |
| created_at | DATETIME | Date de création                      |
| updated_at | DATETIME | Date de dernière modification         |

## Relations

- `teams.leader_id` → `users.id` (CASCADE on DELETE)
- `teams.guild_id` → `guilds.id` (CASCADE on DELETE)

<!-- leader_id and state_lock removed from teams schema -->

## Méthodes disponibles

### Users
- `findUserById(id)` - Trouve un utilisateur par son ID
- `findUserById42(id42)` - Trouve un utilisateur par son ID 42
- `createUser(userData)` - Crée un nouvel utilisateur
- `updateUser(id42, userData)` - Met à jour un utilisateur (peut inclure la permission)
- `findOrCreateUser(userData)` - Trouve ou crée un utilisateur

### Guilds
- `getAllGuilds()` - Récupère toutes les guildes
- `getGuildById(id)` - Récupère une guilde par son ID
- `createGuild(guildData)` - Crée une nouvelle guilde
- `updateGuild(id, guildData)` - Met à jour une guilde
- `deleteGuild(id)` - Supprime une guilde

### Teams
- `getAllTeams()` - Récupère toutes les équipes
- `getTeamById(id)` - Récupère une équipe par son ID
- `getTeamsByGuild(guildId)` - Récupère toutes les équipes d'une guilde
- `createTeam(teamData)` - Crée une nouvelle équipe
- `updateTeam(id, teamData)` - Met à jour une équipe
- `addTeamXp(teamId, xpToAdd)` - Ajoute de l'XP à une équipe
- `deleteTeam(id)` - Supprime une équipe

## Seed

Pour peupler la base de données avec des guildes par défaut :

```bash
npm run seed
```

Ou directement :

```bash
ts-node src/db/seed.ts
```

{
  "oldString": "\t\"scripts\": {\n\t\t\"start\": \"node dist/index.js\",\n\t\t\"build\": \"tsc\",\n\t\t\"dev\": \"nodemon --watch src --ext ts --exec ts-node src/index.ts\",\n\t\t\"test\": \"echo \\\"Error: no test specified\\\" && exit 1\"\n\t},",
  "newString": "\t\"scripts\": {\n\t\t\"start\": \"node dist/index.js\",\n\t\t\"build\": \"tsc\",\n\t\t\"dev\": \"nodemon --watch src --ext ts --exec ts-node src/index.ts\",\n\t\t\"seed\": \"ts-node src/db/seed.ts\",\n\t\t\"test\": \"echo \\\"Error: no test specified\\\" && exit 1\"\n\t},"
}
