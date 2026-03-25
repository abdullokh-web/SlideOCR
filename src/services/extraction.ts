import * as pdfjs from 'pdfjs-dist';
import JSZip from "jszip";
import { createWorker } from 'tesseract.js';
import { SlideData } from "../types";
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

async function extractTextFromPdf(file: File): Promise<SlideData[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const slides: SlideData[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map((item: any) => item.str).join(' ');
    slides.push({ slideNumber: i, text });
  }
  return slides;
}

async function extractTextFromPptx(file: File): Promise<SlideData[]> {
  const zip = await JSZip.loadAsync(file);
  const slideFiles = Object.keys(zip.files).filter(name => name.startsWith("ppt/slides/slide") && name.endsWith(".xml"));
  
  slideFiles.sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)![0]);
    const numB = parseInt(b.match(/\d+/)![0]);
    return numA - numB;
  });

  const slides: SlideData[] = [];
  for (const slideFile of slideFiles) {
    const content = await zip.file(slideFile)?.async("text");
    if (content) {
      const slideNumber = parseInt(slideFile.match(/\d+/)![0]);
      const textMatches = content.match(/<a:t>([^<]+)<\/a:t>/g);
      const text = textMatches ? textMatches.map(m => m.replace(/<a:t>|<\/a:t>/g, "")).join(" ") : "";
      slides.push({ slideNumber, text });
    }
  }
  return slides;
}

async function extractTextFromImage(file: File): Promise<SlideData[]> {
  const worker = await createWorker('eng');
  const { data: { text } } = await worker.recognize(file);
  await worker.terminate();
  return [{ slideNumber: 1, text }];
}

/**
 * Local extraction service that simulates "AI" processing
 * but runs entirely in the browser using specialized libraries.
 */
export async function extractTextFromSlides(file: File): Promise<SlideData[]> {
  // Simulate "AI" thinking time for the marketing effect
  await new Promise(resolve => setTimeout(resolve, 1500));

  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.pdf')) {
    return extractTextFromPdf(file);
  } else if (fileName.endsWith('.pptx')) {
    return extractTextFromPptx(file);
  } else if (file.type.startsWith('image/')) {
    return extractTextFromImage(file);
  }
  
  throw new Error("Unsupported file format");
}
