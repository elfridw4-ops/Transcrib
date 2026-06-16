import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import fs from 'fs';
import cors from 'cors';
import Database from 'better-sqlite3';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize SQLite database for feedbacks
  const dbPath = path.join(process.cwd(), 'feedback.db');
  const db = new Database(dbPath);

  // Create tables for feedback and feature ratings
  db.exec(`
    CREATE TABLE IF NOT EXISTS feedbacks (
      id TEXT PRIMARY KEY,
      type TEXT, -- 'bug' | 'suggestion' | 'feature' | 'general'
      rating_stars INTEGER, -- 1 to 5
      rating_emoji TEXT, -- 'happy' | 'neutral' | 'sad'
      message TEXT,
      page_context TEXT,
      app_version TEXT,
      browser TEXT,
      device TEXT,
      user_email TEXT,
      status TEXT DEFAULT 'Nouveau', -- 'Nouveau' | 'En cours' | 'Planifié' | 'Résolu' | 'Rejeté'
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS feature_ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      feature_id TEXT, -- 'transcription' | 'translation' | 'export' | 'ui'
      rating_type TEXT, -- 'stars' | 'emoji'
      rating_value TEXT, -- '1'-'5' or 'happy' / 'neutral' / 'sad'
      created_at TEXT
    );
  `);

  // Ensure directories exist
  const dirs = ['uploads', 'transcriptions', 'subtitles', 'documents'];
  dirs.forEach(dir => {
    const p = path.join(process.cwd(), dir);
    if (!fs.existsSync(p)) {
      fs.mkdirSync(p, { recursive: true });
    }
  });

  app.use(cors());
  app.use(express.json());

  // Multer config for local storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  });
  const upload = multer({ storage });

  // API Routes
  app.post('/api/upload', upload.single('video'), (req: any, res: any) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ 
      message: 'File uploaded successfully', 
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`
    });
  });

  app.get('/api/files/:folder', (req, res) => {
    const folder = req.params.folder;
    if (!dirs.includes(folder)) return res.status(404).send('Not found');
    const folderPath = path.join(process.cwd(), folder);
    fs.readdir(folderPath, (err, files) => {
      if (err) return res.status(500).send(err);
      res.json(files);
    });
  });

  // =========================================================================
  // LOGIQUE DE SÉCURITÉ ET MIDDLEWARES RGPD / ADMINISTRATION
  // =========================================================================

  // Clé secrète configurée via .env ou clé par défaut de secours ('admin')
  const ADMIN_KEY_EXPECTED = process.env.ADMIN_PASSWORD || 'admin';

  // Middleware d'autorisation pour sécuriser l'accès aux flux SQL de la base feedbacks
  const verifyAdminToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Lecture de la clé transmise via le header personnalisé ou des paramètres d'URL
    const clientKey = req.headers['x-admin-key'] || req.query.admin_key;
    // Blocage immédiat si la clé est absente ou ne correspond pas au secret attendu
    if (!clientKey || clientKey !== ADMIN_KEY_EXPECTED) {
      return res.status(401).json({ 
        error: 'Non autorisé', 
        message: 'Clé d\'accès administrateur requise ou incorrecte pour sécuriser les données.' 
      });
    }
    // Poursuite de la requête si valide
    next();
  };

  // Endpoint d'authentification pour la console administrateur
  app.post('/api/admin/verify', (req: any, res: any) => {
    try {
      const { secret } = req.body; // Récupération du secret depuis le body
      // Comparaison directe du mot de passe fourni
      if (secret === ADMIN_KEY_EXPECTED) {
        return res.json({ success: true, token: ADMIN_KEY_EXPECTED });
      }
      return res.status(403).json({ success: false, message: 'Code d\'accès incorrect.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // FEEDBACK API ENDPOINTS
  app.post('/api/feedback', (req, res) => {
    try {
      // Extraction des métadonnées et données de contact du formulaire
      const { 
        type, 
        rating_stars, 
        rating_emoji, 
        message, 
        page_context, 
        app_version, 
        browser, 
        device, 
        user_email,
        is_anonymous, // Consentement d'anonymisation RGPD (Article 25 - Privacy by Design)
        user_consent  // Validation de la charte de stockage RGPD
      } = req.body;
      
      // Le consentement au stockage des feedbacks est indispensable pour respecter le contrat RGPD
      if (!user_consent) {
        return res.status(400).json({ 
          error: 'Contrat RGPD non signé', 
          message: 'Vous devez consentir au traitement de vos données pour soumettre un retour.' 
        });
      }

      // Si l'utilisateur choisit l'anonymisation, on supprime tout identifiant personnel direct ou indirect
      const finalEmail = is_anonymous ? null : user_email; // Masquage de l'adresse email
      const finalBrowser = is_anonymous ? 'Masqué (RGPD Anonyme)' : browser; // Masquage de l'user agent
      const finalDevice = is_anonymous ? 'Masqué (RGPD Anonyme)' : device; // Masquage de l'OS machine
      
      // Génération d'un coupon hexadécimal unique pour le ticket à conserver
      const uniqueSuffix = Math.floor(10000 + Math.random() * 90000).toString();
      const feedbackId = `FB-${uniqueSuffix}`;
      const createdAt = new Date().toISOString();

      // Préparation et insertion SQL sécurisée contre les injections
      const stmt = db.prepare(`
        INSERT INTO feedbacks (id, type, rating_stars, rating_emoji, message, page_context, app_version, browser, device, user_email, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Nouveau', ?)
      `);
      
      // Exécution de l'écriture en base SQLite
      stmt.run(
        feedbackId,
        type || 'general',
        rating_stars ? Number(rating_stars) : null,
        rating_emoji || null,
        message || '',
        page_context || 'workspace',
        app_version || '1.1.0',
        finalBrowser || 'Unknown',
        finalDevice || 'Unknown',
        finalEmail || null,
        createdAt
      );

      res.status(201).json({
        success: true,
        feedbackId,
        message: 'Feedback enregistré avec succès dans notre base SQLite !'
      });
    } catch (err: any) {
      console.error('Error saving feedback:', err);
      res.status(500).json({ error: 'Erreur lors de la sauvegarde du feedback.', details: err.message });
    }
  });

  // Récupération sécurisée avec privilège admin
  app.get('/api/feedback', verifyAdminToken, (req, res) => {
    try {
      const { status, type, search } = req.query;
      
      let query = `SELECT * FROM feedbacks WHERE 1=1`;
      const params: any[] = [];

      // Filtre SQL par statut
      if (status) {
        query += ` AND status = ?`;
        params.push(status);
      }
      // Filtre SQL par type de rapport
      if (type) {
        query += ` AND type = ?`;
        params.push(type);
      }
      // Recherche multicritères indexée
      if (search) {
        query += ` AND (message LIKE ? OR user_email LIKE ? OR id LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      query += ` ORDER BY created_at DESC`;
      const stmt = db.prepare(query);
      const rows = stmt.all(...params);
      res.json(rows);
    } catch (err: any) {
      console.error('Error querying feedback:', err);
      res.status(500).json({ error: 'Erreur lors de la récupération des feedbacks.', details: err.message });
    }
  });

  // Modification sécurisée avec privilège admin
  app.patch('/api/feedback/:id/status', verifyAdminToken, (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['Nouveau', 'En cours', 'Planifié', 'Résolu', 'Rejeté'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Statut invalide.' });
      }

      const stmt = db.prepare(`UPDATE feedbacks SET status = ? WHERE id = ?`);
      const info = stmt.run(status, id);

      if (info.changes === 0) {
        return res.status(404).json({ error: 'Feedback introuvable.' });
      }

      res.json({ success: true, message: 'Statut mis à jour !' });
    } catch (err: any) {
      console.error('Error updating status:', err);
      res.status(500).json({ error: 'Erreur de mise à jour.', details: err.message });
    }
  });

  // Right to erase / droit au retrait (Article 17 du RGPD) - Suppression définitive par option administrative
  app.delete('/api/feedback/:id', verifyAdminToken, (req, res) => {
    try {
      const { id } = req.params;
      // Exécution de l'ordre de destructions physiques SQLite
      const stmt = db.prepare(`DELETE FROM feedbacks WHERE id = ?`);
      const info = stmt.run(id);

      if (info.changes === 0) {
        return res.status(404).json({ error: 'Dépôt introuvable en base.' });
      }

      res.json({ success: true, message: 'Données définitivement supprimées de la base SQLite.' });
    } catch (err: any) {
      console.error('Error deleting feedback:', err);
      res.status(500).json({ error: 'Erreur de suppression.', details: err.message });
    }
  });

  // FEATURE SATISFACTION API ENDPOINTS (Public pour recueillir les notes)
  app.post('/api/feature-rating', (req, res) => {
    try {
      const { feature_id, rating_type, rating_value } = req.body;
      
      if (!feature_id || !rating_type || !rating_value) {
        return res.status(400).json({ error: 'Paramètres manquants.' });
      }

      const createdAt = new Date().toISOString();
      const stmt = db.prepare(`
        INSERT INTO feature_ratings (feature_id, rating_type, rating_value, created_at)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(feature_id, rating_type, rating_value.toString(), createdAt);

      res.status(201).json({ success: true, message: 'Notation enregistrée !' });
    } catch (err: any) {
      console.error('Error saving feature rating:', err);
      res.status(500).json({ error: 'Erreur de sauvegarde de la notation.', details: err.message });
    }
  });

  // Sécurisé avec privilège admin car cela expose des métadonnées agrégées d'organisation
  app.get('/api/feature-rating/stats', verifyAdminToken, (req, res) => {
    try {
      // Obtention des moyennes descriptives sous forme de barème d'étoiles
      const stmtStars = db.prepare(`
        SELECT feature_id, AVG(CAST(rating_value AS FLOAT)) as avg_rating, COUNT(*) as total_ratings 
        FROM feature_ratings 
        WHERE rating_type = 'stars' 
        GROUP BY feature_id
      `);
      const starsStats = stmtStars.all();

      // Recueil des informations quantitatives d'humeur
      const stmtEmoji = db.prepare(`
        SELECT feature_id, rating_value, COUNT(*) as count 
        FROM feature_ratings 
        WHERE rating_type = 'emoji' 
        GROUP BY feature_id, rating_value
      `);
      const emojiStats = stmtEmoji.all();

      res.json({
        stars: starsStats,
        emojis: emojiStats
      });
    } catch (err : any) {
      console.error('Error getting rating stats:', err);
      res.status(500).json({ error: 'Erreur lors du calcul des statistiques.', details: err.message });
    }
  });

  // Serve static files from the local folders
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  app.use('/transcriptions', express.static(path.join(process.cwd(), 'transcriptions')));
  app.use('/subtitles', express.static(path.join(process.cwd(), 'subtitles')));
  app.use('/documents', express.static(path.join(process.cwd(), 'documents')));

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
