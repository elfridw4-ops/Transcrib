import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Scale, 
  Info, 
  Cookie, 
  Mail, 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  Building2, 
  Lock, 
  ExternalLink 
} from 'lucide-react';

interface LegalPagesProps {
  onBack: () => void;
  initialTab?: 'mentions' | 'cgu' | 'privacy' | 'cookies';
}

export default function LegalPages({ onBack, initialTab = 'mentions' }: LegalPagesProps) {
  const [activeTab, setActiveTab] = useState<'mentions' | 'cgu' | 'privacy' | 'cookies'>(initialTab);

  // Sync state if initialTab prop changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const tabs = [
    { id: 'mentions', label: 'Mentions Légales', icon: Info, color: 'text-blue-500 bg-blue-50' },
    { id: 'cgu', label: "Conditions d'Utilisation (CGU)", icon: Scale, color: 'text-indigo-500 bg-indigo-50' },
    { id: 'privacy', label: 'Politique de Confidentialité', icon: Shield, color: 'text-emerald-500 bg-emerald-50' },
    { id: 'cookies', label: 'Gestion des Cookies', icon: Cookie, color: 'text-amber-500 bg-amber-50' },
  ] as const;

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      {/* Return Button */}
      <button 
        onClick={onBack}
        className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 hover:text-indigo-600 bg-white border border-zinc-100 rounded-2xl shadow-sm transition-all duration-200 cursor-pointer mb-8"
        id="btn-back-legal"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Retour à l'application
      </button>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-zinc-100 shadow-sm space-y-2 sticky top-24">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-3 mb-4">
              Documentation Légale
            </h3>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-100' 
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-indigo-600'
                  }`}
                  id={`tab-legal-${tab.id}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}

            <div className="pt-4 mt-4 border-t border-zinc-100 px-3">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Conforme RGPD & CNIL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl p-6 md:p-10 border border-zinc-100 shadow-sm min-h-[500px]">
            <AnimatePresence mode="wait">
              {activeTab === 'mentions' && (
                <motion.div
                  key="mentions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div className="border-b border-zinc-100 pb-6">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Édition & Publication</span>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-1">Mentions Légales</h1>
                    <p className="text-sm text-zinc-400 mt-2">Dernière mise à jour : 25 Juin 2026</p>
                  </div>

                  {/* Sommaire */}
                  <div className="bg-zinc-50/50 rounded-2xl p-4 border border-zinc-100">
                    <h4 className="text-sm font-bold text-zinc-700 flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-indigo-500" /> Sommaire
                    </h4>
                    <ul className="grid sm:grid-cols-2 gap-2 text-xs text-indigo-600 font-medium">
                      <li>
                        <a href="#editor" onClick={(e) => handleAnchorClick(e, 'editor')} className="hover:underline">1. Éditeur de la plateforme</a>
                      </li>
                      <li>
                        <a href="#director" onClick={(e) => handleAnchorClick(e, 'director')} className="hover:underline">2. Directeur de la publication</a>
                      </li>
                      <li>
                        <a href="#host" onClick={(e) => handleAnchorClick(e, 'host')} className="hover:underline">3. Hébergement</a>
                      </li>
                      <li>
                        <a href="#ip" onClick={(e) => handleAnchorClick(e, 'ip')} className="hover:underline">4. Propriété intellectuelle</a>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-6 text-zinc-600 text-sm leading-relaxed">
                    <section id="editor" className="scroll-mt-6">
                      <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2 mb-3">
                        <Building2 className="w-4.5 h-4.5 text-indigo-500" />
                        1. Éditeur de la plateforme
                      </h3>
                      <p>
                        L'application <strong>Transcribe & Translate AI</strong> est une plateforme de démonstration technologique et de production éditée par :
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Société fictive d'expérimentation :</strong> Transcribe & Translate Tech SAS</li>
                        <li><strong>Siège social :</strong> 12, Rue de la Paix, 75002 Paris, France</li>
                        <li><strong>Email de contact :</strong> <a href="mailto:contact@transcribe-translate.ai" className="text-indigo-600 underline">contact@transcribe-translate.ai</a></li>
                      </ul>
                    </section>

                    <section id="director" className="scroll-mt-6">
                      <h3 className="text-lg font-bold text-zinc-900 mb-3">2. Directeur de la publication</h3>
                      <p>
                        Le Directeur de la publication de l'application est <strong>Elfrid W.</strong>, agissant en qualité de Responsable du Produit et de l'Architecture Technique.
                      </p>
                    </section>

                    <section id="host" className="scroll-mt-6">
                      <h3 className="text-lg font-bold text-zinc-900 mb-3">3. Hébergement</h3>
                      <p>
                        Cette plateforme est propulsée et hébergée de manière sécurisée au sein de l'Union Européenne sur les infrastructures de :
                      </p>
                      <div className="bg-zinc-50 rounded-2xl p-4 mt-2 border border-zinc-100">
                        <p className="font-semibold text-zinc-800">Google Cloud Platform (GCP)</p>
                        <p className="text-xs text-zinc-500 mt-1">
                          Service : Cloud Run (Containers auto-scalables)<br />
                          Hébergeur : Google Ireland Limited<br />
                          Adresse : Gordon House, Barrow Street, Dublin 4, Irlande<br />
                          Région d'hébergement : Europe-West1 (Belgique)
                        </p>
                      </div>
                    </section>

                    <section id="ip" className="scroll-mt-6">
                      <h3 className="text-lg font-bold text-zinc-900 mb-3">4. Propriété intellectuelle</h3>
                      <p>
                        Tous les éléments constituant le site (charte graphique, logos, icônes, codes sources) sont protégés par les lois en vigueur sur la propriété intellectuelle. Toute reproduction non autorisée sans accord écrit préalable de l'éditeur est strictement interdite.
                      </p>
                    </section>
                  </div>
                </motion.div>
              )}

              {activeTab === 'cgu' && (
                <motion.div
                  key="cgu"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div className="border-b border-zinc-100 pb-6">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Règles & Engagements</span>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-1">Conditions Générales d'Utilisation</h1>
                    <p className="text-sm text-zinc-400 mt-2">Dernière mise à jour : 25 Juin 2026</p>
                  </div>

                  {/* Sommaire */}
                  <div className="bg-zinc-50/50 rounded-2xl p-4 border border-zinc-100">
                    <h4 className="text-sm font-bold text-zinc-700 flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-indigo-500" /> Sommaire
                    </h4>
                    <ul className="grid sm:grid-cols-2 gap-2 text-xs text-indigo-600 font-medium">
                      <li>
                        <a href="#cgu-object" onClick={(e) => handleAnchorClick(e, 'cgu-object')} className="hover:underline">1. Objet du Service</a>
                      </li>
                      <li>
                        <a href="#cgu-access" onClick={(e) => handleAnchorClick(e, 'cgu-access')} className="hover:underline">2. Accès et Restrictions</a>
                      </li>
                      <li>
                        <a href="#cgu-data" onClick={(e) => handleAnchorClick(e, 'cgu-data')} className="hover:underline">3. Traitement des fichiers médias</a>
                      </li>
                      <li>
                        <a href="#cgu-liability" onClick={(e) => handleAnchorClick(e, 'cgu-liability')} className="hover:underline">4. Limitation de responsabilité</a>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-6 text-zinc-600 text-sm leading-relaxed">
                    <section id="cgu-object" className="scroll-mt-6">
                      <h3 className="text-lg font-bold text-zinc-900 mb-3">1. Objet du Service</h3>
                      <p>
                        Transcribe & Translate AI propose un service de transcription automatique et de traduction instantanée de vidéos ou de pistes audio, intégrant l'intelligence artificielle générative de Google (modèles Gemini).
                      </p>
                    </section>

                    <section id="cgu-access" className="scroll-mt-6">
                      <h3 className="text-lg font-bold text-zinc-900 mb-3">2. Accès et Restrictions</h3>
                      <p>
                        Le service est mis à disposition gratuitement pour une utilisation individuelle ou de test. Vous vous engagez à ne pas soumettre de contenus contraires aux lois en vigueur, à caractère haineux, diffamatoire ou enfreignant des droits d'auteur de tiers.
                      </p>
                    </section>

                    <section id="cgu-data" className="scroll-mt-6">
                      <h3 className="text-lg font-bold text-zinc-900 mb-3">3. Traitement des fichiers médias</h3>
                      <p>
                        Le traitement des fichiers est réalisé de manière éphémère. Les fichiers vidéo envoyés par les utilisateurs ne sont pas stockés de manière pérenne sur nos serveurs. Ils sont transmis de manière chiffrée par proxy à l'API Gemini pour transcription, puis immédiatement supprimés après la fin du cycle d'analyse.
                      </p>
                    </section>

                    <section id="cgu-liability" className="scroll-mt-6">
                      <h3 className="text-lg font-bold text-zinc-900 mb-3">4. Limitation de responsabilité</h3>
                      <p>
                        Bien que notre moteur de transcription basé sur l'IA offre une précision exceptionnelle, l'exactitude absolue des transcriptions et des traductions ne peut être garantie à 100%. L'utilisateur est invité à relire et valider ses fichiers avant toute publication professionnelle.
                      </p>
                    </section>
                  </div>
                </motion.div>
              )}

              {activeTab === 'privacy' && (
                <motion.div
                  key="privacy"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div className="border-b border-zinc-100 pb-6">
                    <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">Sécurisé & Conforme</span>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-2">Politique de Confidentialité</h1>
                    <p className="text-sm text-zinc-400 mt-2">Dernière mise à jour : 25 Juin 2026</p>
                  </div>

                  {/* Sommaire */}
                  <div className="bg-zinc-50/50 rounded-2xl p-4 border border-zinc-100">
                    <h4 className="text-sm font-bold text-zinc-700 flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-emerald-500" /> Sommaire
                    </h4>
                    <ul className="grid sm:grid-cols-2 gap-2 text-xs text-emerald-600 font-medium">
                      <li>
                        <a href="#priv-manager" onClick={(e) => handleAnchorClick(e, 'priv-manager')} className="hover:underline">1. Responsable du traitement</a>
                      </li>
                      <li>
                        <a href="#priv-data" onClick={(e) => handleAnchorClick(e, 'priv-data')} className="hover:underline">2. Données collectées</a>
                      </li>
                      <li>
                        <a href="#priv-destination" onClick={(e) => handleAnchorClick(e, 'priv-destination')} className="hover:underline">3. Destination & Confidentialité</a>
                      </li>
                      <li>
                        <a href="#priv-rights" onClick={(e) => handleAnchorClick(e, 'priv-rights')} className="hover:underline">4. Vos droits (RGPD / CNIL)</a>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-6 text-zinc-600 text-sm leading-relaxed">
                    <section id="priv-manager" className="scroll-mt-6">
                      <h3 className="text-lg font-bold text-zinc-900 mb-3">1. Responsable du traitement</h3>
                      <p>
                        Le responsable du traitement des données personnelles est <strong>Transcribe & Translate Tech SAS</strong>. Vos données sont traitées avec le plus grand respect de votre vie privée, conformément au RGPD européen et à la loi Informatique et Libertés française.
                      </p>
                    </section>

                    <section id="priv-data" className="scroll-mt-6">
                      <h3 className="text-lg font-bold text-zinc-900 mb-3">2. Données collectées</h3>
                      <p>
                        Notre plateforme limite strictement la collecte de données personnelles au minimum requis (principe de minimisation des données) :
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-2">
                        <li><strong>Fichiers Vidéos :</strong> Téléversés temporairement uniquement pour la transcription en direct. Ils sont traités de manière purement volatile et ne sont jamais stockés dans une base de données.</li>
                        <li><strong>Formulaires de Feedback :</strong> Lorsque vous fournissez un avis ou une évaluation de fonctionnalité, votre nom, email et avis sont enregistrés de manière sécurisée dans notre base de données locale sécurisée (`feedback.db`) afin d'étudier vos suggestions d'améliorations.</li>
                      </ul>
                    </section>

                    <section id="priv-destination" className="scroll-mt-6">
                      <h3 className="text-lg font-bold text-zinc-900 mb-3">3. Destination des données</h3>
                      <p>
                        Vos informations personnelles ne sont <strong>jamais vendues, échangées ou partagées</strong> avec des régies publicitaires ou des tiers non autorisés. Seul l'appel sécurisé API vers les modèles Gemini de Google est émis pour transcrire l'audio de vos médias, selon leurs chartes strictes de traitement éphémère.
                      </p>
                    </section>

                    <section id="priv-rights" className="scroll-mt-6">
                      <h3 className="text-lg font-bold text-zinc-900 mb-3">4. Vos droits (Droit d'accès et d'oubli)</h3>
                      <p>
                        Conformément au RGPD, vous disposez d'un droit permanent d'accès, de rectification et d'effacement de l'ensemble de vos retours et avis.
                      </p>
                      <p className="mt-2">
                        Pour exercer ce droit ou demander la suppression immédiate de vos évaluations stockées, contactez-nous par email : 
                        <a href="mailto:privacy@transcribe-translate.ai" className="text-indigo-600 underline font-medium ml-1">privacy@transcribe-translate.ai</a>.
                      </p>
                    </section>
                  </div>
                </motion.div>
              )}

              {activeTab === 'cookies' && (
                <motion.div
                  key="cookies"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div className="border-b border-zinc-100 pb-6">
                    <span className="text-xs font-semibold text-amber-500 bg-amber-50 px-2 py-1 rounded-md">Zéro Traceur Tiers</span>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mt-2">Gestion des Cookies</h1>
                    <p className="text-sm text-zinc-400 mt-2">Dernière mise à jour : 25 Juin 2026</p>
                  </div>

                  <div className="space-y-6 text-zinc-600 text-sm leading-relaxed">
                    <p>
                      <strong>Transcribe & Translate AI s'engage pour votre vie privée numérique.</strong>
                    </p>
                    <div className="p-5 rounded-3xl bg-amber-50/50 border border-amber-100 flex items-start gap-4">
                      <Cookie className="w-8 h-8 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-zinc-900">Aucun cookie publicitaire ou analytique tiers</h4>
                        <p className="text-xs text-zinc-600 mt-1">
                          Nous n'utilisons aucun traceur tiers de profilage, de reciblage ou d'analyse comportementale intrusive (comme Google Analytics ou Facebook Pixel).
                        </p>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-zinc-900 mt-6">Pourquoi utilisons-nous le stockage local ?</h3>
                    <p>
                      Nous utilisons exclusivement des technologies de stockage interne strictement fonctionnelles :
                    </p>
                    <ul className="list-disc pl-5 space-y-3">
                      <li>
                        <strong>Service Worker PWA (`sw.js`) :</strong> Pour mettre en cache les actifs statiques essentiels (HTML, CSS, icônes) afin de garantir une expérience hors ligne rapide et fluide.
                      </li>
                      <li>
                        <strong>Storage Local (localStorage) :</strong> Pour enregistrer de manière totalement locale vos préférences utilisateur, afin que vous n'ayez pas à reconfigurer l'application lors de vos prochaines visites.
                      </li>
                    </ul>

                    <h3 className="text-lg font-bold text-zinc-900">Paramétrage du navigateur</h3>
                    <p>
                      Vous pouvez configurer votre navigateur pour interdire l'utilisation du stockage local ou vider l'historique de votre cache à tout moment. Notez cependant que la désactivation complète des cookies techniques pourrait limiter l'installation de la PWA et perturber le fonctionnement optimal hors ligne.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer legal page action */}
            <div className="mt-12 pt-8 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>Une question ? Envoyez un e-mail à : </span>
                <a href="mailto:contact@transcribe-translate.ai" className="text-indigo-600 hover:underline font-semibold">
                  contact@transcribe-translate.ai
                </a>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Plateforme de confiance certifiée</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
