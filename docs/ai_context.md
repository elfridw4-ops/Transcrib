# Contexte IA (AI Context)

## Prompts Stratégiques
- **Transcription :** Utilisation d'un prompt guidant Gemini pour une extraction structurée (segmentation temporelle millimétrée).
- **Traduction :** Prompt de traduction sémantique conservant les index temporels pour la synchronisation des sous-titres.

## Hypothèses de Conception
- **Traitement Client-Side :** Préféré pour les exports (PDF/Word) afin d'assurer une scalabilité infinie du serveur local.
- **SQLite Local :** Choisi pour sa robustesse zéro-config et sa compatibilité native avec les déploiements "App Applet".

## Alternatives Rejetées
- **Firebase :** Rejeté car l'objectif est une application 100% autonome et locale sans dépendances cloud pour les données privées des utilisateurs.
- **Whisper Node :** Rejeté car exige l'installation de bibliothèques C++ et Python complexes sur la machine hôte.
