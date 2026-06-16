import React, { useState, useEffect } from 'react'; // Import standard React et Hooks
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts'; // Importation des outils graphiques interactifs Recharts
import { 
  Shield, MessageSquare, Bug, Lightbulb, PlusCircle, Smile, Meh, Frown, 
  Search, Filter, CheckCircle2, AlertCircle, RefreshCw, ChevronRight, 
  Clock, Trash2, Calendar, HardDrive, Laptop, Mail, Info 
} from 'lucide-react'; // Import des icônes pour structurer le dashboard d'administration

// Interface typée décrivant un feedback en base de données
interface Feedback {
  id: string;
  type: 'bug' | 'suggestion' | 'feature' | 'general';
  rating_stars: number | null;
  rating_emoji: 'happy' | 'neutral' | 'sad' | null;
  message: string;
  page_context: string;
  app_version: string;
  browser: string;
  device: string;
  user_email: string | null;
  status: 'Nouveau' | 'En cours' | 'Planifié' | 'Résolu' | 'Rejeté';
  created_at: string;
}

// Interface typée décrivant les statistiques agrégées de notation renvoyées par l'API
interface RatingStats {
  stars: Array<{ feature_id: string; avg_rating: number; total_ratings: number }>;
  emojis: Array<{ feature_id: string; rating_value: string; count: number }>;
}

export default function AdminFeedbackDashboard() {
  // Liste exhaustive des feedbacks chargés en mémoire
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]); 
  // Statistiques de satisfaction des fonctionnalités clés issues de la notation
  const [stats, setStats] = useState<RatingStats | null>(null); 
  // Spinner de chargement de la base SQLite
  const [loading, setLoading] = useState<boolean>(true); 
  // Message stockant d'éventuels échecs de requêtes serveur
  const [errorMsg, setErrorMsg] = useState<string | null>(null); 
  
  // Clé d'accréditation administrateur mémorisée dans la session de l'onglet actif (Conforme RGPD / sécurité locale)
  const [adminKey, setAdminKey] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? sessionStorage.getItem('admin_access_key') : null;
  });
  // Code d'administration saisi dans le champ d'authentification
  const [enteredPass, setEnteredPass] = useState<string>('');
  // Erreur liée à une mauvaise saisie de mot de passe
  const [authError, setAuthError] = useState<string | null>(null);
  // Spinner de chargement lors d'une vérification de mot de passe
  const [verifying, setVerifying] = useState<boolean>(false);
  // Ticket ciblée pour demande de suppression définitive (Validation physique sous l'Article 17 du RGPD)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // States de filtres et recherche
  const [statusFilter, setStatusFilter] = useState<string>(''); // Filtre par statut ('Nouveau', 'En cours', etc.)
  const [typeFilter, setTypeFilter] = useState<string>(''); // Filtre par type de feedback ('bug', 'suggestion', etc.)
  const [searchQuery, setSearchQuery] = useState<string>(''); // Barre de saisie textuelle multicritères

  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null); // Ticket mis en surbrillance pour examen détaillé
  const [updatingId, setUpdatingId] = useState<string | null>(null); // Ticket en cours de réecriture du statut sur le serveur

  // Déconnexion de l'état administrateur (Effaçage de la session et retour sur l'écran d'accueil)
  const handleLogout = () => {
    setAdminKey(null); // Nettoyage de la clé d'accréditation
    sessionStorage.removeItem('admin_access_key'); // Suppression physique du stockage temporaire
    setEnteredPass(''); // Reset du formulaire de saisie
    setAuthError(null); // Raz erreurs
  };

  // Traiter la soumission du mot de passe admin de garde d'accès
  const handleVerifyAdmin = async (e: React.FormEvent) => {
    e.preventDefault(); // Annulation de l'event standard de soumission
    if (!enteredPass) return; // Ne rien faire si vide
    setVerifying(true); // Bloquer avec un spinner local
    setAuthError(null); // Reset d'erreurs précédentes
    try {
      // Émission d'une comparaison sécurisée backend
      const res = await fetch('/api/admin/verify', {
        method: 'POST', // Méthode de création
        headers: { 'Content-Type': 'application/json' }, // Format JSON
        body: JSON.stringify({ secret: enteredPass }), // Passkey brute à tester
      });
      if (!res.ok) { // Échec en cas de de 403 / 401
        throw new Error('Code de sécurité incorrect.'); // Alerte
      }
      const data = await res.json(); // Lecture brute du JSON
      if (data.success && data.token) { // Si succès et token récupéré
        setAdminKey(data.token); // Enregistrement en mémoire réactive
        sessionStorage.setItem('admin_access_key', data.token); // Persistance locale
      } else {
        throw new Error('Vérification invalide.'); // Alerte système
      }
    } catch (err: any) {
      setAuthError(err.message || 'Clé refusée par le serveur.'); // Message d'alerte visuel
    } finally {
      setVerifying(false); // Retrait du loader
    }
  };

  // Charger les données au montage ou à chaque actualisation des filtres/recherches
  const fetchData = async () => {
    if (!adminKey) return; // Sécurisation préventive pour éviter d'émettre des requêtes inutiles
    setLoading(true); // Activer le spinner
    setErrorMsg(null); // Nettoyer les erreurs
    try {
      // 1. Appel API pour charger les feedbacks rattachables avec la clé admin dans le header
      const url = `/api/feedback?status=${statusFilter}&type=${typeFilter}&search=${encodeURIComponent(searchQuery)}`;
      const fRes = await fetch(url, {
        headers: { 'x-admin-key': adminKey } // Autorisation d'accès locale SQLite
      });
      if (fRes.status === 401) { // Si rejeté par changement de secrets à chaud
        handleLogout(); // Déconnexion automatique pour des raisons de sécurité
        throw new Error('Données restreintes. Veuillez vous reconnecter.');
      }
      if (!fRes.ok) throw new Error('Impossible de récupérer la liste des feedbacks.');
      const fData = await fRes.json(); // Lecture brute
      setFeedbacks(fData); // Mise en mémoire locale

      // 2. Appel API pour récupérer les statistiques de satisfaction avec la clé admin associée
      const sRes = await fetch('/api/feature-rating/stats', {
        headers: { 'x-admin-key': adminKey } // Autorisation d meure
      });
      if (sRes.ok) { // Si disponible
        const sData = await sRes.json(); // Lecture brute
        setStats(sData); // Mise à jour de Recharts
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erreur d\'autorisation lors du chargement des feedbacks.');
    } finally {
      setLoading(false); // Mode chargement désactivé
    }
  };

  // Lancer le chargement à l'init du composant ou au changement des filtres, de la recherche ou du privilège admin
  useEffect(() => {
    fetchData();
  }, [statusFilter, typeFilter, searchQuery, adminKey]);

  // Fonction pour modifier le statut d'un feedback à chaud
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id); // Marquage en cours de modification
    try {
      // Modification asynchrone sécurisée par clé admin
      const res = await fetch(`/api/feedback/${id}/status`, {
        method: 'PATCH', // Changement chirurgical
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-key': adminKey || '' // Clé d'autorisation
        },
        body: JSON.stringify({ status: newStatus }), // Nouveau statut
      });

      if (res.status === 401) { // Non autorisé
        handleLogout(); // Déconnecter
        throw new Error('Vous n’avez plus le jeton d’accréditation nécessaire.');
      }
      if (!res.ok) throw new Error('Impossible de mettre à jour le statut.');
      
      // Actualiser le state local pour éviter de re-interroger toute la base SQLite
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: newStatus as any } : f));
      if (selectedFeedback && selectedFeedback.id === id) {
        setSelectedFeedback(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (err: any) {
      alert(err.message || 'Une erreur est survenue lors de la mise à jour.');
    } finally {
      setUpdatingId(null); // Fin modification
    }
  };

  // Suppression absolue du feedback (Article 17 du RGPD - Droit à l'effacement ou retrait d'un contenu)
  const handleDeleteFeedback = async (id: string) => {
    try {
      // Ordre d'effacement physique transmis au service centralisé Express/SQLite
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'DELETE', // Demande de destructions
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-key': adminKey || '' // Validation d'accréditation admin
        }
      });
      if (res.status === 401) { // Session expirée
        handleLogout(); // Fermer la session
        throw new Error('Session expirée ou non autorisée.'); // Alerte
      }
      if (!res.ok) throw new Error('Impossible de purger l’élément de la base SQLite.');

      // Ré-évaluation à chaud du tableau local de données
      setFeedbacks(prev => prev.filter(f => f.id !== id)); // Suppression locale
      setSelectedFeedback(null); // Fermer le panneau de détail devenu caduc
      setConfirmDeleteId(null); // Raz confirmation
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression physique.');
    }
  };

  // Convertir le type brut de feedback en fiches visuelles conviviales
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'bug':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 text-rose-600 border border-rose-150"><Bug className="w-3.5 h-3.5" /> Bug</span>;
      case 'suggestion':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-150"><Lightbulb className="w-3.5 h-3.5" /> Suggestion</span>;
      case 'feature':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-150"><PlusCircle className="w-3.5 h-3.5" /> Fonctionnalité</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-600 border border-amber-150"><Smile className="w-3.5 h-3.5" /> Avis Général</span>;
    }
  };

  // Convertir le statut en pastille stylisée pour un meilleur contrôle
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Nouveau':
        return <span className="text-xs bg-sky-100 text-sky-800 font-bold px-2 py-1 rounded shadow-sm">Nouveau</span>;
      case 'En cours':
        return <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-1 rounded shadow-sm">En cours</span>;
      case 'Planifié':
        return <span className="text-xs bg-indigo-100 text-indigo-850 font-bold px-2 py-1 rounded shadow-sm">Planifié</span>;
      case 'Résolu':
        return <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded shadow-sm">Résolu</span>;
      case 'Rejeté':
        return <span className="text-xs bg-zinc-200 text-zinc-800 font-bold px-2 py-1 rounded shadow-sm">Rejeté</span>;
      default:
        return <span className="text-xs bg-zinc-100 text-zinc-600 font-bold px-2 py-1 rounded">{status}</span>;
    }
  };

  // Formater les statistiques pour la consommation par Recharts
  const pieChartData = [
    { name: 'Bugs', value: feedbacks.filter(f => f.type === 'bug').length, color: '#f43f5e' },
    { name: 'Suggestions', value: feedbacks.filter(f => f.type === 'suggestion').length, color: '#4f46e5' },
    { name: 'Features', value: feedbacks.filter(f => f.type === 'feature').length, color: '#10b981' },
    { name: 'Avis Généraux', value: feedbacks.filter(f => f.type === 'general').length, color: '#f59e0b' },
  ].filter(item => item.value > 0); // Exclure les types absents de la base pour éviter les segments vides

  // Formater l'évolution de satisfaction des modules clés
  const starsStatsData = stats?.stars.map(s => {
    let friendlyName = s.feature_id;
    if (s.feature_id === 'transcription') friendlyName = 'Transcribe';
    else if (s.feature_id === 'translation') friendlyName = 'Translate';
    else if (s.feature_id === 'export') friendlyName = 'Exports';
    else if (s.feature_id === 'ui') friendlyName = 'Ergonomie';
    return {
      name: friendlyName,
      moyenne: parseFloat(s.avg_rating.toFixed(2)),
      total: s.total_ratings,
    };
  }) || [];

  if (!adminKey) { // Si aucune clé d’habilitation n’est fournie ou active en mémoire
    return ( // Retourner l'écran d'accès exclusif de garde sécurité
      <div className="max-w-md mx-auto py-20 px-4">
        <div id="admin-security-gate" className="bg-white rounded-3xl border border-zinc-250 p-8 shadow-2xl text-center space-y-6">
          <div className="w-14 h-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-zinc-150">
            <Shield className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Console d'Audit et Sécurité</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Veuillez introduire la clé d'habilitation système configurée via la clé <code className="bg-zinc-100 text-indigo-600 px-1 rounded font-mono font-bold">ADMIN_PASSWORD</code> du projet pour accéder aux feedbacks.
            </p>
          </div>
          <form onSubmit={handleVerifyAdmin} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">Clé Secrète Habilitée</label>
              <input
                id="admin-password-box"
                type="password"
                required
                value={enteredPass}
                onChange={(e) => setEnteredPass(e.target.value)}
                placeholder="Entrez le code d’audit..."
                className="w-full text-xs font-mono p-3 rounded-xl border border-zinc-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 bg-zinc-50 text-center"
              />
            </div>
            {authError && ( // Message d'alerte en cas de mauvaise comparaison de la passkey
              <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                {authError}
              </p>
            )}
            <button
              id="admin-unlock-btn"
              type="submit"
              disabled={verifying}
              className="w-full py-3 bg-zinc-950 hover:bg-zinc-805 text-white font-semibold rounded-xl text-xs shadow-md shadow-zinc-150 hover:shadow-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {verifying ? 'Validation cryptique...' : 'Déverrouiller l’accès'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* SECTION BANNIÈRE D'ACCÈS CONDUITE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Panneau d'Administration Feedbacks</h2>
            <p className="text-zinc-400 text-xs">Suivi, priorisation et audit des requêtes utilisateurs (Interfaçage SQLite).</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors flex items-center gap-2 text-xs cursor-pointer"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-lg border border-rose-900 bg-rose-950/35 text-rose-350 hover:text-white hover:bg-rose-900 transition-colors flex items-center gap-2 text-xs cursor-pointer"
            title="Fermer la session administrative sécurisée"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* BLOCS KPI DE BASE (CONTRÔLE RAPIDE) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Nouveaux tickets */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-250 shadow-sm flex flex-col justify-between">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider font-mono">Derniers reçus</span>
          <span className="text-3xl font-extrabold text-indigo-600 mt-2">{feedbacks.length}</span>
          <span className="text-[10px] text-zinc-400 mt-1">Éléments correspondants aux filtres</span>
        </div>

        {/* KPI 2 : Évaluation moyenne */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-250 shadow-sm flex flex-col justify-between">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider font-mono">Note Globale Actuelle</span>
          <span className="text-3xl font-extrabold text-amber-500 mt-2">
            {feedbacks.filter(f => f.rating_stars !== null).length > 0
              ? (feedbacks.filter(f => f.rating_stars !== null).reduce((acc, current) => acc + (current.rating_stars || 0), 0) / feedbacks.filter(f => f.rating_stars !== null).length).toFixed(1)
              : 'N/A'
            }
            <span className="text-sm font-semibold text-zinc-400"> / 5★</span>
          </span>
          <span className="text-[10px] text-zinc-400 mt-1">Calculée sur l'échantillon chargé</span>
        </div>

        {/* KPI 3 : Bugs ouverts */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-250 shadow-sm flex flex-col justify-between">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider font-mono">Bugs en attente</span>
          <span className="text-3xl font-extrabold text-rose-500 mt-2">
            {feedbacks.filter(f => f.type === 'bug' && f.status !== 'Résolu' && f.status !== 'Rejeté').length}
          </span>
          <span className="text-[10px] text-zinc-400 mt-1">Nécesitent un correctif de dev</span>
        </div>

        {/* KPI 4 : Résorptions réussies */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-250 shadow-sm flex flex-col justify-between">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider font-mono">Tickets Résolus</span>
          <span className="text-3xl font-extrabold text-emerald-500 mt-2">
            {feedbacks.filter(f => f.status === 'Résolu').length}
          </span>
          <span className="text-[10px] text-zinc-400 mt-1">Validés pour déploiement local</span>
        </div>
      </div>

      {/* INTERVIEWS GRAPHIQUES AVEC RECHARTS */}
      {feedbacks.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* GRAPHIQUE 1 : Répartition des types de feedbacks */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-250 shadow-sm">
            <h3 className="font-bold text-sm text-zinc-800 mb-4 uppercase tracking-wider font-mono flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-indigo-600" /> Répartition des signalements
            </h3>
            {pieChartData.length > 0 ? (
              <div className="h-[250px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-zinc-400 text-xs">Veuillez collecter plus de données.</div>
            )}
          </div>

          {/* GRAPHIQUE 2 : Satisfaction moyenne sur les modules clés */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-250 shadow-sm">
            <h3 className="font-bold text-sm text-zinc-800 mb-4 uppercase tracking-wider font-mono flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-indigo-600" /> Note de satisfaction par module
            </h3>
            {starsStatsData.length > 0 ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={starsStatsData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} />
                    <YAxis stroke="#a1a1aa" domain={[0, 5]} fontSize={11} tickLine={false} />
                    <Tooltip formatter={(value) => [`${value}★`, 'Moyenne']} />
                    <Bar dataKey="moyenne" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-zinc-400 text-xs">Aucune évaluation de fonctionnalité disponible.</div>
            )}
          </div>

        </div>
      )}

      {/* CONTROLES ET RECHERCHE */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Rechercher par message, email d'auteur, référence de ticket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-sans pl-10 pr-4 py-3 border border-zinc-200 outline-none rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 bg-zinc-50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filtre par Type */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs p-2.5 border border-zinc-200 rounded-xl outline-none focus:border-indigo-500 bg-white"
              >
                <option value="">Tous les types</option>
                <option value="bug">Bugs</option>
                <option value="suggestion">Suggestions</option>
                <option value="feature">Fonctionnalités</option>
                <option value="general">Avis généraux</option>
              </select>
            </div>

            {/* Filtre par Statut */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs p-2.5 border border-zinc-200 rounded-xl outline-none focus:border-indigo-500 bg-white"
            >
              <option value="">Tous les statuts</option>
              <option value="Nouveau">Nouveau</option>
              <option value="En cours">En cours</option>
              <option value="Planifié">Planifié</option>
              <option value="Résolu">Résolu</option>
              <option value="Rejeté">Rejeté</option>
            </select>
          </div>
        </div>
      </div>

      {/* CONTROLES DE LA LISTE ET DETAIL COMBINES */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE / LISTE DÉROULANTE */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm h-max">
          <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50 flex justify-between items-center">
            <h3 className="font-bold text-sm tracking-tight text-zinc-800">Tickets feedbacks récents ({feedbacks.length})</h3>
            <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase block">SQLite DB</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-zinc-400 text-xs flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" /> Charge les feedbacks de la base...
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="p-16 text-center text-zinc-400 text-sm">
              <Info className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
              Aucun feedback correspondant dans la base de données.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 max-h-[600px] overflow-y-auto custom-scrollbar">
              {feedbacks.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedFeedback(item)}
                  className={`p-5 transition-colors cursor-pointer text-left flex gap-4 ${
                    selectedFeedback?.id === item.id ? 'bg-indigo-50/20' : 'hover:bg-zinc-50'
                  }`}
                >
                  <div className="shrink-0 pt-0.5">
                    {item.type === 'bug' && <Bug className="w-5 h-5 text-rose-500" />}
                    {item.type === 'suggestion' && <Lightbulb className="w-5 h-5 text-indigo-500" />}
                    {item.type === 'feature' && <PlusCircle className="w-5 h-5 text-emerald-500" />}
                    {item.type === 'general' && <Smile className="w-5 h-5 text-amber-500" />}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-600">{item.id}</span>
                      <span className="text-[10px] font-mono text-zinc-400">{new Date(item.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>

                    <p className="text-xs font-normal text-zinc-700 truncate">{item.message}</p>

                    <div className="flex items-center justify-between gap-2 pt-1.5 flex-wrap">
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                        {item.user_email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {item.user_email}</span>}
                        {item.rating_stars && <span className="text-amber-500">★ {item.rating_stars}/5</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {getTypeBadge(item.type)}
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLONNE DROITE / PANEL COMPLET EXAMEN DETAIL */}
        <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm p-6 h-max space-y-6">
          <div className="border-b border-zinc-150 pb-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-400 font-mono">Détails d'Examen</h3>
          </div>

          {selectedFeedback ? (
            <div className="space-y-6 text-left">
              {/* Type, Id et pastille */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <span className="text-[10px] text-zinc-400 font-mono block">Ticket ID</span>
                  <span className="text-sm font-mono font-bold text-indigo-600">{selectedFeedback.id}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getTypeBadge(selectedFeedback.type)}
                  {getStatusBadge(selectedFeedback.status)}
                </div>
              </div>

              {/* Rédacteur */}
              <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-600 uppercase text-xs shrink-0">
                  {selectedFeedback.user_email ? selectedFeedback.user_email[0] : '?'}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-405 font-medium block">Auteur connecté</span>
                  <span className="text-xs text-zinc-700 font-bold break-all block">{selectedFeedback.user_email || 'Anonymisé (Conforme RGPD)'}</span>
                </div>
              </div>

              {/* Score Étoile & Mood */}
              {(selectedFeedback.rating_stars || selectedFeedback.rating_emoji) && (
                <div className="grid grid-cols-2 gap-3 py-1">
                  {selectedFeedback.rating_stars && (
                    <div className="bg-amber-50/40 border border-amber-100 p-2.5 rounded-xl text-center">
                      <span className="text-[9px] font-bold tracking-wider text-amber-600 font-mono block">NOTE</span>
                      <span className="text-base font-bold text-amber-500">{'★'.repeat(selectedFeedback.rating_stars)}</span>
                    </div>
                  )}

                  {selectedFeedback.rating_emoji && (
                    <div className="bg-emerald-50/40 border border-emerald-100 p-2.5 rounded-xl text-center flex flex-col items-center justify-center">
                      <span className="text-[9px] font-bold tracking-wider text-emerald-600 font-mono block">HUMEUR</span>
                      <div className="text-emerald-600 mt-1">
                        {selectedFeedback.rating_emoji === 'happy' && <Smile className="w-5 h-5" />}
                        {selectedFeedback.rating_emoji === 'neutral' && <Meh className="w-5 h-5" />}
                        {selectedFeedback.rating_emoji === 'sad' && <Frown className="w-5 h-5" />}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Message de Feedback */}
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono block">Message de l'utilisateur :</span>
                <p className="text-xs bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-zinc-800 leading-relaxed max-h-[180px] overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                  {selectedFeedback.message}
                </p>
              </div>

              {/* Diagnostics */}
              <div className="space-y-2 border-t border-zinc-100 pt-4">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono block">Diagnostic réseau/machine :</span>
                
                <div className="space-y-1.5 text-[10px] text-zinc-500 font-mono">
                  <div className="flex justify-between py-0.5 border-b border-zinc-50"><span className="text-zinc-400">Date d'édition :</span><span>{new Date(selectedFeedback.created_at).toLocaleString('fr-FR')}</span></div>
                  <div className="flex justify-between py-0.5 border-b border-zinc-50"><span className="text-zinc-400">Context Scope :</span><span>{selectedFeedback.page_context}</span></div>
                  <div className="flex justify-between py-0.5 border-b border-zinc-50"><span className="text-zinc-400">Navigateur :</span><span>{selectedFeedback.browser || 'Anonymisé (Option active)'}</span></div>
                  <div className="flex justify-between py-0.5 border-b border-zinc-50"><span className="text-zinc-400">Machine OS :</span><span>{selectedFeedback.device || 'Anonymisé (Option active)'}</span></div>
                  <div className="flex justify-between py-0.5"><span className="text-zinc-400">Version Application :</span><span>v{selectedFeedback.app_version}</span></div>
                </div>
              </div>

              {/* Changer de Statut */}
              <div className="space-y-2 border-t border-zinc-100 pt-4">
                <span className="text-[10px] text-zinc-455 font-bold uppercase tracking-wider font-mono block">Mettre à jour le Statut :</span>
                <div className="grid grid-cols-2 gap-2">
                  {['Nouveau', 'En cours', 'Planifié', 'Résolu', 'Rejeté'].map((statusOption) => (
                    <button
                      key={statusOption}
                      id={`status-mod-${selectedFeedback.id}-${statusOption}`}
                      disabled={updatingId !== null}
                      onClick={() => handleUpdateStatus(selectedFeedback.id, statusOption)}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${
                        selectedFeedback.status === statusOption
                          ? 'bg-zinc-900 border border-zinc-950 text-white shadow-sm'
                          : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-650 border border-zinc-200'
                      }`}
                    >
                      {updatingId === selectedFeedback.id && selectedFeedback.status === statusOption ? '...' : statusOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dépôt d'action de suppression RGPD */}
              <div className="space-y-3.5 border-t border-rose-100 pt-5 mt-4">
                <div className="flex items-center gap-2 text-rose-600">
                  <Trash2 className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">Zone de Conformité RGPD :</span>
                </div>
                
                {confirmDeleteId === selectedFeedback.id ? (
                  <div className="bg-rose-50 border border-rose-200/60 p-3.5 rounded-2xl space-y-2.5 text-left">
                    <p className="text-[10px] text-rose-700 leading-normal font-sans">
                      <strong>Attention !</strong> Cette action effacera physiquement et définitivement le feedback de la base SQLite locale. (Art. 17 RGPD : droit au retrait). Êtes-vous sûr ?
                    </p>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-3 py-1 bg-white hover:bg-zinc-650 rounded-lg text-[10px] border border-zinc-200 font-bold cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFeedback(selectedFeedback.id)}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors shadow-sm"
                      >
                        Détruire définitivement
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(selectedFeedback.id)}
                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 rounded-xl text-xs font-bold border border-dashed border-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-rose-50/20"
                    title="Purger définitivement ce feedback de la base pour respecter le droit d'effacement RGPD"
                  >
                    Demander la suppression (Art. 17 RGPD)
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-zinc-400 text-xs">
              <Info className="w-6 h-6 text-zinc-300 mx-auto mb-2" />
              Sélectionnez un feedback pour afficher les détails et modifier son statut.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
