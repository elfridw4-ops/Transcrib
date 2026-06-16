*Dernière mise à jour : 2026-04-14*

## ADR-0001 — Architecture Full-Stack Locale (Express + Vite)
- **Date :** 2026-03-12
- **Statut :** Accepté
- **Contexte :** L'application doit fonctionner localement et pouvoir manipuler des fichiers vidéo (upload, stockage dans des dossiers spécifiques) tout en offrant une interface utilisateur moderne.
- **Décision :** Utiliser un serveur Node.js/Express servant à la fois l'API locale (via Multer) et le frontend React (via le middleware Vite en développement).
- **Alternatives envisagées :** Application Electron (trop lourd pour un prototype rapide), Python/FastAPI (rejeté pour unifier la stack en TypeScript/JavaScript dans cet environnement).
- **Conséquences :** Facilité d'installation (`npm install` & `npm run dev`), exécution sur un seul port (3000).

## ADR-0002 — Utilisation de l'API Gemini pour la transcription et traduction
- **Date :** 2026-03-12
- **Statut :** Accepté
- **Contexte :** Le cahier des charges suggérait Whisper (Python) et GPT. Cependant, l'environnement de développement actuel est optimisé pour TypeScript et l'API Gemini.
- **Décision :** Utiliser `gemini-3-flash-preview` via le SDK `@google/genai` pour traiter à la fois la vidéo (transcription) et le texte (traduction).
- **Alternatives envisagées :** Appels CLI à FFmpeg + Whisper.cpp local (complexe à packager de manière universelle sans Docker).
- **Conséquences :** Nécessite une clé API Gemini (`GEMINI_API_KEY`), mais simplifie drastiquement le code et accélère le traitement.

## ADR-0003 — Génération de documents côté client
- **Date :** 2026-03-12
- **Statut :** Accepté
- **Contexte :** Les utilisateurs doivent pouvoir télécharger des PDF, DOCX, SRT et VTT.
- **Décision :** Utiliser des bibliothèques frontend (`docx`, `jspdf`) pour générer les fichiers directement dans le navigateur.
- **Alternatives envisagées :** Génération côté serveur (Node.js) puis téléchargement.
- **Conséquences :** Réduit la charge du serveur local, évite la gestion de fichiers temporaires pour les exports, téléchargement instantané.

## ADR-04 — Archivage et Traçabilité des Feedbacks via SQLite (Better-SQLite3)
- **Date :** 2026-06-16
- **Statut :** Accepté
- **Contexte :** Le système exige un archivage durable des signalements d'utilisateurs (bugs, idées, avis, satisfaction) avec catégorisations, notes et contextualisations et une console d'administration interactive.
- **Décision :** Mettre en œuvre une base de données légere et robuste SQLite (`better-sqlite3`) gérée et stockée directement en local (`feedback.db`).
- **Alternatives envisagées :** Stockage JSON plat (trop fragile et non indexable lors de la recherche multicritère), base Firebase Firestore (rejetté pour garantir l'autonomie et le fonctionnement 100% hors-ligne local de notre solution).
- **Conséquences :** Fiabilité transactionnelle ACID absolue, rapidité d'exécution, requêtages SQL d'agrégation d'avis transparents, et aucun service externe à configurer.

## ADR-05 — Anonymisation et Conformité RGPD (Article 17 & Consentement)
- **Date :** 2026-06-16
- **Statut :** Accepté
- **Contexte :** Le traitement des retours d'expérience et des informations de diagnostic technique (email, browser, device) doit respecter le cadre réglementaire du Règlement Général sur la Protection des Données (RGPD).
- **Décision :** Implémenter un consentement de collecte explicite obligatoire pour le transfert, doublé d'une option d'anonymisation intégrale à la source au moment de l'émission. Côté administration, intégrer un bouton physique de purge définitive de la base SQLite ("Droit à l'effacement" sous l'Article 17 du RGPD) pour éliminer intégralement les données suite à une demande utilisateur.
- **Alternatives envisagées :** Anonymat systématique forcé (rejeté car l'identifiant email reste utile pour d'éventuels retours clients nominatifs d'assistance) ou sauvegarde des données indéfiniment sans purge.
- **Conséquences :** Conduite et gestion des retours d'expérience en stricte conformité RGPD. Les utilisateurs gardent le plein contrôle sur leurs métadonnées personnelles.

## ADR-06 — Sécurité d'accès à la Console d’Administration avec Barrière d'Authentification Locale
- **Date :** 2026-06-16
- **Statut :** Accepté
- **Contexte :** L'interface d'administration permet de visualiser l'intégralité des retours utilisateurs ainsi que leurs informations techniques et métadonnées. L'accès opportuniste ou malveillant à ces dossiers sensibles doit être banni.
- **Décision :** Implémenter un portail de garde d'accès (Security Gate) demandant la saisie d'un passkey administrateur. Le backend vérifie l'authenticité de la clé en comparant la valeur hashée/brute avec la variable système `.env` `ADMIN_PASSWORD`. En cas de validation, l'administrateur obtient un jeton mémorisé en sessionStorage, injecté dans un header personnalisé `x-admin-key` pour sécuriser l'ensemble des routes API sensibles (lecture, changement de statut, effacement).
- **Alternatives envisagées :** Utiliser des cookies d'authentification standards de session ou masquer la route frontend (fausse sécurité rejetée).
- **Conséquences :** Sécurisation étanche de l'intégralité des endpoints sensibles (HTTP 401/403 retournés si la signature n'est pas authentique). Déconnexion et purge automatique de la clé d'accréditation lors de la fermeture de l'onglet ou via l'option déconnexion.

## ADR-07 — Validation de Formulaire Applicative pour Compatibilité Iframe et Évitement du Freeze UI
- **Date :** 2026-06-16
- **Statut :** Accepté
- **Contexte :** Lorsque l'application s'exécute dans un contexte d'intégration Iframe sandboxé (tel qu'AI Studio), les bulles d'alertes de validation natives HTML5 (comme `required` sur les inputs) échouent régulièrement à s'afficher ou se retrouvent bloquées par le navigateur. Cela empêche silencieusement la soumission du formulaire, donnant l'impression d'une fenêtre de feedback complètement figée ("freeze").
- **Décision :** Enlever tous les attributs `required` natifs HTML5 des balises `<input>` et `<textarea>` du formulaire flottant de retours, et déléguer l'ensemble de la logique de vérification structurelle au gestionnaire React `handleSubmit` (validation applicative côté client). Les messages d'erreurs d'oubli de saisie ou de consentement sont stockés dans un état dynamique `errorMsg` et affichés élégamment au cœur du modal.
- **Alternatives envisagées :** Conserver la validation native HTML5 et espérer un comportement homogène sur tous les navigateurs en mode Iframe (non viable, figeage critique reproduit).
- **Conséquences :** Expérience utilisateur fluide et stable sur tous les types d'environnements (Iframe d'AI Studio, onglets séparés, mobiles), avec des notifications d'erreurs claires, contextualisées et entièrement stylisées avec notre charte graphique.

## ADR-08 — Limitation de la Hauteur Relative de Modale et Défilement Interne pour Écrans et Iframes Courts
- **Date :** 2026-06-16
- **Statut :** Accepté
- **Contexte :** Le formulaire de feedback complet comprend de nombreuses options, mentions RGPD et métadonnées de diagnostic, ce qui lui donne un gabarit vertical significatif. Dans un conteneur Iframe de hauteur contrainte, ou s'il est affiché sur un écran de résolution réduite, d'autres parties étaient masquées (comme le bouton d'envoi inférieur ou le bouton de fermeture supérieur), et impossible d'effectuer un défilement complet.
- **Décision :** Limiter l'extension de la carte modale avec un plafonnement dynamique `max-h-[calc(100vh-2rem)]` (et `md:max-h-[85vh]` sur de plus grands écrans) et doter le conteneur principal `#feedback-modal-content` d'un défilement automatique `overflow-y-auto`.
- **Alternatives envisagées :** Espérer que le parent ou le document complet défile (impossible, car le conteneur du modal est en `fixed inset-0` centré), ou supprimer des champs pour raccourcir l'affichage (rejeté car cela détruit la rigueur diagnostique et la conformité légale RGPD).
- **Conséquences :** Tous les composants de la boîte de dialogue, y compris l'en-tête et les touches primaires d'action de validation, restent continuellement exploitables même sur les supports de taille réduite et les iframes intégrés.

