import React from 'react';
import { motion } from 'motion/react';
import { History, CheckCircle2, Star, Zap, Shield, Globe } from 'lucide-react';

export default function Changelog() {
  const versions = [
    {
      version: "1.1.0",
      date: "18 Juin 2026",
      title: "Mise à jour Progressive Web App (PWA)",
      description: "Transformation de l'application en plateforme autonome installable avec support hors ligne.",
      changes: [
        "Support PWA complet (Manifest, Service Worker, Icônes multi-tailles)",
        "Système de partage social optimisé (Open Graph, Twitter Cards)",
        "Bouton d'installation dynamique pour Desktop et Mobile",
        "Nouvelle vue 'Notes de version' pour la transparence des mises à jour",
        "Optimisation de la mise en cache des actifs statiques"
      ],
      type: "major"
    },
    {
      version: "1.0.1",
      date: "16 Juin 2026",
      title: "Correctifs d'Accessibilité et Sécurité",
      description: "Amélioration de l'interface d'administration et résolution des problèmes d'affichage Iframe.",
      changes: [
        "Dissimulation ergonomique du panneau Admin (Appui long sur logo)",
        "Raccourci clavier expert (Ctrl + Alt + A) pour l'administration",
        "Résolution du blocage de validation HTML5 dans les environnements Iframe",
        "Ajout du défilement intelligent (Scroll-safe) pour les modales sur petits écrans",
        "Renforcement de la sécurité des en-têtes d'API (x-admin-key)"
      ],
      type: "fix"
    },
    {
      version: "1.0.0",
      date: "15 Juin 2026",
      title: "Lancement Initial",
      description: "Version stable de base avec transcription et traduction vidéo propulsée par Gemini.",
      changes: [
        "Moteur de transcription multimodale vidéo-texte direct",
        "Traduction bidirectionnelle automatique",
        "Export aux formats professionnels (SRT, VTT, PDF, Word)",
        "Console d'administration sécurisée et base de données SQLite locale",
        "Module de retours clients avec conformité RGPD (Droit à l'oubli)"
      ],
      type: "release"
    }
  ];

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium">
          <History className="w-4 h-4" />
          Notes de version
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">Historique des mises à jour</h1>
        <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
          Suivez l'évolution de Transcribe & Translate AI. Nous mettons régulièrement à jour l'application pour améliorer vos performances.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-8 relative before:absolute before:inset-0 before:left-[1.35rem] before:w-px before:bg-zinc-100 before:pointer-events-none">
        {versions.map((v, index) => (
          <motion.div 
            key={v.version}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-12"
          >
            <div className={`absolute left-0 top-1 w-7 h-7 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${
              v.type === 'major' ? 'bg-indigo-600' : v.type === 'fix' ? 'bg-amber-500' : 'bg-emerald-500'
            }`}>
              {v.type === 'major' ? <Star className="w-3 h-3 text-white" /> : v.type === 'fix' ? <Zap className="w-3 h-3 text-white" /> : <CheckCircle2 className="w-3 h-3 text-white" />}
            </div>
            
            <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-zinc-900">v{v.version}</span>
                    <span className="text-sm font-medium text-zinc-400">— {v.date}</span>
                  </div>
                  <h2 className="text-lg font-bold text-indigo-600">{v.title}</h2>
                </div>
              </div>
              
              <p className="text-zinc-600 mb-6 italic">{v.description}</p>
              
              <ul className="space-y-3">
                {v.changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-zinc-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center pt-8">
        <div className="inline-flex items-center gap-3 p-4 rounded-2xl bg-zinc-100/50 border border-zinc-200">
          <Shield className="w-5 h-5 text-zinc-400" />
          <span className="text-sm text-zinc-500">Toutes les mises à jour conservent vos données locales en sécurité.</span>
        </div>
      </div>
    </div>
  );
}
