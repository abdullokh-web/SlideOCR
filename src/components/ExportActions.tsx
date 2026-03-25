import React from 'react';
import { Download, FileText, Table, FileJson, FileType, FileSpreadsheet } from 'lucide-react';
import { ExportFormat } from '../types';

interface ExportActionsProps {
  onExport: (format: ExportFormat) => void;
  disabled?: boolean;
}

export const ExportActions: React.FC<ExportActionsProps> = ({ onExport, disabled }) => {
  const formats: { label: string; format: ExportFormat; icon: React.ReactNode; color: string }[] = [
    { label: 'TXT', format: 'txt', icon: <FileText className="w-4 h-4" />, color: 'bg-gray-100 text-gray-700' },
    { label: 'CSV', format: 'csv', icon: <Table className="w-4 h-4" />, color: 'bg-green-50 text-green-700' },
    { label: 'PDF', format: 'pdf', icon: <FileType className="w-4 h-4" />, color: 'bg-red-50 text-red-700' },
    { label: 'Word', format: 'docx', icon: <FileType className="w-4 h-4" />, color: 'bg-blue-50 text-blue-700' },
    { label: 'Excel', format: 'xlsx', icon: <FileSpreadsheet className="w-4 h-4" />, color: 'bg-emerald-50 text-emerald-700' },
  ];

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <span className="text-sm font-medium text-gray-500 mr-2 flex items-center gap-2">
        <Download className="w-4 h-4" /> Download as:
      </span>
      {formats.map((f) => (
        <button
          key={f.format}
          onClick={() => onExport(f.format)}
          disabled={disabled}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${f.color} shadow-sm`}
        >
          {f.icon}
          {f.label}
        </button>
      ))}
    </div>
  );
};
