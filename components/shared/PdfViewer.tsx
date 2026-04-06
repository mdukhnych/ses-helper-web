'use client'

import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';

interface PdfViewerProps {
  url: string;
  title: string;
  onBack: () => void;
}

export default function PdfViewer({ url, title, onBack }: PdfViewerProps) {
  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад до списку
          </Button>
          <h2 className="font-semibold truncate max-w-[400px]">{title}</h2>
        </div>
        
        <Button variant="ghost" size="sm" asChild>
          <a href={url} download target="_blank" rel="noopener noreferrer">
            <Download className="mr-2 h-4 w-4" />
            Завантажити
          </a>
        </Button>
      </div>

      <div className="flex-1 w-full bg-gray-500 overflow-hidden">
        <iframe
          src={`${url}#toolbar=0`} 
          className="w-full h-full border-none"
          title={title}
        />
      </div>
    </div>
  );
}