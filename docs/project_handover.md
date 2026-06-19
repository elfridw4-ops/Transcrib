# Transfert de Projet (Project Handover)

## Résumé
Application d'automatisation linguistique pour les créateurs de contenu. Elle permet d'économiser des heures de travail manuel de transcription et traduction.

## État des Fonctionnalités
- **Stable :** Transcription, Traduction, Exports SRT/VTT/PDF/DOCX, PWA, Admin Panel.
- **Incomplet :** Traitement de fichiers > 100MB (limite de la transmission Base64).

## Points Critiques
- La clé `GEMINI_API_KEY` est indispensable au fonctionnement.
- Le dossier `uploads/` doit être persistant dans l'environnement de déploiement.
