import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileVideo, 
  Languages, 
  FileText, 
  Download, 
  CheckCircle2, 
  Loader2, 
  History,
  FileCode,
  Globe,
  Monitor,
  ShieldCheck,
  Zap,
  ArrowRight,
  BookOpen,
  PlusCircle,
  Video,
  ChevronDown,
  HelpCircle,
  FileIcon,
  Laptop,
  Shield,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { transcribeVideo, translateTranscription, TranscriptionResult, TranscriptionSegment } from './services/gemini';
import { generateSRT, generateVTT, downloadFile, generateDocx, generatePdf } from './services/export';
import FeedbackFab from './components/FeedbackFab';
import FeatureRating from './components/FeatureRating';
import InstallPrompt from './components/InstallPrompt';
import AdminFeedbackDashboard from './components/AdminFeedbackDashboard';
import Changelog from './components/Changelog';

// Custom interface for FAQ Accordion
interface FaqItem {
  question: string;
  answer: string;
}

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'landing' | 'workspace' | 'admin' | 'changelog'>('landing');

  // App / Processing State
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [translation, setTranslation] = useState<TranscriptionSegment[] | null>(null);

  // FAQ Expanded index state
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  // State pour la gestion du drag and drop
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Secret Admin opening triggers (5-second hold and accessibility shortcuts)
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPressingSecret, setIsPressingSecret] = useState(false);

  const startSecretPress = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsPressingSecret(true);
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    
    pressTimerRef.current = setTimeout(() => {
      setActiveTab('admin');
      setIsPressingSecret(false);
    }, 5000); // Trigger after 5 seconds of continuous holding
  };

  const stopSecretPress = () => {
    setIsPressingSecret(false);
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  // Keyboard shortcut as expert accessibility fallback (Ctrl + Alt + A)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setActiveTab('admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    };
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setTranslation(null);
      setActiveTab('workspace');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Transcribe & Translate AI',
      text: 'Transcription et traduction vidéo IA locale et sécurisée.',
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        alert('Lien copié dans le presse-papier !');
      }
    } catch (err) {
      console.error('Erreur lors du partage:', err);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
      setTranslation(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const processVideo = async () => {
    if (!file) return;

    try {
      setIsProcessing(true);
      setProgress(10);
      setStatus('Lecture de la vidéo...');
      
      const base64 = await fileToBase64(file);
      
      setProgress(30);
      setStatus('Transcription en cours (IA)...');
      const transcription = await transcribeVideo(base64, file.type);
      setResult(transcription);
      
      setProgress(70);
      setStatus('Traduction en français...');
      const translated = await translateTranscription(transcription.segments);
      setTranslation(translated);
      
      setProgress(100);
      setStatus('Terminé !');

      // Save to "local storage" via backend
      const formData = new FormData();
      formData.append('video', file);
      await fetch('/api/upload', { method: 'POST', body: formData });

    } catch (error) {
      console.error(error);
      setStatus('Erreur lors du traitement.');
    } finally {
      setIsProcessing(false);
    }
  };

  const faqData: FaqItem[] = [
    {
      question: "Quels formats vidéo sont acceptés ?",
      answer: "L'application prend en charge un large éventail de formats vidéo populaires, notamment MP4, MOV, AVI, et MKV. Vous pouvez également importer des fichiers audio si vous souhaitez uniquement transcrire de l'audio."
    },
    {
      question: "L'application fonctionne-t-elle de manière confidentielle ?",
      answer: "Oui, absolument. Vos fichiers vidéo d'origine restent localisés dans votre dossier réseau /uploads. Seules les requêtes d'analyse d'intelligence artificielle transitent par l'API sécurisée Gemini, sans stockage intermédiaire persistant externe."
    },
    {
      question: "Y a-t-il une limite de taille pour les fichiers ?",
      answer: "Pour des performances optimales de l'API Gemini Flash, nous recommandons d'utiliser des fichiers vidéo de moins de 25 Mo. Pour les fichiers plus volumineux, nous conseillons d'effectuer un traitement de compression de l'audio au préalable."
    },
    {
      question: "Comment puis-je intégrer les sous-titres générés à ma vidéo ?",
      answer: "Une fois le traitement terminé, vous pouvez télécharger les fichiers sous-titres au format SRT ou VTT. Ces fichiers peuvent être importés directement sur YouTube, Vimeo, VLC Player ou intégrés à vos logiciels de montage préférés."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <InstallPrompt />
      
      {/* GLOBAL HEADER / NAVBAR */}
      <nav id="navbar" className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="relative cursor-pointer select-none"
              onMouseDown={startSecretPress}
              onMouseUp={stopSecretPress}
              onMouseLeave={stopSecretPress}
              onTouchStart={startSecretPress}
              onTouchEnd={stopSecretPress}
              title="Maintenez le logo appuyé pendant 5 secondes pour déverrouiller l'accès"
            >
              <div className={`w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 transition-all duration-500 ${
                isPressingSecret ? 'scale-110 bg-indigo-700 ring-4 ring-indigo-250' : 'hover:scale-105'
              }`}>
                <Globe className={`w-5 h-5 ${isPressingSecret ? 'animate-spin text-amber-300' : 'animate-pulse'}`} />
              </div>
              {isPressingSecret && (
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow whitespace-nowrap z-50 font-mono animate-pulse uppercase tracking-wider">
                  Accès...
                </span>
              )}
            </div>
            <div className="cursor-pointer" onClick={() => setActiveTab('landing')}>
              <span className="font-bold text-lg tracking-tight text-zinc-900 block">Transcribe & Translate AI</span>
              <span className="text-[10px] uppercase tracking-widest text-indigo-600 font-semibold block">Solution Locale Intelligente</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
            <button onClick={() => { setActiveTab('landing'); setTimeout(() => document.getElementById('avantages')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-indigo-600 transition-colors cursor-pointer">Avantages</button>
            <button onClick={() => { setActiveTab('landing'); setTimeout(() => document.getElementById('fonctionnalites')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-indigo-600 transition-colors cursor-pointer">Fonctionnalités</button>
            <button onClick={() => { setActiveTab('landing'); setTimeout(() => document.getElementById('usages')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-indigo-600 transition-colors cursor-pointer">Cas d'usage</button>
            <button onClick={() => { setActiveTab('landing'); setTimeout(() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-indigo-600 transition-colors cursor-pointer">FAQ</button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-zinc-100 bg-white text-zinc-600 hover:text-indigo-600 hover:border-indigo-100 transition-all cursor-pointer"
              title="Partager l'application"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button 
              onClick={() => setActiveTab(activeTab === 'workspace' ? 'landing' : 'workspace')}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm flex items-center gap-2 cursor-pointer ${
                activeTab === 'workspace' 
                  ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 hover:shadow-indigo-200'
              }`}
            >
              {activeTab === 'workspace' ? (
                <>
                  <Laptop className="w-4 h-4" />
                  Présentation
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 animate-bounce" />
                  Lancer l'Application
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        
        {/* LANDING TAB VIEW */}
        {activeTab === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* HERO SECTION */}
            <header className="relative overflow-hidden pt-16 pb-20 px-6 max-w-7xl mx-auto">
              {/* Abstract decorative backgrounds */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-3xl -z-10" />
              <div className="absolute top-10 right-10 w-48 h-48 bg-emerald-50/60 rounded-full blur-2xl -z-10" />

              <div className="text-center max-w-3xl mx-auto">
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 font-semibold text-xs mb-6 uppercase tracking-wider"
                >
                  <SparklesIcon className="w-3.5 h-3.5" />
                  Productivité Maximale 100% Locale
                </motion.div>
                
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-zinc-900 mb-6 leading-[1.1]">
                  Vos Vidéos en Texte et <span className="text-indigo-600 bg-clip-text">Sous-titres</span> en Quelques Secondes
                </h1>
                
                <p className="text-zinc-600 text-lg md:text-xl font-normal leading-relaxed mb-8 max-w-2xl mx-auto">
                  Un outil de transcription intelligent, sécurisé et local qui convertit vos fichiers vidéo en textes traduits et sous-titres synchronisés sans quitter votre ordinateur.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button 
                    onClick={() => setActiveTab('workspace')}
                    className="btn-primary w-full sm:w-auto text-base flex items-center justify-center gap-2 group cursor-pointer shadow-lg shadow-indigo-200"
                  >
                    Essayer Maintenant Gratuitement
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => document.getElementById('avantages')?.scrollIntoView({ behavior: 'smooth' })}
                    className="btn-secondary w-full sm:w-auto text-base hover:bg-zinc-50 cursor-pointer"
                  >
                    Découvrir les Avantages
                  </button>
                </div>

                <div className="mt-8 flex justify-center items-center gap-6 text-zinc-500 text-sm">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Confidentialité Garantie</span>
                  <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> Aucun Abonnement</span>
                </div>
              </div>
            </header>

            {/* PRODUCT VALUE PROPOSITIONS */}
            <section id="avantages" className="py-16 px-6 bg-white border-y border-zinc-100">
              <div className="max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="text-3xl font-bold tracking-tight mb-4">Pourquoi choisir Transcribe & Translate AI ?</h2>
                  <p className="text-zinc-500 text-base">La puissance de l'IA de nouvelle génération combinée aux règles de sécurité locales indispensables pour vos données professionnelles ou académiques.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="p-8 rounded-2xl bg-zinc-50 border border-zinc-100 hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Sécurité & Confidentialité</h3>
                    <p className="text-zinc-600 text-sm leading-relaxed">
                      Vos fichiers vidéo bruts restent stockés en local dans votre architecture de fichiers. Idéal pour manipuler des contenus sensibles, des cours privés ou des interviews exclusives.
                    </p>
                  </div>

                  <div className="p-8 rounded-2xl bg-zinc-50 border border-zinc-100 hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6">
                      <Zap className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Vitesse d'Exécution IA</h3>
                    <p className="text-zinc-600 text-sm leading-relaxed">
                      L'outil appelle les API Gemini de Google pour une transcription quasi-instantanée et ultra-précise, couplée à une traduction sémantique fluide.
                    </p>
                  </div>

                  <div className="p-8 rounded-2xl bg-zinc-50 border border-zinc-100 hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6">
                      <FileCode className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Multi-Formats d'Export</h3>
                    <p className="text-zinc-600 text-sm leading-relaxed">
                      Générez en un clic des sous-titres synchronisés SRT/VTT pour vos vidéos de cours ou webinaires, ainsi que des synthèses de texte professionnelles en formats Word ou PDF.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* DETAILED FEATURES (BENTO GRID STYLE) */}
            <section id="fonctionnalites" className="py-20 px-6 max-w-7xl mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl font-bold tracking-tight mb-4">Fonctionnalités Clés et Outils Professionnels</h2>
                <p className="text-zinc-500">Un écosystème de fonctionnalités complémentaires conçues pour rationaliser votre travail quotidien de traitement des supports vidéo.</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Feature 1 */}
                <div className="glass rounded-3xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4 font-bold">01</div>
                    <h4 className="text-lg font-bold mb-2">Générateur de Transcription</h4>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                      Glissez-déposez vos fichiers vidéo de cours, d'interviews ou de présentations. L'IA extrait automatiquement les dialogues avec une détection précise de la langue source.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-1.5 text-xs font-mono text-indigo-600">
                    <span>TIMESTAMPS PRÉCIS</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    <span>DÉTECTION AUTOMATIQUE</span>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="glass rounded-3xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4 font-bold">02</div>
                    <h4 className="text-lg font-bold mb-2">Générateur de Traduction</h4>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                      Bénéficiez d'une traduction française fidèle et contextuelle. Les structures de phrases typiques et le jargon technique sont traduits de manière parfaitement naturelle.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-1.5 text-xs font-mono text-indigo-600">
                    <span>CORRESPONDANCE TEMPORELLE</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    <span>NATURALITÉ FRANÇAISE</span>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="glass rounded-3xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4 font-bold">03</div>
                    <h4 className="text-lg font-bold mb-2">Générateur de Sous-titres</h4>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                      Créez des fichiers SRT et VTT synchronisés. Idéal pour ajouter rapidement des sous-titres sur YouTube, de l'edTech, ou des plateformes e-learning sans passer par des prestataires.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-1.5 text-xs font-mono text-indigo-600">
                    <span>SRT SYNCHRONISÉ</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    <span>VTT STANDARD</span>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="glass rounded-3xl p-6 flex flex-col justify-between md:col-span-2 lg:col-span-3">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4 font-bold">04</div>
                      <h4 className="text-xl font-bold mb-3">Export Word & PDF Structuré</h4>
                      <p className="text-zinc-500 text-sm leading-relaxed">
                        Pour chaque vidéo traitée, exportez un document double structuré contenant à la fois la transcription originale de vos voix-off et la traduction française fluide. Parfait pour vos comptes-rendus, notes de cours ou scripts d'intégration.
                      </p>
                    </div>
                    <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl flex flex-col gap-2 shadow-sm">
                      <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 py-1 px-2.5 rounded-full w-max">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Fichier prêt pour téléchargement local
                      </div>
                      <div className="text-sm font-semibold tracking-wide text-zinc-700 font-mono mt-1">transcription_traduction.docx</div>
                      <div className="text-xs text-zinc-400">Structuration de chapitrage générée automatiquement en Word & PDF avec styles de typographie intégrés.</div>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* REAL-WORLD USE CASES */}
            <section id="usages" className="py-20 px-6 bg-indigo-900 text-white rounded-t-[2.5rem] relative overflow-hidden">
              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-indigo-850 rounded-full blur-3xl -z-10" />
              <div className="max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Qui utilise notre solution ?</h2>
                  <p className="text-indigo-200">Des parcours utilisateurs pensés pour répondre à des objectifs d'apprentissage et de distribution de contenu.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-indigo-300">
                      <BookOpen className="w-5 h-5" /> Étudiants & Chercheurs
                    </h3>
                    <p className="text-indigo-100/80 text-sm leading-relaxed">
                      "Un étudiant convertit une conférence universitaire de 2 heures en anglais en un document de synthèse Word structuré avec traduction française juxtaposée en un clin d'œil."
                    </p>
                  </div>

                  <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-indigo-300">
                      <Video className="w-5 h-5" /> Créateurs de Contenu
                    </h3>
                    <p className="text-indigo-100/80 text-sm leading-relaxed">
                      "Un créateur de vidéos de formation génère des fichiers de sous-titres SRT multilingues de haute qualité en quelques clics pour maximiser son référencement sur YouTube."
                    </p>
                  </div>

                  <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-indigo-300">
                      <Monitor className="w-5 h-5" /> Professionnels & RH
                    </h3>
                    <p className="text-indigo-100/80 text-sm leading-relaxed">
                      "Un recruteur ou un traducteur transcrit de longs entretiens vidéos en anglais et génère un rapport papier PDF clair et confidentiel sans aucun stockage cloud externe."
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="comment-ca-marche" className="py-20 px-6 max-w-7xl mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl font-bold tracking-tight mb-4">Comment ça fonctionne ?</h2>
                <p className="text-zinc-500">Un parcours ultra-simple en 3 étapes clés pour générer tous vos documents.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-12 relative">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-lg font-bold mb-6">
                    1
                  </div>
                  <h4 className="text-lg font-bold mb-2">Importez la Vidéo</h4>
                  <p className="text-zinc-500 text-sm">
                    Sélectionnez votre fichier .mp4, .mov, ou tout autre format audio/vidéo présent sur votre ordinateur.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-lg font-bold mb-6">
                    2
                  </div>
                  <h4 className="text-lg font-bold mb-2">Lancer le Traitement</h4>
                  <p className="text-zinc-500 text-sm">
                    L'intelligence artificielle Gemini analyse les fréquences sonores, effectue la transcription et traduit le texte.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-lg font-bold mb-6">
                    3
                  </div>
                  <h4 className="text-lg font-bold mb-2">Exportez vos Documents</h4>
                  <p className="text-zinc-500 text-sm">
                    Téléchargez instantanément vos fichiers sous-titres (SRT, VTT) ou vos rapports (Word, PDF) enrichis.
                  </p>
                </div>
              </div>
            </section>

            {/* FAQ SECTION Accordion */}
            <section id="faq" className="py-20 px-6 bg-zinc-100/50 border-y border-zinc-200">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold tracking-tight mb-4">Foire Aux Questions (FAQ)</h2>
                  <p className="text-zinc-500">Toutes les réponses à vos questions techniques et pratiques.</p>
                </div>

                <div className="space-y-4">
                  {faqData.map((item, index) => (
                    <div 
                      key={index} 
                      className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm transition-all"
                    >
                      <button 
                        onClick={() => setExpandedFaqIndex(expandedFaqIndex === index ? null : index)}
                        className="w-full px-6 py-4 text-left flex justify-between items-center font-semibold text-zinc-800 hover:text-indigo-600 transition-colors"
                      >
                        <span>{item.question}</span>
                        <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform ${expandedFaqIndex === index ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence initial={false}>
                        {expandedFaqIndex === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="px-6 pb-6 text-zinc-600 text-sm leading-relaxed border-t border-zinc-100 pt-4 bg-zinc-50/50">
                              {item.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* CALL TO ACTION */}
            <section className="py-16 px-6 max-w-5xl mx-auto text-center">
              <div className="bg-indigo-600 rounded-3xl p-12 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500 rounded-full blur-2xl" />
                <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">Prêt à transformer vos vidéos en documents ?</h2>
                <p className="text-indigo-100 max-w-2xl mx-auto mb-8 relative z-10">
                  Démarrez sans plus attendre votre premier traitement. Aucun paramétrage, aucune inscription. Simple, rapide et 100% confidentiel.
                </p>
                <button 
                  onClick={() => setActiveTab('workspace')}
                  className="bg-white text-indigo-600 font-semibold px-8 py-4 rounded-2xl shadow-lg hover:bg-zinc-50 active:scale-95 transition-all text-base inline-flex items-center gap-2 cursor-pointer relative z-10"
                >
                  <Video className="w-5 h-5 animate-pulse" />
                  Accéder à la console locale
                </button>
              </div>
            </section>
          </motion.div>
        )}

        {/* ACTIVE WORKSPACE / COMPONENT PROCESSING TAB VIEW */}
        {activeTab === 'workspace' && (
          <motion.div
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-5xl mx-auto px-4 md:px-8 py-10"
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Console de Commande Locale</h2>
                <p className="text-zinc-500 text-sm">Glissez ou uploadez un fichier vidéo pour commencer l'extraction IA.</p>
              </div>
              <button 
                onClick={() => { setFile(null); setResult(null); setTranslation(null); }}
                className="text-xs text-zinc-400 hover:text-zinc-600 font-medium py-1.5 px-3 border border-zinc-200 bg-white rounded-lg transition-colors cursor-pointer"
              >
                Réinitialiser la console
              </button>
            </div>

            <main className="grid gap-8">
               {/* Upload Section */}
              <section className="glass rounded-3xl p-8 text-center">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer ${
                    isDragging 
                      ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01] shadow-lg shadow-indigo-50'
                      : file 
                        ? 'border-indigo-300 bg-indigo-50/30' 
                        : 'border-zinc-200 hover:border-indigo-300 hover:bg-zinc-50'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="video/*"
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                      isDragging 
                        ? 'bg-indigo-600 text-white scale-110 shadow-md' 
                        : 'bg-indigo-100 text-indigo-600'
                    }`}>
                      {isDragging ? (
                        <Upload className="w-8 h-8 animate-bounce" />
                      ) : file ? (
                        <FileVideo className="w-8 h-8" />
                      ) : (
                        <Upload className="w-8 h-8" />
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-semibold transition-colors duration-150">
                        {isDragging 
                          ? "Relâchez votre fichier ici" 
                          : file 
                            ? file.name 
                            : "Glissez-déposez votre vidéo ici ou cliquez pour la sélectionner"}
                      </p>
                      <p className="text-zinc-400 text-sm mt-1">
                        MP4, MOV, AVI, MKV (Max 25MB recommandé pour Gemini Flash)
                      </p>
                    </div>
                  </div>
                </div>

                {file && !result && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 flex justify-center"
                  >
                    <button 
                      onClick={processVideo}
                      disabled={isProcessing}
                      className="btn-primary"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Traitement en cours...
                        </>
                      ) : (
                        <>
                          <Languages className="w-5 h-5" />
                          Lancer la transcription
                        </>
                      )}
                    </button>
                  </motion.div>
                )}

                {isProcessing && (
                  <div className="mt-8">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-zinc-500 font-medium">{status}</span>
                      <span className="text-indigo-600 font-bold">{progress}%</span>
                    </div>
                    <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-indigo-600"
                      />
                    </div>
                  </div>
                )}
              </section>

              {/* Results Section */}
              <AnimatePresence>
                {result && translation && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid gap-8"
                  >
                     {/* Actions */}
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-4 justify-center">
                        <button 
                          onClick={() => downloadFile(generateSRT(translation), 'subtitles.srt', 'text/plain')}
                          className="btn-secondary"
                        >
                          <FileCode className="w-5 h-5 text-indigo-600" /> SRT
                        </button>
                        <button 
                          onClick={() => downloadFile(generateVTT(translation), 'subtitles.vtt', 'text/vtt')}
                          className="btn-secondary"
                        >
                          <FileCode className="w-5 h-5 text-indigo-600" /> VTT
                        </button>
                        <button 
                          onClick={() => generateDocx(result, translation)}
                          className="btn-secondary"
                        >
                          <FileText className="w-5 h-5 text-indigo-600" /> Word (.docx)
                        </button>
                        <button 
                          onClick={() => generatePdf(result, translation)}
                          className="btn-secondary"
                        >
                          <Download className="w-5 h-5 text-indigo-600" /> PDF
                        </button>
                      </div>
                      <div className="flex justify-center">
                        <FeatureRating featureId="export" featureName="Génération d'Exports" ratingType="stars" />
                      </div>
                    </div>
 
                     {/* Preview */}
                     <div className="grid md:grid-cols-2 gap-6">
                       <div className="glass rounded-3xl p-6 flex flex-col justify-between">
                         <div>
                           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                             <History className="w-5 h-5 text-indigo-600" />
                             Original ({result.language})
                           </h3>
                           <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                             {result.segments.map((s, i) => (
                               <div key={i} className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                                 <span className="text-[10px] font-mono text-indigo-500 block mb-1">
                                   {s.start} - {s.end}
                                 </span>
                                 <p className="text-sm text-zinc-700">{s.text}</p>
                               </div>
                             ))}
                           </div>
                         </div>
                         <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-center">
                           <FeatureRating featureId="transcription" featureName="Transcription Vocale" />
                         </div>
                       </div>
 
                       <div className="glass rounded-3xl p-6 flex flex-col justify-between">
                         <div>
                           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                             <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                             Traduction (Français)
                           </h3>
                           <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                             {translation.map((s, i) => (
                               <div key={i} className="p-3 rounded-xl bg-emerald-50/30 border border-emerald-100">
                                 <span className="text-[10px] font-mono text-emerald-600 block mb-1">
                                   {s.start} - {s.end}
                                 </span>
                                 <p className="text-sm text-zinc-700">{s.text}</p>
                               </div>
                             ))}
                           </div>
                         </div>
                         <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-center">
                           <FeatureRating featureId="translation" featureName="Traduction Française" />
                         </div>
                       </div>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </motion.div>
        )}

        {/* ADMIN FEEDBACK DASHBOARD TAB VIEW */}
        {activeTab === 'admin' && (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-6xl mx-auto px-4 md:px-8 py-10"
          >
            <AdminFeedbackDashboard />
          </motion.div>
        )}

        {/* CHANGELOG TAB VIEW */}
        {activeTab === 'changelog' && (
          <motion.div
            key="changelog"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto px-4 md:px-8 py-20"
          >
            <Changelog />
          </motion.div>
        )}

      </AnimatePresence>

      <footer className="mt-20 pb-10 text-center text-zinc-400 text-sm border-t border-zinc-100 pt-8 max-w-7xl mx-auto px-6">
        <p>© 2026 Transcribe & Translate AI - Solution de traitement local sécurisée</p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <p className="text-xs text-zinc-300">Version 1.1.0 - Équipé de Gemini Flash</p>
          <span className="text-zinc-200">|</span>
          <button 
            onClick={() => setActiveTab('changelog')}
            className="text-xs text-indigo-400 hover:text-indigo-600 underline underline-offset-4 cursor-pointer"
          >
            Notes de version
          </button>
        </div>
      </footer>

      {/* COMPOSANT PERSISTANT GLOBAL DE SIGNALEMENT FEEDBACK ROUTABLE */}
      <FeedbackFab />
    </div>
  );
}

// Sparkles local SVG icon to avoid missing export issues
function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" />
    </svg>
  );
}
