import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import fs from 'fs';
import cors from 'cors';

async function startServer() {
  const app = express();
  const PORT = 3000;

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
