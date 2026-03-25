import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import * as XLSX from 'xlsx';
import { SlideData, ExportFormat } from '../types';

export async function exportSlides(slides: SlideData[], format: ExportFormat, fileName: string) {
  const baseName = fileName.split('.').slice(0, -1).join('.') || 'presentation-text';

  switch (format) {
    case 'txt': {
      const content = slides.map(s => `Slide ${s.slideNumber}\n---\n${s.text}\n\n`).join('');
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${baseName}.txt`;
      link.click();
      break;
    }
    case 'csv': {
      const rows = slides.map(s => [s.slideNumber, s.text.replace(/"/g, '""')]);
      const csvContent = "Slide Number,Text\n" + rows.map(e => `${e[0]},"${e[1]}"`).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${baseName}.csv`;
      link.click();
      break;
    }
    case 'pdf': {
      const doc = new jsPDF();
      slides.forEach((s, i) => {
        if (i > 0) doc.addPage();
        doc.setFontSize(16);
        doc.text(`Slide ${s.slideNumber}`, 10, 20);
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(s.text, 180);
        doc.text(splitText, 10, 30);
      });
      doc.save(`${baseName}.pdf`);
      break;
    }
    case 'docx': {
      const doc = new Document({
        sections: [{
          properties: {},
          children: slides.flatMap(s => [
            new Paragraph({
              children: [new TextRun({ text: `Slide ${s.slideNumber}`, bold: true, size: 32 })],
            }),
            new Paragraph({
              children: [new TextRun({ text: s.text, size: 24 })],
            }),
            new Paragraph({ text: "" }), // Spacer
          ]),
        }],
      });
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${baseName}.docx`;
      link.click();
      break;
    }
    case 'xlsx': {
      const data = slides.map(s => ({ "Slide Number": s.slideNumber, "Text": s.text }));
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Slides");
      XLSX.writeFile(workbook, `${baseName}.xlsx`);
      break;
    }
  }
}
