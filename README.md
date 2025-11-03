# ft-intro-rpg

Le repo contient le back et le front dans deux dossier séparés.

On a dev en typescript node et npm dans les deux.

## setup

Installez les packages avec :
```bash
npm install
```

Vous pouvez tout lancer avec une seule commande



```bash
npm run dev # Il faut quand même quelques configs pour le sever (pour utiliser l'api de l'intra etc)
```

## `client`

C'est un petit site fait en react et avec la lib redux pour gérer un store, et
la lib react-router-dom pour faire un routing fulls client-side, je me sers de
zod pour typer les réponses api, (Pour éviter les mauvaises surprises).

Rien de très compliqué, tout le reste c'est du react/css classique

## `server`

On utilise express.js pour créer l'api. L'api de l'intra et la connexion est
gérée avec ft.js (petite lib pour gérer tout ce qui est authentification à
l'intra etc (c'est la personne qui écrit ce readme qui l'a fait j'en profte pour
faire ma pub))

Vous avez le `.env.example` à la racine pour vous aider à créer votre `.env`
Pour dev les seuls trucs importants à set sont les champ `FT_APP_UID` et
`FT_APP_SECRET`.

Oubliez pas de set la bonne route de callback dans les
paramètres de votre api sur l'intra (par défaut
`http://localhost:3000/api/auth/callback` en fonction des paramètres que vous
mettez dans l'env)

Fais avec amour par `lilefebv` et `ebini`
