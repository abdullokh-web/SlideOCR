import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Copy, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SlideData } from '../types';
import { cn } from '../lib/utils';

interface SlideViewerProps {
  slides: SlideData[];
}

export const SlideViewer: React.FC<SlideViewerProps> = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSlides = useMemo(() => {
    if (!searchQuery) return slides;
    return slides.filter(s => s.text.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [slides, searchQuery]);

  // Adjust current index if it's out of bounds after filtering
  const safeIndex = Math.min(currentIndex, Math.max(0, filteredSlides.length - 1));
  const currentSlide = filteredSlides[safeIndex];

  const handleCopy = () => {
    if (!currentSlide) return;
    navigator.clipboard.writeText(currentSlide.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nextSlide = () => {
    if (safeIndex < filteredSlides.length - 1) {
      setCurrentIndex(safeIndex + 1);
    }
  };

  const prevSlide = () => {
    if (safeIndex > 0) {
      setCurrentIndex(safeIndex - 1);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5 border-b border-yellow-400/50">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50 gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-500">
            {filteredSlides.length > 0 ? `Slide ${currentSlide?.slideNumber} of ${slides.length}` : 'No matches'}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={prevSlide}
              disabled={safeIndex === 0 || filteredSlides.length === 0}
              className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              disabled={safeIndex === filteredSlides.length - 1 || filteredSlides.length === 0}
              className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search in slides..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentIndex(0);
              }}
              className="pl-9 pr-4 py-1.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full sm:w-48"
            />
          </div>
          
          <button
            onClick={handleCopy}
            disabled={!currentSlide}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm transition-all disabled:opacity-50"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy Text'}
          </button>
        </div>
      </div>

      <div className="p-8 min-h-[400px] relative">
        <AnimatePresence mode="wait">
          {currentSlide ? (
            <motion.div
              key={currentSlide.slideNumber}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="prose prose-blue max-w-none"
            >
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-lg font-light">
                {highlightText(currentSlide.text, searchQuery)}
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
              <Search className="w-12 h-12 mb-4 opacity-20" />
              <p>No text found matching your search.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
        {slides.map((slide, idx) => {
          const isMatch = searchQuery && slide.text.toLowerCase().includes(searchQuery.toLowerCase());
          const isSelected = currentSlide?.slideNumber === slide.slideNumber;
          
          return (
            <button
              key={idx}
              onClick={() => {
                const filteredIdx = filteredSlides.findIndex(s => s.slideNumber === slide.slideNumber);
                if (filteredIdx !== -1) {
                  setCurrentIndex(filteredIdx);
                }
              }}
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-lg text-xs font-semibold transition-all border",
                isSelected 
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200" 
                  : isMatch
                    ? "bg-blue-50 text-blue-600 border-blue-200"
                    : "bg-white text-gray-400 hover:text-gray-600 border-gray-200"
              )}
            >
              {slide.slideNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
};
