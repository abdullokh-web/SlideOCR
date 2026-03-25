export interface SlideData {
  slideNumber: number;
  text: string;
  imageUrl?: string;
}

export type ExportFormat = 'txt' | 'csv' | 'pdf' | 'docx' | 'xlsx';

export interface HistoryItem {
  id: string;
  fileName: string;
  timestamp: number;
  slides: SlideData[];
}
