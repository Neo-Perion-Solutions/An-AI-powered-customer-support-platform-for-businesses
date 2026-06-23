'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  onUpload?: (files: File[]) => void;
  onProgress?: (pct: number) => void;
}

export function FileUpload({ accept = '.pdf,.txt,.md,.docx', multiple = true, onUpload, onProgress }: FileUploadProps) {
  const [drag, setDrag] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const arr = Array.from(list);
    setFiles((f) => [...f, ...arr]);
    simulateUpload(arr);
  };

  const simulateUpload = (arr: File[]) => {
    let pct = 0;
    const interval = setInterval(() => {
      pct += Math.random() * 20;
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
        onProgress?.(100);
        onUpload?.(arr);
        setTimeout(() => {
          setProgress(0);
          setFiles([]);
        }, 500);
        return;
      }
      setProgress(pct);
      onProgress?.(pct);
    }, 150);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-10 text-center transition-colors',
          drag ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/40'
        )}
      >
        <div className="rounded-full bg-primary/10 p-3">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <p className="text-sm font-medium">Drop files here or click to browse</p>
        <p className="text-xs text-muted-foreground">PDF, TXT, MD, DOCX up to 50MB</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 rounded-md border bg-card p-3">
              <FileText className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">{f.name}</p>
                <p className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(1)} KB</p>
                {progress > 0 && progress < 100 && <Progress value={progress} className="mt-1 h-1" />}
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setFiles((arr) => arr.filter((_, j) => j !== i));
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}