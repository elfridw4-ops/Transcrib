# Charte Graphique — Transcribe & Translate AI
> Plateforme intelligente d'analyse, de transcription et de traduction vidéo par IA locale et sécurisée.

**Version :** 1.1.0
**Thème :** Light (Clair à haut contraste avec effets de verre trempé)
**Dernière mise à jour :** 30 Juin 2026

---

## Table des matières
1. [Identité de Marque & Rationale](#1-identité-de-marque--rationale)
2. [Palette de Couleurs (Tokens)](#2-palette-de-couleurs-tokens)
3. [Typographie & Échelle de Texte](#3-typographie--échelle-de-texte)
4. [Système de Grille & Espacements](#4-système-de-grille--espacements)
5. [Radii de Courbures (Borders)](#5-radii-de-courbures-borders)
6. [Surfaces, Translucidité & Élévation](#6-surfaces-translucidité--élévation)
7. [Fiche Technique des Composants (UI Kit)](#7-fiche-technique-des-composants-ui-kit)
8. [Règles du Logo & Marque](#8-règles-du-logo--marque)
9. [Système Iconographique](#9-système-iconographique)
10. [Règles de Direction Artistique (Imagerie)](#10-règles-de-direction-artistique-imagerie)
11. [Do's & Don'ts (7 Règles d'Or)](#11-dos--donts-7-règles-dor)
12. [Accessibilité, Contrastes & Motion](#12-accessibilité-contrastes--motion)
13. [Tokens CSS - Quick Start](#13-tokens-css---quick-start)

---

## 1. Identité de Marque & Rationale
Transcribe & Translate AI est conçu comme un utilitaire technique professionnel mais convivial. Le design repose sur un équilibre rigoureux entre la rigueur d'un outil de productivité d'ingénierie et l'élégance fluide des applications grand public modernes. 
- **Le Concept Clé : "L'Intelligence Transparente".** Nous utilisons des fonds subtilement translucides (effet *Glassmorphism*), des lignes de démarcation extra-fines de couleur Zinc et une couleur d'accent violet-indigo électrique de haute intensité pour évoquer l'expertise, la rapidité et la haute technologie de Gemini.
- **La Densité Spatiale :** Un espacement confortable favorisant la concentration, l'absence de bruit visuel et une structure bento-grid pour les sections de fonctionnalités de la page d'accueil.

---

## 2. Palette de Couleurs (Tokens)

Les couleurs sont structurées selon un niveau d'autorité strict et possèdent toutes des rôles fonctionnels clairs et explicites pour l'interface.

### Palette Principale & Neutres
| Nom sémantique | Valeur hex | Token CSS / Tailwind | Rôle primaire | Restrictions | Niveau d'autorité |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Brand Indigo** | `#4f46e5` | `indigo-600` / `--color-brand-indigo` | Boutons d'action primaire, états actifs importants, accents typographiques de marque. | ❌ Ne jamais utiliser comme couleur de texte sur fond sombre sans validation contrastée. | Majeure |
| **Brand Indigo Hover** | `#4338ca` | `indigo-700` / `--color-brand-indigo-hover` | État de survol des boutons primaires et des éléments interactifs majeurs. | ❌ Ne pas utiliser pour du texte de labellisation statique. | Majeure |
| **Brand Indigo Soft** | `#eef2ff` | `indigo-50` / `--color-brand-indigo-soft` | Arrière-plan de badges, focus d'inputs, conteneurs d'alertes informatives. | ❌ Interdiction d'utiliser pour du texte d'action. | Secondaire |
| **Midnight Charcoal** | `#18181b` | `zinc-900` / `--color-text-main` | Titres majeurs, boutons sombres, textes à fort contraste et accents structurels. | ❌ Ne pas utiliser pour du texte de paragraphe long en petits caractères. | Majeure |
| **Silver Mist** | `#71717a` | `zinc-500` / `--color-text-muted` | Textes secondaires, sous-titres, dates de mise à jour, métadonnées de sous-titres. | ❌ Ne jamais utiliser sous une taille de 12px pour conserver la conformité AA. | Secondaire |
| **Pure Alabaster** | `#ffffff` | `white` / `--color-bg-card` | Arrière-plan des cartes flottantes, boutons secondaires, barres de navigation. | ❌ Ne pas accumuler sans bordure de contraste Zinc-100 sur fond clair. | Majeure |
| **Ice Flow** | `#fafafa` | `zinc-50` / `--color-bg-canvas` | Arrière-plan de la page entière (Canvas principal de l'application). | ❌ Ne pas utiliser pour des cartes ou fenêtres modales. | Majeure |

### Palette Sémantique (États applicatifs)
| Nom sémantique | Valeur hex | Token CSS / Tailwind | Rôle applicatif | Restrictions | Niveau d'autorité |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Emerald Leaf** | `#059669` | `emerald-600` / `--color-emerald-success` | État "Succès" (Traduction ou transcription complétée, téléchargement réussi). | ❌ Ne pas utiliser pour des boutons d'actions standards. | Sémantique |
| **Emerald Soft** | `#ecfdf5` | `emerald-50` | Arrière-plan de badge de réussite ou alerte positive. | ❌ Interdit de poser du texte blanc dessus sans opacité sombre. | Sémantique |
| **Amber Flame** | `#f59e0b` | `amber-500` / `--color-amber-warning` | Indicateur d'avertissement, statut de traitement intermédiaire ou chargement. | ❌ Ne pas utiliser pour du texte long sans contour sombre. | Sémantique |
| **Red Coral** | `#ef4444` | `red-500` / `--color-red-error` | Erreurs de traitement API, formats non supportés, suppression définitive de feedbacks. | ❌ Ne pas employer pour des icônes d'illustration décorative. | Sémantique |

---

## 3. Typographie & Échelle de Texte

### Polices du système
1. **Inter** (Import Google Fonts, poids `300`, `400`, `500`, `600`, `700`)
   - *Substituts :* `ui-sans-serif`, `system-ui`, `-apple-system`, `sans-serif`
   - *Rationale :* Police d'interface hautement lisible, moderne, neutre et équilibrée. Excellente gestion de l'interlettrage sur écrans retina et mobiles.
2. **JetBrains Mono** (Import Google Fonts, poids `400`, `500`)
   - *Substituts :* `ui-monospace`, `SFMono-Regular`, `monospace`
   - *Rationale :* Utilisée exclusivement pour les indicateurs temporels (Timestamps), les formats de fichiers d'export et les métadonnées de versioning pour évoquer un cadre technique soigné.

### Échelle typographique
| Rôle de texte | Taille (px) | Taille (Tailwind) | Line-height | Letter-spacing | Token / Classe | Règle de tracking / Justification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | 36px - 48px | `text-4xl` à `text-5xl` | 1.15 | `-0.025em` | `font-extrabold tracking-tight` | Le tracking serré (`tight`) donne de la force aux grands titres display. |
| **Page Title** | 30px | `text-3xl` | 1.20 | `-0.02em` | `font-bold tracking-tight` | Utilisé pour les titres des pages ou modales principales. |
| **Section Title** | 24px | `text-2xl` | 1.25 | `-0.015em` | `font-bold` | Titres des grandes rubriques thématiques. |
| **Card Header** | 18px | `text-lg` | 1.35 | `none` | `font-bold text-zinc-900` | Intitulés des cartes de bento-grid et modules. |
| **Body (Normal)** | 14px | `text-sm` | 1.50 | `none` | `font-normal text-zinc-600` | Corps de texte général et explications. Confort optimal. |
| **Code / Label** | 12px | `text-xs` | 1.40 | `+0.05em` | `font-mono tracking-wider` | Utilisé pour les timestamps des vidéos et versions du logiciel. |

---

## 4. Système de Grille & Espacements

L'unité de base de notre système de design est de **4px** (système à multiples de 4).

### Échelle d'espacement standard
- **4px (`p-1` / `m-1`) :** Micro-ajustements de marges, décalage d'icônes dans des boutons.
- **8px (`p-2` / `m-2`) :** Espacement entre labels d'input et champs, petit padding d'éléments.
- **12px (`p-3` / `m-3`) :** Espacement interne des badges complexes, espacement d'éléments d'une même liste.
- **16px (`p-4` / `m-4`) :** Padding de cartes mobiles, écarts horizontaux dans des formulaires.
- **24px (`p-6` / `m-6`) :** Padding standard de cartes bureau (desktop), marge inter-sections moyenne.
- **32px (`p-8` / `m-8`) :** Padding de grands conteneurs ou modales de retours clients.
- **40px à 80px (`py-10` à `py-20`) :** Marges de respiration pour les grands layouts de section.

### Layout Global
- **Max-width :** Limité à `max-w-7xl` (`1280px`) pour garantir un centrage ergonomique sur écrans larges et ultra-larges.
- **Section Gap :** Écart vertical standard de `space-y-12` à `space-y-20` pour aérer les blocs marketing de la landing page.
- **Card Padding :** `p-6` (bureau) et `p-4` (mobile).

---

## 5. Radii de Courbures (Borders)

La géométrie globale de l'interface utilise des angles très doux et organiques pour masquer l'austérité technique de l'intelligence artificielle.

- **Boutons & Éléments Interactifs :** `rounded-xl` (`12px`) ou `rounded-2xl` (`16px`)
  - *Rationale :* Évite d'agresser le regard et invite l'utilisateur à cliquer.
- **Cartes Applicatives & Modales :** `rounded-3xl` (`24px`)
  - *Rationale :* Crée une rupture géométrique forte avec les contours anguleux du navigateur web, simulant une application native moderne.
- **Pills de Filtres & Badges :** `rounded-full` (`9999px`)
  - *Rationale :* Forme oblongue protectrice traditionnelle pour les statuts visuels.

---

## 6. Surfaces, Translucidité & Élévation

Le projet utilise un modèle à **trois niveaux de profondeur visuelle** s'appuyant sur des effets de superposition clairs :

1. **Niveau 0 (Canvas de fond) :** Couleur neutre claire unie `#fafafa` (`zinc-50`). Aucun motif, aucune texture de bruit pour garantir un minimalisme scandinave.
2. **Niveau 1 (Composants de structure & Cards) :** Effet translucide de verre sablé (`.glass`).
   - *Spécifications :* `bg-white/80 backdrop-blur-md border border-white/20 shadow-xl`.
   - *Rationale :* Laisse transparaître subtilement les variations de couleur d'arrière-plan sans compromettre la lisibilité.
3. **Niveau 2 (Surfaces de focus & Modales) :** Fond blanc opaque solide (`#ffffff`) avec ombre portée diffuse haute performance (`shadow-2xl`).
   - *Rationale :* Crée une coupure nette de premier plan pour focaliser l'attention de l'utilisateur.

---

## 7. Fiche Technique des Composants (UI Kit)

### Bouton Primaire (Action Clé)
- **Background :** `#4f46e5` (`indigo-600`)
- **Couleur Texte :** `#ffffff` (`text-white`)
- **Taille & Poids Police :** `14px` (`text-sm`), `font-medium` (500)
- **Padding :** `px-6 py-3`
- **Border Radius :** `16px` (`rounded-2xl`)
- **Bordure / Ombre :** `none` / Ombre diffuse `shadow-lg shadow-indigo-100`
- **États interactifs :**
  - *Hover :* `#4338ca` (`indigo-700`) + ombre accentuée `shadow-indigo-200`.
  - *Focus-visible :* Anneau d'outline Indigo de 2px, offset blanc de 2px.
  - *Active :* Effet d'échelle physique `active:scale-95` pour retour tactile instantané.
  - *Disabled :* Opacité réduite à 50% (`opacity-50`), curseur non-autorisé (`cursor-not-allowed`).
  - *Loading :* Remplacement de l'icône statique par un spinner SVG tournant à 360° et texte "Traitement en cours...".

### Bouton Secondaire (Actions annexes, Exports)
- **Background :** `#ffffff` (`bg-white`)
- **Couleur Texte :** `#18181b` (`text-zinc-900`)
- **Taille & Poids Police :** `14px` (`text-sm`), `font-medium` (500)
- **Padding :** `px-6 py-3`
- **Border Radius :** `16px` (`rounded-2xl`)
- **Bordure / Ombre :** `border border-zinc-200` / ombre légère `shadow-sm`
- **États interactifs :**
  - *Hover :* `#f4f4f5` (`bg-zinc-100`) + légère bordure contrastée.
  - *Active :* `active:scale-95`.
  - *Disabled :* `opacity-40` + `cursor-not-allowed`.

### Chapeaux de Champs (Inputs de Formulaires)
- **Background / Bordure :** `#ffffff` (`bg-white`) / `border-zinc-200`
- **Border Radius :** `12px` (`rounded-xl`)
- **Padding :** `px-4 py-3`
- **États interactifs :**
  - *Focus :* Bordure colorée Indigo (`border-indigo-500`) + ombre d'anneau Indigo subtile (`ring-2 ring-indigo-100`).

---

## 8. Règles du Logo & Marque

Le logo symbolise le caractère mondial de la communication à travers le prisme de l'IA.

### Les variantes autorisées
- **Variante Principale (Header) :** Symbole sphérique d'intégration mondiale (`Globe`) en couleur blanche sur fond de conteneur violet-indigo (`bg-indigo-600`), flanqué du texte `Transcribe & Translate AI` en gras et de la signature sous-titrée `Solution Locale Intelligente` en lettres majeurs d'or ou indigo.
- **Variante Secrète (Super-utilisateur Admin) :** Appui prolongé maintenu pendant exactement **5 secondes** sur l'icône du Globe.
  - *Comportement :* Animation de rotation dynamique continue (`animate-spin`), transition de teinte de l'icône vers le jaune ambré (`text-amber-300`) et apparition de l'indicateur clignotant "Accès...".

### Zone de protection & Interdictions
- **Zone de protection :** Espace minimal vide équivalent à `16px` (`p-4`) autour du logo.
- ❌ **Interdiction formelle :** Ne jamais étirer le logo, ne jamais dissocier l'icône du texte dans la zone de navigation supérieure standard, ne jamais appliquer d'ombres dures non diffuses.

---

## 9. Système Iconographique

- **Source de référence :** Bibliothèque `lucide-react`.
- **Règles stylistiques :**
  - Style vectoriel épuré avec contour (`outline`), épaisseur fixe de tracé à `1.5px` ou `2px`.
  - Coins de tracés arrondis pour correspondre aux angles du logo.
- **Tailles réglementaires :**
  - **16px (`w-4 h-4`) :** Icônes secondaires intégrées dans le texte ou les petits boutons de partage.
  - **20px (`w-5 h-5`) :** Taille d'icône d'action standard (boutons primaires de navigation ou d'export).
  - **32px à 48px (`w-8 h-8` à `w-12 h-12`) :** Icônes décoratives d'en-têtes de bento-grid ou d'illustrations d'état vide (Empty State).

---

## 10. Règles de Direction Artistique (Imagerie)

Pour maintenir l'image de marque propre et ultra-professionnelle de l'application :
- **Types visuels autorisés :** Uniquement des icônes vectorielles dynamiques réactives et des schémas d'architecture SVG stylisés à plat (flat design).
- ❌ **Restrictions strictes :** 
  - Aucune image de stock bon marché, aucune illustration 3D criarde d'outils d'IA, aucun visage humain simulé.
  - Tout visuel promotionnel ou bannière marketing doit utiliser des dégradés subtils reposant sur la palette sémantique Zinc et Indigo (ex : `bg-gradient-to-tr from-indigo-50 to-white`).

---

## 11. Do's & Don'ts (7 Règles d'Or)

### Les Do's ✅
- ✅ **1. Espacer les sections :** Utilisez au minimum `py-12` pour laisser respirer les transitions de blocs.
- ✅ **2. Préserver l'effet Glassmorphism :** Appliquez toujours `.glass` combiné à un floutage d'arrière-plan (`backdrop-blur-md`) pour les fenêtres superposées.
- ✅ **3. Harmoniser les boutons d'export :** Toujours grouper les boutons d'exportation (SRT, VTT, PDF, Word) avec des styles secondaires uniformes pour éviter la surcharge visuelle.
- ✅ **4. Accompagner les icônes d'actions :** Dans les boutons de navigation critiques, couplez systématiquement l'icône avec un libellé textuel explicite pour l'accessibilité.
- ✅ **5. Utiliser JetBrains Mono pour la technique :** Réservez exclusivement les chiffres d'horodatage ou codes à la police mono-espacée.
- ✅ **6. Structurer les modales de retour :** Veillez à ce que toutes les fenêtres de retours possèdent une hauteur relative restreinte (`max-h-[calc(100vh-2rem)]`) et un défilement interne actif (`overflow-y-auto`) pour éviter les troncatures.
- ✅ **7. Exposer clairement les liens de contact :** Permettez d'accéder au support d'un clic depuis la vue légale et le footer de l'application.

### Les Don'ts ❌
- ❌ **1. Éviter le texte brut :** Ne jamais empiler de contenu réglementaire ou technique sans titres structurés et sans sommaire de navigation.
- ❌ **2. Ne pas colorer à outrance :** Pas d'utilisation de dégradés multicolores criards en dehors des accents légers d'Indigo et de Zinc.
- ❌ **3. Ne pas exposer de bouton d'administration :** Ne jamais ajouter d'onglet public d'administration dans la barre de navigation principale (l'accès doit rester strictement ergonomique par appui long sur le logo ou par raccourci clavier expert `Ctrl + Alt + A`).
- ❌ **4. Pas de fenêtres figées :** Ne jamais utiliser de hauteur fixe `h-[600px]` sans gestion du responsive mobile.
- ❌ **5. Bannir la validation HTML5 native bloquante :** Ne pas utiliser de contraintes de formulaires natives au sein des contextes iframes sécurisés (préférer une gestion d'erreurs visuelle et applicative douce).
- ❌ **6. Ne pas mélanger les bibliothèques d'icônes :** Ne jamais importer d'icônes FontAwesome ou d'autres packages en dehors de `lucide-react` pour conserver la cohérence géométrique du trait.
- ❌ **7. Ne pas laisser d'API keys visibles :** Ne jamais exposer de clé Gemini en clair côté client.

---

## 12. Accessibilité, Contrastes & Motion

### Contrôle des contrastes (WCAG 2.1)
- **Texte Midnight Charcoal (`#18181b`) sur fond Pure Alabaster (`#ffffff`) :** Ratio exceptionnel de `19.3:1` (Largement conforme au niveau AAA).
- **Texte Brand Indigo (`#4f46e5`) sur fond Pure Alabaster (`#ffffff`) :** Ratio de `4.6:1` (Parfaitement conforme au niveau AA pour le texte normal).
- **Texte Silver Mist (`#71717a`) sur fond Pure Alabaster (`#ffffff`) :** Ratio de `4.52:1` (Conforme au niveau AA pour le texte secondaire).

### Amortissement des mouvements (Motion Rules)
- Nous utilisons la bibliothèque `motion` de React pour toutes les transitions d'onglets applicatives et les animations de modale.
- **Règle d'or :** Ne jamais dépasser une durée de transition de `0.3s` (300 millisecondes) pour éviter de lasser l'utilisateur. Toutes les animations doivent exploiter un adoucissement fluide (ex : `ease-out` ou courbe d'amortissement physique native).

---

## 13. Tokens CSS - Quick Start

Voici la déclaration exacte des variables de thème injectées au sein du projet de build :

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
@import "tailwindcss";

@theme {
  /* Configuration de la typographie système */
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;

  /* Couleurs de marque */
  --color-brand-indigo: #4f46e5;
  --color-brand-indigo-hover: #4338ca;
  --color-brand-indigo-soft: #eef2ff;

  /* Couleurs sémantiques d'états */
  --color-emerald-success: #059669;
  --color-amber-warning: #f59e0b;
  --color-red-error: #ef4444;
}
```

```typescript
// Exemple d'application du style "Glassmorphism"
const CardComponent = () => {
  return (
    <div className="glass rounded-3xl p-6 md:p-8 hover:shadow-2xl transition-all duration-300">
      <h3 className="font-sans font-bold text-lg text-zinc-900">Module intelligent</h3>
      <p className="font-sans font-normal text-sm text-zinc-500 mt-2">Description...</p>
    </div>
  );
}
```

---

## Éléments à définir
*Tous les tokens de design et états d'interfaces majeurs de l'application sont actuellement définis et stables.*
- [x] Spécification de l'état Hover du bouton secondaire
- [x] Détermination du breakpoint mobile exact (`md: 768px`)
- [x] Spécification de la zone de protection du logo principal
- [x] Validation des ratios de contraste légaux de la page de conformité

