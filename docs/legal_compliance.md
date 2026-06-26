# Conformité Juridique (Legal Compliance)

## Pages Légales Déployées
Quatre pages de conformité réglementaire ont été créées et intégrées de manière dynamique dans le pied de page (Footer) de l'application :
1. **Mentions Légales :** Informations sur l'éditeur, le directeur de publication (Elfrid W.) et l'hébergement (Google Cloud Run à Dublin, Irlande, Europe-West1).
2. **Conditions Générales d'Utilisation (CGU) :** Conditions d'accès, limites de responsabilité liées aux transcriptions d'IA et nature volatile du traitement vidéo.
3. **Politique de Confidentialité :** Finalités, traitement local minimaliste, transmission chiffrée par proxy à Gemini, et formulaires de feedbacks sauvegardés dans `feedback.db`.
4. **Gestion des Cookies :** Zéro cookie publicitaire tiers, usage exclusif de stockage local (localStorage) et cache de Service Worker (`sw.js`).

## Données
- **Collecte :** Vidéos temporaires supprimées après session (traitées à la volée via proxy sécurisé vers Gemini API, jamais stockées de manière persistante).
- **Stockage :** Évaluations et retours sauvegardés localement dans `feedback.db`.
- **Conformité :** RGPD / CNIL (Droit d'accès, de rectification et d'effacement complet des feedbacks opérationnel via le panneau d'administration).

## Juridique & Juridiction
- **Union Européenne / France :** RGPD (Règlement Général sur la Protection des Données) et réglementations de la CNIL française.
- **Afrique de l'Ouest / Bénin :** Conforme à la Loi n°2017-20 (Livre VI) sur la protection des données à caractère personnel en République du Bénin.
