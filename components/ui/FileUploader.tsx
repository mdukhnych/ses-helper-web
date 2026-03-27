import React, { useRef } from 'react';
import { Label } from "@/components/ui/label"; 
import { Input } from "@/components/ui/input";
import { FileUp, FileX } from "lucide-react";
import { toast } from "sonner"; 
import ConfirmDialog from '../shared/ConfirmDialog';

const allSupportedFormats = [
  "application/pdf",                                      // PDF
  "image/*",                                              // Зображення
  ".doc, .docx, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Word
  ".xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Excel
  ".csv, text/csv"                                        // CSV
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
  label = "Файл:", // Текст заголовка
  description, // Назва файлу, що вже існує на сервері.
  selectedFile, // Поточний об'єкт файлу, обраний користувачем.
  onFileSelect, // Колбек при виборі файлу.
  onClear, // Колбек для видалення файлу та очищення стану.
  accept = allSupportedFormats, // Рядок MIME-типів/розширень для вікна вибору.
  maxSizeMB = 10, // Максимально дозволений розмір файлу в мегабайтах.
  allowedExtensions = ['PDF', 'IMG', 'DOC', 'DOCX', 'XLS', 'XLSX', 'CSV'] // Масив рядків для відображення підказки користувачу.
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`Файл занадто великий! Ліміт: ${maxSizeMB} MB`);
      e.target.value = "";
      return;
    }

    onFileSelect(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center gap-2 ">
        <Label htmlFor="file-input" className="text-sm font-medium">
          {label}
        </Label>
        
        <div className="relative flex-1">
          <Input
            id="file-input"
            value={selectedFile ? selectedFile.name : (description || "")}
            readOnly
            placeholder="Оберіть файл..."
            className={`cursor-default ${selectedFile ? "border-green-500 bg-green-50/10" : ""}`}
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-secondary rounded-md transition-colors"
            title="Завантажити"
          >
            <FileUp size={20} className="text-primary" />
          </button>

          {(selectedFile || description) && (
            <ConfirmDialog
              trigger={
                <button
                  type="button"
                  className="p-2 hover:bg-destructive/10 rounded-md transition-colors text-destructive"
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
      
      <div className="flex justify-center gap-4 px-1">
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