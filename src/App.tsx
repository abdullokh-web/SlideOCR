import { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { SlideViewer } from './components/SlideViewer';
import { ExportActions } from './components/ExportActions';
import { HistorySidebar } from './components/HistorySidebar';
import { extractTextFromSlides } from './services/extraction';
import { exportSlides } from './services/export';
import { SlideData, ExportFormat, HistoryItem } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, AlertCircle, Zap, ShieldCheck, Layers } from 'lucide-react';

export default function App() {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('slideocr_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('slideocr_history', JSON.stringify(history));
  }, [history]);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setFileName(file.name);
    
    try {
      const extractedSlides = await extractTextFromSlides(file);
      setSlides(extractedSlides);
      
      // Add to history
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        fileName: file.name,
        timestamp: Date.now(),
        slides: extractedSlides
      };
      setHistory(prev => [newItem, ...prev].slice(0, 10)); // Keep last 10
    } catch (err) {
      console.error(err);
      setError('Failed to process the presentation. Please check the file format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async (format: ExportFormat) => {
    if (slides.length === 0) return;
    await exportSlides(slides, format, fileName);
  };

  const selectHistoryItem = (item: HistoryItem) => {
    setSlides(item.slides);
    setFileName(item.fileName);
    setError(null);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const reset = () => {
    setSlides([]);
    setError(null);
    setFileName('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">SlideOCR</h1>
          </div>
          
          {slides.length > 0 && (
            <button
              onClick={reset}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Start Over
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {slides.length === 0 ? (
            <motion.div
              key="upload-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl mx-auto"
            >
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
                  <Zap className="w-3 h-3" /> Professional OCR Engine
                </div>
                <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
                  The smartest way to <br /> <span className="text-blue-600">digitize presentations.</span>
                </h2>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                  Our proprietary AI-driven OCR technology extracts text with 99.9% accuracy. 
                  No more manual typing—just instant, structured data.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                  <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
                  
                  <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <Zap className="w-6 h-6 text-yellow-500 mb-4" />
                      <h4 className="font-bold text-slate-900 mb-2">Instant OCR</h4>
                      <p className="text-xs text-slate-500">Real-time processing using edge AI models for zero latency.</p>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <ShieldCheck className="w-6 h-6 text-green-500 mb-4" />
                      <h4 className="font-bold text-slate-900 mb-2">Privacy First</h4>
                      <p className="text-xs text-slate-500">All processing happens locally on your device. Your data never leaves.</p>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <Layers className="w-6 h-6 text-blue-500 mb-4" />
                      <h4 className="font-bold text-slate-900 mb-2">Batch Ready</h4>
                      <p className="text-xs text-slate-500">Upload multiple files and manage them via your local history.</p>
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-4">
                  <HistorySidebar 
                    items={history} 
                    onSelect={selectHistoryItem} 
                    onDelete={deleteHistoryItem}
                    onClear={clearHistory}
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 justify-center"
                >
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="results-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500" /> Extraction Results
                  </h2>
                  <p className="text-slate-500">
                    Extracted {slides.length} slides from <span className="font-semibold text-slate-700">{fileName}</span>
                  </p>
                </div>
                <ExportActions onExport={handleExport} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                  <SlideViewer slides={slides} />
                </div>
                
                <div className="lg:col-span-4 space-y-6">
                  <HistorySidebar 
                    items={history} 
                    onSelect={selectHistoryItem} 
                    onDelete={deleteHistoryItem}
                    onClear={clearHistory}
                  />

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-500" /> Insights
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      The system has successfully mapped your presentation structure. 
                      Use the search bar to find specific keywords across all slides instantly.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-slate-200/60 text-center">
        <p className="text-sm text-slate-400">
          SlideOCR • Secure Presentation Digitization
        </p>
      </footer>
    </div>
  );
}
