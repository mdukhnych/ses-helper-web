import React, { useRef } from 'react';
import { Label } from "@/components/ui/label"; 
import { Input } from "@/components/ui/input";
import { FileUp, FileX } from "lucide-react";
import { toast } from "sonner"; 
import ConfirmDialog from '../shared/ConfirmDialog';

const allSupportedFormats = [
  "application/pdf",                                                      
  "image/*",                                                          
  ".doc, .docx, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
  ".xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
  ".csv, text/csv"                                                 
].join(", ");

interface FileUploaderProps {
  label?: string;
  description: string;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  onClear: () => void;
  accept?: string; 
  maxSizeMB?: number;
  allowedExtensions?: string[];
}

const FileUploader: React.FC<FileUploaderProps> = ({
  label = "Файл:",
  description,
  selectedFile,
  onFileSelect,
  onClear,
  accept = allSupportedFormats,
  maxSizeMB = 10,
  allowedExtensions = ['PDF', 'IMG', 'DOC', 'DOCX', 'XLS', 'XLSX', 'CSV']
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File | undefined | null) => {
    if (!file) return false;

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`Файл занадто великий! Ліміт: ${maxSizeMB} MB`);
      return false;
    }

    onFileSelect(file);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
    e.target.value = "";
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const customName = `screenshot_${Date.now()}.${file.type.split('/')[1]}`;
          const renamedFile = new File([file], customName, { type: file.type });
          
          processFile(renamedFile);
        }
        break; 
      }
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center gap-4 ">
        <Label htmlFor="file-input" className="text-sm font-medium">
          {label}
        </Label>
        
        <div className="relative flex-1" onPaste={handlePaste}>
          <Input
            id="file-input"
            value={selectedFile ? selectedFile.name : (description || "")}
            readOnly
            placeholder={`Оберіть файл${allowedExtensions.includes('IMG') ? " або натисніть Ctrl+V для скріншоту..." : "..."}`}
            className={`cursor-default ${selectedFile ? "border-green-500 bg-green-50/10" : ""}`}
            // onClick={() => fileInputRef.current?.click()} 
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-md"
            title="Завантажити"
          >
            <FileUp size={20} className="text-primary" />
          </button>

          {(selectedFile || description) && (
            <ConfirmDialog
              trigger={
                <button
                  type="button"
                  className="cursor-pointer rounded-md text-destructive"
                  title="Видалити"
                >
                  <FileX size={20} />
                </button>
              }
              title='Видалити файл?'
              description='Це дію неможливо буде скасувати.'
              onConfirm={onClear}
            />
          )}
        </div>

        <input
          type="file"
          accept={accept}
          ref={fileInputRef}
          onChange={handleFileChange}
          hidden
        />
      </div>
      
      <div className="flex justify-center gap-4 px-1 mt-1">
        <span className="text-[10px] text-muted-foreground italic">
          Дозволено: {allowedExtensions.join(', ')}
        </span>
        <span className="text-[10px] text-muted-foreground">|</span>
        <span className="text-[10px] text-muted-foreground">
          Макс: {maxSizeMB}MB
        </span>
      </div>
    </div>
  );
};

export default FileUploader;