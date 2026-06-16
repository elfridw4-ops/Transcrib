*Dernière mise à jour : 2026-04-14*

# Identité Visuelle
- **Ton visuel :** Moderne, épuré, technologique mais accessible.
- **Style UI :** "Glassmorphism" (fonds translucides, flou d'arrière-plan, bordures subtiles) pour un aspect logiciel natif moderne.

# Typographie
- **Primaire (UI & Textes) :** `Inter` (sans-serif). Tailles fluides, lisibilité maximale.
- **Secondaire (Données techniques, Timestamps) :** `JetBrains Mono`. Apporte une touche "code/technique" rassurante.

# Palette de couleurs
- **Fond principal :** Zinc 50 (`#fafafa`)
- **Texte principal :** Zinc 900 (`#18181b`)
- **Texte secondaire :** Zinc 500 (`#71717a`)
- **Couleur Primaire (Marque) :** Indigo 600 (`#4f46e5`) - Utilisée pour les actions principales et les accents.
- **Couleur Secondaire :** Indigo 50 (`#eef2ff`) - Utilisée pour les fonds de badges ou zones de survol.

# Couleurs sémantiques
- **Succès (Traduction terminée) :** Emerald 600 (`#059669`) / Fond Emerald 50 (`#ecfdf5`)
- **Information :** Indigo 600 (Aligné avec la marque)
- **Avertissement :** Amber 500 (`#f59e0b`)
- **Erreur :** Red 500 (`#ef4444`)

# Design Tokens (Tailwind)
- **Radius :** Arrondis prononcés (`rounded-2xl`, `rounded-3xl`) pour un aspect convivial.
- **Shadows :** Ombres douces et diffuses (`shadow-xl` combiné au backdrop-blur).
- **Bordures :** Très fines et claires (`border-white/20`, `border-zinc-200`).

# Composants clés
- **Bouton Primaire (`.btn-primary`) :** Fond Indigo 600, texte blanc, padding généreux (px-6 py-3), effet de scale au clic (`active:scale-95`).
- **Bouton Secondaire (`.btn-secondary`) :** Fond blanc, bordure grise, texte sombre. Utilisé pour les actions d'export.
- **Cards (`.glass`) :** Fond blanc à 80% d'opacité, flou d'arrière-plan (`backdrop-blur-md`), bordure blanche semi-transparente.
- **Zone d'upload :** Bordure pointillée (`border-dashed`), changement de couleur au survol ou si un fichier est sélectionné.

# Iconographie
- **Bibliothèque :** `lucide-react`.
- **Style :** Contour (stroke), épaisseur de ligne de 2px, coins arrondis.
- **Tailles :** 20x20px (`w-5 h-5`) pour les boutons, 32x32px (`w-8 h-8`) pour les illustrations vides.

# Accessibilité UI
- Contraste vérifié (AA minimum) entre le texte Indigo/Zinc et les fonds clairs.
- Retours visuels clairs sur les états interactifs (hover, active, disabled).
- Barre de progression animée pour indiquer l'état du système.
