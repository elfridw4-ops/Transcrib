*Dernière mise à jour : 2026-04-14*

# Invite initiale
> "Agis comme un architecte logiciel senior spécialisé dans le développement d'applications IA et le traitement multimédia. Ta mission est de concevoir une application intelligente destinée aux créateurs de contenu et aux étudiants, qui permet de générer automatiquement des transcriptions et traductions de vidéos, avec export de documents et sous-titres..." (Voir chat_history.md pour l'invite complète).

# Exigences fonctionnelles
- **Générateur de transcription :** Accepter des vidéos (mp4, mov, avi, mkv), détecter la langue, générer une transcription avec timestamps.
- **Générateur de traduction :** Traduire la transcription en français en conservant les timestamps.
- **Générateur de sous-titres :** Produire des fichiers SRT et VTT synchronisés.
- **Générateur de documents :** Produire un document Word (.docx) et un PDF contenant la transcription et la traduction.
- **Interface utilisateur :** Responsive, mobile-first, boutons larges, barre de progression.

# Exigences non fonctionnelles
- **Performances :** Traitement fluide, gestion de fichiers vidéo (limite recommandée de 25MB pour l'API).
- **Sécurité & Confidentialité :** Fonctionnement local privilégié, pas de stockage cloud persistant des vidéos de l'utilisateur (hors traitement IA transitoire).
- **Scalabilité :** Architecture modulaire permettant l'ajout de nouvelles langues ou de nouveaux modèles d'IA.

# Contraintes
- **Techniques :** Projet entièrement local, facile à tester sur PC/Mac.
- **Déploiement :** Aucun besoin de déploiement public ou cloud (usage desktop/local).
- **Dépendances :** Utilisation de l'API Gemini pour le traitement IA (remplacement de Whisper/Python pour des raisons de compatibilité d'environnement).
