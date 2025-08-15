# 📘 xcraft-core-http

## Aperçu

Le module `xcraft-core-http` est une librairie utilitaire du framework Xcraft qui fournit des fonctions d'aide pour les opérations HTTP. Il se concentre principalement sur le téléchargement de fichiers avec suivi de progression et gestion robuste des erreurs.

## Sommaire

- [Structure du module](#structure-du-module)
- [Fonctionnement global](#fonctionnement-global)
- [Exemples d'utilisation](#exemples-dutilisation)
- [Interactions avec d'autres modules](#interactions-avec-dautres-modules)
- [Détails des sources](#détails-des-sources)

## Structure du module

Le module expose une interface simple avec une fonction principale :

- **`get()`** - Télécharge un fichier depuis une URL vers un fichier local avec suivi de progression

Le module utilise la librairie `request` pour les opérations HTTP et s'appuie sur [xcraft-core-fs] pour la gestion du système de fichiers.

## Fonctionnement global

Le module fournit une abstraction simplifiée pour le téléchargement de fichiers HTTP avec les fonctionnalités suivantes :

1. **Téléchargement avec streaming** : Utilise des streams pour gérer efficacement les gros fichiers
2. **Suivi de progression** : Callback optionnel pour suivre l'avancement du téléchargement
3. **Gestion d'erreurs** : Détection des codes d'erreur HTTP et gestion des timeouts
4. **Création automatique de dossiers** : Crée automatiquement l'arborescence de destination
5. **Gestion robuste des handles** : Workaround pour s'assurer de la fermeture complète des fichiers

## Exemples d'utilisation

### Téléchargement simple

```javascript
const http = require('xcraft-core-http');

// Téléchargement basique
http.get(
  'https://example.com/file.zip',
  '/path/to/destination/file.zip',
  (error) => {
    if (error) {
      console.error('Erreur de téléchargement:', error);
    } else {
      console.log('Téléchargement terminé avec succès');
    }
  }
);
```

### Téléchargement avec suivi de progression

```javascript
const http = require('xcraft-core-http');

http.get(
  'https://example.com/large-file.zip',
  '/path/to/destination/large-file.zip',
  (error) => {
    if (error) {
      console.error('Erreur:', error);
    } else {
      console.log('Téléchargement terminé');
    }
  },
  (progress, total) => {
    const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;
    console.log(`Progression: ${progress}/${total} bytes (${percentage}%)`);
  }
);
```

### Utilisation dans un acteur Xcraft

```javascript
// Dans une quête d'acteur
async downloadFile(url, outputPath) {
  const xHttp = require('xcraft-core-http');

  await new Promise((resolve, reject) => {
    xHttp.get(url, outputPath, (error) => {
      if (error) {
        reject(new Error(`Échec du téléchargement: ${error}`));
      } else {
        resolve();
      }
    }, (progress, total) => {
      // Publier la progression via un événement
      this.quest.evt('download.progress', {progress, total});
    });
  });
}
```

## Interactions avec d'autres modules

- **[xcraft-core-fs]** : Utilisé pour créer l'arborescence de dossiers de destination
- **`request`** : Librairie externe pour les requêtes HTTP (version 2.67.0+)
- **`fs`** : Module Node.js natif pour les opérations sur le système de fichiers
- **`path`** : Module Node.js natif pour la manipulation des chemins de fichiers

## Détails des sources

### `index.js`

Le fichier principal expose une seule fonction publique `get()` qui encapsule la logique de téléchargement HTTP.

#### Méthodes publiques

- **`get(fileUrl, outputFile, callback, callbackProgress)`** — Télécharge un fichier depuis une URL vers un fichier local. Paramètres :
  - `fileUrl` (string) : URL du fichier à télécharger
  - `outputFile` (string) : Chemin de destination du fichier
  - `callback` (function) : Fonction appelée à la fin du téléchargement avec l'erreur éventuelle
  - `callbackProgress` (function, optionnel) : Fonction appelée périodiquement avec `(progress, total)` pour suivre l'avancement

#### Caractéristiques techniques

- **Timeout** : 30 secondes par défaut
- **Certificats SSL** : `rejectUnauthorized: false` pour accepter les certificats auto-signés
- **User-Agent** : Défini comme "request" pour éviter les blocages serveur
- **Accept Header** : Défini comme "*/*" pour accepter tous les types de contenu
- **Gestion des erreurs** : Détecte les codes de statut HTTP non-200
- **Workaround de fermeture** : Force la fermeture du handle de fichier pour éviter les conflits avec des outils externes (comme 7za.exe)

#### Flux de traitement

1. **Préparation** : Création du dossier de destination si nécessaire via `xcraft-core-fs`
2. **Initialisation** : Création du stream de fichier de sortie et des variables de suivi
3. **Requête HTTP** : Lancement avec configuration (timeout, headers, SSL)
4. **Gestion des événements** :
   - `response` : Vérification du code de statut et récupération de la taille totale
   - `data` : Mise à jour de la progression et appel du callback de progression
   - `error` : Transmission directe de l'erreur au callback principal
   - `finish` : Finalisation avec workaround de fermeture forcée du handle

#### Gestion des erreurs

Le module gère plusieurs types d'erreurs :

- **Codes de statut HTTP** : Tout code différent de 200 génère une erreur formatée comme `"[statusCode] <- [fileUrl]"`
- **Erreurs réseau** : Timeouts, problèmes de connexion, DNS, etc. transmises directement par la librairie `request`
- **Erreurs de système de fichiers** : Problèmes d'écriture ou de permissions gérées par le stream de fichier

#### Workaround technique

Un hack spécifique est implémenté pour s'assurer que le handle de fichier est complètement fermé après le téléchargement. Cette solution consiste à ouvrir puis fermer immédiatement le fichier avec `fs.openSync()` et `fs.closeSync()`. Ceci évite les conflits avec des outils externes (comme 7za.exe) qui pourraient ne pas pouvoir accéder au fichier immédiatement après le téléchargement sur certains systèmes.

---

_Documentation mise à jour_

[xcraft-core-fs]: https://github.com/Xcraft-Inc/xcraft-core-fs