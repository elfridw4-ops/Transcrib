import React, { useState, useEffect } from 'react'; // Import standard de React et des Hooks essentiels
import { 
  MessageSquare, // Icône de bulle de discussion
  Bug, // Icône de scarabée pour les bugs
  Lightbulb, // Icône d'ampoule pour les suggestions de fonctionnalités/améliorations
  PlusCircle, // Icône de création d'élément
  Smile, // Icône de joie pour les avis généraux
  Meh, // Icône d'avis neutre
  Frown, // Icône d'insatisfaction
  X, // Icône de fermeture
  Star, // Icône d'étoile
  CheckCircle2, // Icône de succès de soumission
  Loader2, // Icône de chargement asynchrone
  Monitor, // Icône d'appareil ou d'infos système
  ShieldCheck, // Icône de conformité/données sécurisées
  Mail // Icône de courrier électronique
} from 'lucide-react'; // Import des icônes Lucide de notre charte graphique
import { motion, AnimatePresence } from 'motion/react'; // Import des utilitaires d'animation de Motion

// Structure d'un retour API de soumission de feedback
interface FeedbackResponse {
  success: boolean;
  feedbackId: string;
  message: string;
}

// Définition des types de feedback supportés par l'application
type FeedbackType = 'bug' | 'suggestion' | 'feature' | 'general';

export default function FeedbackFab() {
  const [isOpen, setIsOpen] = useState<boolean>(false); // État déterminant l'affichage ou le masquage de la boîte de dialogue modal
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null); // Type de retour choisi par l'utilisateur
  const [message, setMessage] = useState<string>(''); // Contenu textuel rédigé par l'utilisateur
  const [ratingStars, setRatingStars] = useState<number | null>(null); // Note sur 5 étoiles si approprié
  const [ratingEmoji, setRatingEmoji] = useState<string | null>(null); // Emoji d'humeur/satisfaction globale
  const [hoveredStar, setHoveredStar] = useState<number | null>(null); // Indicateur de survol sur le barème d'étoiles
  const [userEmail, setUserEmail] = useState<string>('elfridw4@gmail.com'); // Pré-remplissage de l'email de l'utilisateur actif
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Statut de chargement lors d'un envoi de données
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // Message stockant d'éventuelles erreurs de requête
  const [successResult, setSuccessResult] = useState<FeedbackResponse | null>(null); // Informations générées après soumission réussie

  // =========================================================================
  // AJOUTS COMPTABILITÉ RGPD (Art. 25, 17 RGPD)
  // =========================================================================
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false); // État déterminant si l'utilisateur requiert un masquage de ses données personnelles
  const [userConsent, setUserConsent] = useState<boolean>(false); // État de consentement au traitement informatique obligatoire des feedbacks utilisateur


  // Objets métadonnées de diagnostic système collectés de façon automatisée pour aider l'équipe de dev
  const [systemMetadata, setSystemMetadata] = useState({
    browser: 'Inconnu',
    device: 'Desktop',
    appVersion: '1.1.0',
    pageContext: 'landing',
  });

  // Détection automatique du contexte au montage ou à l'ouverture de la boîte de dialogue
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent; // Lecture brute de l'agent utilisateur
      
      // Détection simplifiée du navigateur
      let browserDetected = 'Navigateur Inconnu';
      if (userAgent.indexOf('Chrome') > -1) browserDetected = 'Google Chrome';
      else if (userAgent.indexOf('Safari') > -1) browserDetected = 'Apple Safari';
      else if (userAgent.indexOf('Firefox') > -1) browserDetected = 'Mozilla Firefox';
      else if (userAgent.indexOf('MSIE') > -1 || !!(document as any).documentMode) browserDetected = 'Internet Explorer';

      // Détection de l'appareil (Desktop vs Mobile)
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const hostPath = window.location.hash || window.location.pathname; // Détection de l'état de routage ou d'onglet actuel
      
      setSystemMetadata({
        browser: browserDetected,
        device: isMobile ? 'Mobile/Tablette' : 'Ordinateur de Bureau',
        appVersion: '1.1.0',
        pageContext: hostPath,
      });
    }
  }, [isOpen]);

  // Réinitialiser les états locaux du formulaire lors de la fermeture
  const handleClose = () => {
    setIsOpen(false); // Fermer la modale
    setFeedbackType(null); // Vider le type de feedback
    setMessage(''); // Vider le message rédigé
    setRatingStars(null); // Vider la notation d'étoile
    setRatingEmoji(null); // Vider l'évaluation par emoji
    setSuccessResult(null); // Vider la réponse de succès
    setErrorMsg(null); // Vider les messages d'erreur
    setIsAnonymous(false); // Réinitialiser l'option d'anonymat RGPD
    setUserConsent(false); // Réinitialiser le consentement obligatoire d'utilisation
  };

  // Traitement et expédition du feedback vers le backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Annuler le comportement de rechargement par défaut
    
    // VALIDATIONS APPLICATIVES POUR ÉVITER LES FIGES DE SOUUMISSION EN IFRAME (RGPD et RGPD compliant)
    if (!feedbackType) { // Vérifier que le type est fourni
      setErrorMsg('Veuillez sélectionner un type de feedback (Bug, Suggestion, Fonctionnalité ou Avis).'); // Indiquer le problème et inviter à faire un choix
      return;
    }
    if (!message || message.trim().length === 0) { // Vérifier la présence de texte explicatif rédigé par l'auteur
      setErrorMsg('Veuillez décrire votre avis ou le problème rencontré dans le champ de message.'); // Alerter l'utilisateur
      return;
    }
    // Si l'utilisateur n'active pas le mode anonyme, l'adresse e-mail doit être présente et posséder un format valide
    if (!isAnonymous && (!userEmail || userEmail.trim().length === 0 || !userEmail.includes('@'))) {
      setErrorMsg('Veuillez saisir une adresse email valide afin que nous puissions revenir vers vous ou activez le Mode Anonyme pour envoyer.');
      return;
    }
    if (!userConsent) { // Bloquer l'envoi de données si le consentement informatique RGPD obligatoire est décoché
      setErrorMsg('Vous devez cocher la case ci-dessous pour consentir au stockage de vos retours.'); // Expliquer le besoin de consentement
      return;
    }

    setIsSubmitting(true); // Activer l'overlay de chargement
    setErrorMsg(null); // Réinitialiser les messages d'erreur résiduels

    try {
      // Construction du payload complet de données conformes RGPD
      const payload = {
        type: feedbackType, // Le type choisi
        rating_stars: ratingStars, // Les étoiles attribuées
        rating_emoji: ratingEmoji, // L'emoji choisi
        message: message, // Le corps du retour
        page_context: systemMetadata.pageContext, // Scope de la page de provenance
        app_version: systemMetadata.appVersion, // La version d'application
        browser: systemMetadata.browser, // Infos navigateur
        device: systemMetadata.device, // Terminal machine
        user_email: isAnonymous ? null : userEmail, // Filtrage préventif de l'adresse email si anonyme
        is_anonymous: isAnonymous, // Flag de masquage
        user_consent: userConsent // Signature de consentement au traitement
      };

      // Requête HTTP POST sécurisée
      const response = await fetch('/api/feedback', {
        method: 'POST', // Méthode de création
        headers: { 'Content-Type': 'application/json' }, // Format de transmission JSON
        body: JSON.stringify(payload), // Sérialisation du payload
      });

      if (!response.ok) { // Échec réseau ou serveur
        const errData = await response.json().catch(() => ({})); // Parse de l'erreur
        throw new Error(errData.message || 'La réponse du serveur indique une erreur.'); // Levée d'exception
      }

      const result: FeedbackResponse = await response.json(); // Lecture brute du JSON retourné par le serveur
      setSuccessResult(result); // Enregistrement de l'ID unique FB-XXXXX
    } catch (err: any) {
      console.error('Erreur expédition feedback:', err); // Alerte console technique
      setErrorMsg(err.message || "Une erreur réseau est survenue. Veuillez réessayer."); // Retranscription visuelle du problème
    } finally {
      setIsSubmitting(false); // Désactiver le spinner
    }
  };

  return (
    <>
      {/* BOUTON FLOTTANT FIXE GLOBAL - Visible sur toutes les pages en bas à droite */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          id="global-feedback-trigger-fab"
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-3 rounded-full shadow-2xl hover:shadow-indigo-300 transition-all cursor-pointer border border-indigo-500/30 group"
          title="Signaler un bug, proposer une amélioration ou donner votre avis"
        >
          <MessageSquare className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
          <span className="text-sm font-medium tracking-wide">Feedback</span>
          {/* Un petit point rouge clignotant pour capter gentiment l'oeil au premier abord */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </motion.button>
      </div>

      {/* BOÎTE DE DIALOGUE MODALE DE FEEDBACK */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay d'arrière-plan avec un flou cinématique */}
            <motion.div
              id="feedback-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm z-0"
            />

            {/* Conteneur modal animé */}
            <motion.div
              id="feedback-modal-content"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-y-auto z-10 p-6 md:p-8 max-h-[calc(100vh-2rem)] md:max-h-[85vh]"
            >
              {/* Bouton de fermeture d'angle */}
              <button
                id="feedback-modal-close"
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <AnimatePresence mode="wait">
                {!successResult ? (
                  // FORMULAIRE DE FEEDBACK ACTIF
                  <form key="feedback-active-form" onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-zinc-900">
                        Votre avis nous intéresse !
                      </h3>
                      <p className="text-sm text-zinc-500 mt-1">
                        Aidez-nous à améliorer cette solution. Signalez des dysfonctionnements ou suggérez des évolutions.
                      </p>
                    </div>

                    {/* SECTEUR DU TYPE DE FEEDBACK */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                        1. Que souhaitez-vous faire ?
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Option BUGS */}
                        <button
                          id="fb-type-bug"
                          type="button"
                          onClick={() => { setFeedbackType('bug'); setRatingEmoji(null); setRatingStars(null); }}
                          className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            feedbackType === 'bug'
                              ? 'border-rose-450 bg-rose-50/50 text-rose-700 shadow-sm'
                              : 'border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:bg-zinc-50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${feedbackType === 'bug' ? 'bg-rose-100 text-rose-600' : 'bg-zinc-100 text-zinc-500'}`}>
                            <Bug className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-sm font-bold block">Signaler un Bug</span>
                            <span className="text-[10px] text-zinc-400 block">Dysfonctionnement technique</span>
                          </div>
                        </button>

                        {/* Option SUGGESTION */}
                        <button
                          id="fb-type-suggestion"
                          type="button"
                          onClick={() => { setFeedbackType('suggestion'); setRatingEmoji(null); setRatingStars(null); }}
                          className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            feedbackType === 'suggestion'
                              ? 'border-indigo-450 bg-indigo-50/50 text-indigo-700 shadow-sm'
                              : 'border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:bg-zinc-50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${feedbackType === 'suggestion' ? 'bg-indigo-100 text-indigo-600' : 'bg-zinc-100 text-zinc-500'}`}>
                            <Lightbulb className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-sm font-bold block">Une Suggestion</span>
                            <span className="text-[10px] text-zinc-400 block">Amélioration fonctionnelle</span>
                          </div>
                        </button>

                        {/* Option DEMANDE DE FONCTIONNALITÉ */}
                        <button
                          id="fb-type-feature"
                          type="button"
                          onClick={() => { setFeedbackType('feature'); setRatingEmoji(null); setRatingStars(null); }}
                          className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            feedbackType === 'feature'
                              ? 'border-emerald-450 bg-emerald-50/50 text-emerald-700 shadow-sm'
                              : 'border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:bg-zinc-50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${feedbackType === 'feature' ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-500'}`}>
                            <PlusCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-sm font-bold block">Fonctionnalité</span>
                            <span className="text-[10px] text-zinc-400 block">Nouveau module / besoin</span>
                          </div>
                        </button>

                        {/* Option AVIS GENERAL */}
                        <button
                          id="fb-type-general"
                          type="button"
                          onClick={() => { setFeedbackType('general'); }}
                          className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            feedbackType === 'general'
                              ? 'border-amber-450 bg-amber-50/50 text-amber-700 shadow-sm'
                              : 'border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:bg-zinc-50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${feedbackType === 'general' ? 'bg-amber-100 text-amber-600' : 'bg-zinc-100 text-zinc-500'}`}>
                            <Smile className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-sm font-bold block">Avis Général</span>
                            <span className="text-[10px] text-zinc-400 block">Note globale de satisfaction</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* SATELLITE SATISFACTION RATINGS (CONDITIONNEL) */}
                    {feedbackType && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 pt-2 border-t border-zinc-100"
                      >
                        {/* 1. Barème avec Etoiles de 1 à 5 */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                            Évaluez votre satisfaction :
                          </label>
                          <div className="flex items-center gap-1.5 bg-zinc-50 px-2 py-1 rounded-xl w-max">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                id={`form-modal-star-${star}`}
                                type="button"
                                onClick={() => setRatingStars(star)}
                                onMouseEnter={() => setHoveredStar(star)}
                                onMouseLeave={() => setHoveredStar(null)}
                                className="p-0.5 rounded cursor-pointer hover:bg-zinc-200/55 transition-all text-amber-400"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    (hoveredStar !== null ? star <= hoveredStar : star <= (ratingStars || 0))
                                      ? 'fill-amber-400 text-amber-500 scale-110'
                                      : 'text-zinc-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 2. Barème optionnel Emojis : 😀, 😐, ☹️ */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                            Votre humeur globale actuelle :
                          </label>
                          <div className="flex items-center gap-3 bg-zinc-50 px-3 py-1 rounded-xl w-max">
                            <button
                              id="rating-emoji-happy"
                              type="button"
                              onClick={() => setRatingEmoji('happy')}
                              className={`p-1 rounded-full transition-all cursor-pointer ${
                                ratingEmoji === 'happy' ? 'bg-emerald-100 text-emerald-600 scale-110 shadow-sm' : 'text-zinc-400 hover:text-emerald-500'
                              }`}
                              title="Très optimiste / Satisfait"
                            >
                              <Smile className="w-5 h-5" />
                            </button>
                            <button
                              id="rating-emoji-neutral"
                              type="button"
                              onClick={() => setRatingEmoji('neutral')}
                              className={`p-1 rounded-full transition-all cursor-pointer ${
                                ratingEmoji === 'neutral' ? 'bg-amber-100 text-amber-600 scale-110 shadow-sm' : 'text-zinc-400 hover:text-amber-500'
                              }`}
                              title="Neutre"
                            >
                              <Meh className="w-5 h-5" />
                            </button>
                            <button
                              id="rating-emoji-sad"
                              type="button"
                              onClick={() => setRatingEmoji('sad')}
                              className={`p-1 rounded-full transition-all cursor-pointer ${
                                ratingEmoji === 'sad' ? 'bg-rose-100 text-rose-600 scale-110 shadow-sm' : 'text-zinc-400 hover:text-rose-500'
                              }`}
                              title="Insatisfait"
                            >
                              <Frown className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* CHAMP DE TEXTE EXPLICATIF */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center justify-between">
                        <span>2. Votre message descriptif :</span>
                        {message.length > 0 && <span className="text-[10px] text-zinc-400 font-normal normal-case">{message.length} caractères</span>}
                      </label>
                      <textarea
                        id="feedback-textarea-msg"
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={
                          feedbackType === 'bug'
                            ? "Exprimez clairement ce qu'il s'est passé. Exemple : 'Après avoir cliqué sur Word .docx, le fichier téléchargé affiche une erreur de formatage sur mes segments en français..'"
                            : feedbackType === 'suggestion'
                            ? "Partagez votre idée pour rendre l'interface plus conviviale. Exemple : 'Il serait vraiment top d'avoir une option pour copier directement le texte traduit dans le presse-papiers.'"
                            : feedbackType === 'feature'
                            ? "Décrivez le besoin que vous avez. Exemple : 'J'aurais besoin d'un bouton de synthèse vocale pour écouter la traduction générée directement par le navigateur.'"
                            : "Dites-nous ce que vous pensez globalement de la vitesse de traitement de la vidéo et du support de l'interface en général."
                        }
                        className="w-full text-sm p-4 rounded-2xl border border-zinc-200 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-zinc-50"
                      />
                    </div>

                    {/* ADRESSE EMAIL ET SÉCURITÉ */}
                    <div className="grid sm:grid-cols-2 gap-4 pb-2 border-b border-zinc-100">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1">
                          <Mail className="w-3 h-3 text-zinc-400" /> Adresse Email
                        </label>
                        <input
                          id="feedback-email-input"
                          type="email"
                          disabled={isAnonymous} // Désactiver le champ pour marquer visuellement l'application de l'anonymisation
                          value={isAnonymous ? '' : userEmail} // Effacer la valeur stockée si l'anonymat est enclenché
                          onChange={(e) => setUserEmail(e.target.value)} // Mettre à jour l'email
                          placeholder={isAnonymous ? "Anonymisé (Option RGPD active)" : "votre-email@example.com"} // Indicateur d'état RGPD dynamique
                          className={`w-full text-xs p-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-sans ${
                            isAnonymous ? 'bg-zinc-100/80 border-dashed border-zinc-300 text-zinc-400 cursor-not-allowed' : 'bg-white border-zinc-200 text-zinc-800'
                          }`}
                        />
                      </div>

                      <div className="text-[11px] text-zinc-400 flex flex-col justify-end gap-1 font-sans">
                        <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> ID d'Anonymat Réseau Activé</span>
                        <span className="flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5 text-indigo-500" /> Diagnostic Métadonnées Protégé</span>
                      </div>
                    </div>

                    {/* CONFIGURATION ET CONSENTEMENT CONFORME RGPD (ART. 6 ET 25) */}
                    <div className="space-y-3.5 bg-zinc-50 border border-zinc-200/60 p-4 rounded-2xl">
                      <div className="flex items-start gap-2.5">
                        <input
                          id="feedback-opt-anonymous"
                          type="checkbox"
                          checked={isAnonymous} // Statut coché/décoché
                          onChange={(e) => setIsAnonymous(e.target.checked)} // Mise à jour de l'option d'anonymat RGPD
                          className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-400 cursor-pointer"
                        />
                        <div className="text-xs">
                          <label htmlFor="feedback-opt-anonymous" className="font-semibold text-zinc-750 block cursor-pointer select-none">
                            Activer le Mode Anonyme (Recommandé RGPD)
                          </label>
                          <span className="text-[10px] text-zinc-500 block leading-normal">
                            Masque votre adresse e-mail ainsi que l'empreinte précise de votre navigateur et système d'exploitation lors de l'archivage.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 pt-2 border-t border-zinc-200/50">
                        <input
                          id="feedback-opt-consent"
                          type="checkbox"
                          checked={userConsent} // Statut de consentement
                          onChange={(e) => setUserConsent(e.target.checked)} // Détermination de l'accord
                          className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-400 cursor-pointer"
                        />
                        <div className="text-xs">
                          <label htmlFor="feedback-opt-consent" className="font-semibold text-zinc-750 block cursor-pointer select-none flex items-center gap-1">
                            Consentir au traitement de mon feedback <span className="text-rose-500 font-bold">*</span>
                          </label>
                          <span className="text-[10px] text-zinc-500 block leading-normal">
                            J'accepte que mes réponses et diagnostics soient sauvegardés dans la base SQLite locale souveraine de l'application à des fins exclusives d'amélioration.
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* DIAGNOSTIC DU SYSTÈME ENCAPSULÉ */}
                    <div className="bg-zinc-50 rounded-2xl p-3 border border-zinc-100 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-zinc-500 font-mono">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>Navigateur : {isAnonymous ? 'Masqué (RGPD active)' : systemMetadata.browser}</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>Machine : {isAnonymous ? 'Masquée (RGPD active)' : systemMetadata.device}</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>Scope Actuel : {systemMetadata.pageContext}</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>Build App : v{systemMetadata.appVersion}</span>
                    </div>

                    {/* SÉCURITÉ DE NOTIFICATION D’ERREUR */}
                    {errorMsg && (
                      <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                        {errorMsg}
                      </p>
                    )}

                    {/* PIED DE MODALE ET BOUTONS D'ACTION */}
                    <div className="flex gap-3 justify-end pt-2">
                      <button
                        id="feedback-btn-cancel"
                        type="button"
                        onClick={handleClose}
                        className="px-5 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-650 transition-all text-xs font-semibold cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        id="feedback-btn-submit"
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg hover:shadow-indigo-100 transition-all text-xs font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...
                          </>
                        ) : (
                          'Soumettre mon feedback'
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  // ÉCRAN DE SUCCÈS ET REMERCIEMENT AVEC ID DE TRAÇATION
                  <motion.div
                    key="feedback-success-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8 space-y-6"
                  >
                    <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 className="w-10 h-10 animate-bounce" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold tracking-tight text-zinc-900">Merci pour votre contribution !</h3>
                      <p className="text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
                        Votre retour a été archivé dans notre base de données sécurisée. Notre équipe de développement va s'y pencher rapidement.
                      </p>
                    </div>

                    {/* TICKET / INTERACTION EN UNIQUE FEEDBACK ID */}
                    <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 max-w-sm mx-auto space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono block">Référence unique de ticket :</span>
                      <span className="text-xl font-mono font-bold text-indigo-600 tracking-wider block">{successResult.feedbackId}</span>
                      <span className="text-[10px] text-zinc-400 block font-normal leading-relaxed">Conservez cet identifiant pour tout échange ou de futurs rapports d'avancement.</span>
                    </div>

                    <button
                      id="feedback-btn-finish-success"
                      type="button"
                      onClick={handleClose}
                      className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md transition-all inline-block"
                    >
                      Retourner à l'application
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
