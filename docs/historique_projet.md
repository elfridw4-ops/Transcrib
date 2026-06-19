*Dernière mise à jour : 2026-06-16*

# Présentation du projet
- **Nom du projet :** Transcribe & Translate AI
- **Objectif :** Fournir une application intelligente, fonctionnant localement, pour générer automatiquement des transcriptions et traductions de vidéos, avec export de documents (Word, PDF) et de sous-titres (SRT, VTT).
- **Utilisateurs cibles :** Créateurs de contenu, étudiants, professionnels de la vidéo.
- **Fonctionnalités principales :**
  - Upload de vidéos locales (.mp4, .mov, .avi, .mkv).
  - Transcription automatique avec détection de la langue.
  - Traduction automatique vers le français.
  - Génération et téléchargement de sous-titres (SRT, VTT).
  - Génération et téléchargement de documents (Word, PDF).
  - Interface responsive "Mobile-First" avec stockage local des fichiers.

# Architecture
- **Architecture globale :** Application Full-Stack locale (Client-Serveur monolithique léger).
- **Technologies :**
  - **UI :** React 19, Vite, Tailwind CSS v4, Motion (animations), Lucide React (icônes).
  - **Serveur :** Node.js avec Express (gestion des uploads locaux et des routes API).
  - **DB / Stockage :** Système de fichiers local (`/uploads`, `/transcriptions`) + Base de données relationnelle locale SQLite (`better-sqlite3` pour la persistance et le tri des feedbacks utilisateurs).
  - **Hébergement :** Localhost (destiné à tourner sur le PC/Mac de l'utilisateur).
  - **IA :** API Gemini (`gemini-3-flash-preview`) pour la transcription audio/vidéo et la traduction.
- **Flux de données :**
  1. L'utilisateur upload une vidéo via le Frontend React.
  2. Le fichier est sauvegardé localement via Express + Multer.
  3. Le Frontend convertit le fichier en Base64 et l'envoie à l'API Gemini pour transcription.
  4. Le résultat est envoyé à Gemini pour traduction.
  5. Les données (JSON) sont formatées côté client pour générer les fichiers exportables (docx, jspdf).

# Décisions techniques (résumé)
- **Utilisation d'Express + Vite :** Permet de combiner une interface moderne (React) avec un accès au système de fichiers local (Node.js) sans configuration complexe.
- **API Gemini vs Whisper local :** L'environnement de développement actuel favorise l'utilisation de l'API Gemini pour un traitement multimodal rapide, remplaçant l'installation lourde de Python/Whisper en local tout en gardant l'application légère.
- **Génération de documents côté client :** Utilisation de `docx` et `jspdf` dans le navigateur pour réduire la charge du serveur local et accélérer les téléchargements.

# Historique des modifications
- **2026-03-12 :**
  - **Modification :** Création initiale du projet.
  - **Impact :** Mise en place du serveur Express, de l'interface React, de l'intégration Gemini et des fonctions d'export.
- **2026-04-14 :**
  - **Modification :** Initialisation de la documentation complète du projet.
  - **Impact :** Création du dossier `/docs` avec les fichiers de suivi, d'architecture et de charte graphique.
- **2026-06-16 :**
  - **Modification :** Intégration de la Landing Page professionnelle (A/B Ready) et responsive.
  - **Impact :** Ajout de sections marketing d'impact (Bénéfices, Bento Grid de fonctionnalités d'IA, Comment ça marche interactif, Témoignages de cas d'usage réels, FAQ dépliable, etc.) intégrées harmonieusement avec la console de calcul. Un backup a été créé sous `/src/App.bak.tsx`.
  - **Modification (Feedback System) :** Implémentation du système de feedbacks, notation et console d'administration.
  - **Impact :** Ajout d'une base de données locale SQLite (`feedback.db`). Création d'API et de composants modulaires (`FeatureRating` pour évaluer les fonctions principales de transcription, traduction et export, `FeedbackFab` pour le signalement global avec récolte automatique d'informations de diagnostic technique, et `AdminFeedbackDashboard` avec graphiques d'analyse Recharts et changement de statuts réels). Accès direct depuis le bouton d'administration sécurisé de la barre de navigation.
  - **Modification (Drag and Drop UI) :** Implémentation du système de glisser-déposer (Drag and Drop) natif HTML5 pour les fichiers vidéo/audio au sein de la console locale de calcul.
  - **Impact :** Expérience utilisateur (UX) améliorée avec changement dynamique d'état visuel (animations, icônes réactifs, textes guidés) lors du survol et traitement automatique du fichier dès son dépôt.
  - **Modification (Validation & Alignement Iframe Feedback) :** Correction du gel d'interaction ("fige") de la fenêtre de feedback en environnement Iframe.
  - **Impact :** Élimination de la validation HTML5 native (attributs required) qui bloquait silencieusement la soumission au sein des contextes sandboxés d'Iframe ; mise en œuvre d'une architecture de validation applicative douce intégrée offrant des retours d'erreurs graphiques clairs et sans blocage. Repositionnement des calques z-index pour écarter tout risque de masquage par l'overlay d'arrière-plan.
  - **Modification (Hauteur Modale Dynamique & Défilement) :** Résolution des coupures et troncatures verticales de la modale dans les iframes de faible hauteur.
  - **Impact :** Remplacement du masque de débordement statique par une limite de hauteur relative dynamique `max-h-[calc(100vh-2rem)]` et une directive `overflow-y-auto`. Le formulaire est maintenant entièrement explorable et valide sur de petites fenêtres sans être amputé en tête ou en bas.
  - **Modification (Hold Admin Access) :** Dissimulation du bouton Admin via appui long de 5s sur le logo.
  - **Modification (PWA & Social Sharing) :** Transformation en application web progressive installable et optimisation du partage social.
  - **Impact :** Support hors ligne, icônes multi-plateformes, bouton d'installation dynamique et intégration des balises Open Graph/Twitter pour un partage professionnel. Ajout d'une page de notes de version (Changelog) accessible depuis le footer.


