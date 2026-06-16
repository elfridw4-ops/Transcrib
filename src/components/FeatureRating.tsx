import React, { useState, useEffect } from 'react'; // Import React et les Hooks standard
import { Star, Smile, Meh, Frown, Check } from 'lucide-react'; // Import des icônes Lucide pour l'UI
import { motion, AnimatePresence } from 'motion/react'; // Import de Motion pour les micro-animations fluides

// Déclaration de l'interface des propriétés du composant de notation de fonctionnalité
interface FeatureRatingProps {
  featureId: string; // Identifiant unique de la fonctionnalité à évaluer (ex: 'transcription')
  featureName: string; // Nom convivial affiché à l'utilisateur
  ratingType?: 'stars' | 'emojis' | 'both'; // Type de notation disponible
}

export default function FeatureRating({ featureId, featureName, ratingType = 'both' }: FeatureRatingProps) {
  const [starRating, setStarRating] = useState<number | null>(null); // State pour mémoriser la note en étoiles (1-5)
  const [emojiRating, setEmojiRating] = useState<string | null>(null); // State pour mémoriser l'emoji sélectionné ('happy'|'neutral'|'sad')
  const [hoveredStar, setHoveredStar] = useState<number | null>(null); // State de survol pour l'effet interactif des étoiles
  const [submitted, setSubmitted] = useState<boolean>(false); // State pour afficher l'état de soumission réussie
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // State de chargement lors de l'appel API

  // Réinitialiser le statut si l'identifiant de la fonctionnalité change
  useEffect(() => {
    setStarRating(null); // Reset étoiles
    setEmojiRating(null); // Reset emojis
    setSubmitted(false); // Reset confirmation
  }, [featureId]);

  // Fonction pour envoyer la note de l'utilisateur à l'API backend
  const submitRating = async (type: 'stars' | 'emoji', value: string | number) => {
    if (isSubmitting || submitted) return; // Élimine les doubles clics accidentels
    setIsSubmitting(true); // Active l'état d'envoi

    try {
      // Requête HTTP POST vers notre endpoint Express backend
      const response = await fetch('/api/feature-rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature_id: featureId,
          rating_type: type,
          rating_value: value,
        }),
      });

      if (response.ok) {
        setSubmitted(true); // Active l'affichage du message de remerciement
      }
    } catch (error) {
      console.error('Erreur soumission note:', error); // Log l'erreur en console
    } finally {
      setIsSubmitting(false); // Désactive l'état d'envoi
    }
  };

  return (
    <div id={`feature-rating-${featureId}`} className="p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm hover:border-indigo-100 transition-all max-w-md w-full">
      <div className="flex flex-col gap-3">
        {/* En-tête avec label de la fonctionnalité */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Satisfaction</span>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{featureName}</span>
        </div>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="rating-inputs"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="space-y-3"
            >
              <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                Comment évaluez-vous cette fonctionnalité ? Vos retours influent directement sur nos priorités techniques.
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {/* Section Étoiles : de 1 à 5 */}
                {(ratingType === 'stars' || ratingType === 'both') && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        id={`btn-star-${featureId}-${star}`}
                        type="button"
                        onClick={() => {
                          setStarRating(star); // Change le state local
                          submitRating('stars', star); // Soumet immédiatement la note
                        }}
                        onMouseEnter={() => setHoveredStar(star)} // Effet visuel au survol
                        onMouseLeave={() => setHoveredStar(null)} // Retour à la normale au retrait de la souris
                        disabled={isSubmitting} // Bloque le bouton pendant le traitement
                        className="p-1 rounded-md hover:bg-zinc-50 transition-colors cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 transition-transform duration-100 ${
                            (hoveredStar !== null ? star <= hoveredStar : star <= (starRating || 0))
                              ? 'fill-amber-400 text-amber-500 scale-110'
                              : 'text-zinc-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Section Emojis : 😀, 😐, ☹️ */}
                {(ratingType === 'emojis' || ratingType === 'both') && (
                  <div className="flex items-center gap-2 border-l border-zinc-100 pl-3">
                    {/* Option Satisfait */}
                    <button
                      id={`btn-emoji-happy-${featureId}`}
                      type="button"
                      onClick={() => {
                        setEmojiRating('happy'); // State local
                        submitRating('emoji', 'happy'); // Envoi au serveur
                      }}
                      disabled={isSubmitting}
                      className={`p-1.5 rounded-full hover:bg-emerald-50 transition-all cursor-pointer ${
                        emojiRating === 'happy' ? 'bg-emerald-50 text-emerald-600 scale-110' : 'text-zinc-400 hover:text-emerald-500'
                      }`}
                      title="Satisfait (😀)"
                    >
                      <Smile className="w-5 h-5" />
                    </button>

                    {/* Option Neutre */}
                    <button
                      id={`btn-emoji-neutral-${featureId}`}
                      type="button"
                      onClick={() => {
                        setEmojiRating('neutral');
                        submitRating('emoji', 'neutral');
                      }}
                      disabled={isSubmitting}
                      className={`p-1.5 rounded-full hover:bg-amber-50 transition-all cursor-pointer ${
                        emojiRating === 'neutral' ? 'bg-amber-50 text-amber-500 scale-110' : 'text-zinc-400 hover:text-amber-500'
                      }`}
                      title="Neutre (😐)"
                    >
                      <Meh className="w-5 h-5" />
                    </button>

                    {/* Option Insatisfait */}
                    <button
                      id={`btn-emoji-sad-${featureId}`}
                      type="button"
                      onClick={() => {
                        setEmojiRating('sad');
                        submitRating('emoji', 'sad');
                      }}
                      disabled={isSubmitting}
                      className={`p-1.5 rounded-full hover:bg-rose-50 transition-all cursor-pointer ${
                        emojiRating === 'sad' ? 'bg-rose-50 text-rose-500 scale-110' : 'text-zinc-400 hover:text-rose-500'
                      }`}
                      title="Insatisfait (☹️)"
                    >
                      <Frown className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            // Message de confirmation après soumission
            <motion.div
              key="rating-submitted"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-emerald-600 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold leading-tight">Merci, votre évaluation a bien été enregistrée !</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
