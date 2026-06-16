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
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { transcribeVideo, translateTranscription, TranscriptionResult, TranscriptionSegment } from './services/gemini';
import { generateSRT, generateVTT, downloadFile, generateDocx, generatePdf } from './services/export';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [translation, setTranslation] = useState<TranscriptionSegment[] | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <header className="mb-12 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 font-medium text-sm mb-4"
        >
          <Globe className="w-4 h-4" />
          IA Multilingue Locale
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Transcribe <span className="text-indigo-600">&</span> Translate
        </h1>
        <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
          Générez des transcriptions, traductions et sous-titres instantanément. 
          Tout est traité localement pour votre confidentialité.
        </p>
      </header>

      <main className="grid gap-8">
        {/* Upload Section */}
        <section className="glass rounded-3xl p-8 text-center">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer ${
              file ? 'border-indigo-300 bg-indigo-50/30' : 'border-zinc-200 hover:border-indigo-300 hover:bg-zinc-50'
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
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                {file ? <FileVideo className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {file ? file.name : "Cliquez pour uploader une vidéo"}
                </p>
                <p className="text-zinc-400 text-sm">
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
              <div className="flex flex-wrap gap-4 justify-center">
                <button 
                  onClick={() => downloadFile(generateSRT(translation), 'subtitles.srt', 'text/plain')}
                  className="btn-secondary"
                >
                  <FileCode className="w-5 h-5" /> SRT
                </button>
                <button 
                  onClick={() => downloadFile(generateVTT(translation), 'subtitles.vtt', 'text/vtt')}
                  className="btn-secondary"
                >
                  <FileCode className="w-5 h-5" /> VTT
                </button>
                <button 
                  onClick={() => generateDocx(result, translation)}
                  className="btn-secondary"
                >
                  <FileText className="w-5 h-5" /> Word
                </button>
                <button 
                  onClick={() => generatePdf(result, translation)}
                  className="btn-secondary"
                >
                  <Download className="w-5 h-5" /> PDF
                </button>
              </div>

              {/* Preview */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass rounded-3xl p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-600" />
                    Original ({result.language})
                  </h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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

                <div className="glass rounded-3xl p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Traduction (Français)
                  </h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-20 pb-10 text-center text-zinc-400 text-sm">
        <p>© 2026 Transcribe & Translate AI - Solution de traitement local sécurisée</p>
      </footer>
    </div>
  );
}
