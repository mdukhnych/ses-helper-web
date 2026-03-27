import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FileUploader from '@/components/ui/FileUploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useAppSelector } from '@/store/hooks';
import { InformationBase, InstructionsItem } from '@/types/information';
import React, { useState } from 'react';

type InstructionsModalPayload =
  | {
      mode: "instruction";
      data: InstructionsItem;
    }
  | {
      mode: "categories";
      data: InformationBase[];
    }
  | {
      mode: "instruction" | "categories";
      data: null;
};

const InstructionInnerModal = ({item}: {item: InstructionsItem | null}) => {
  const categories = useAppSelector(state => state.information.data.instructions.categories);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Label className='pl-1' htmlFor='id'>ID:</Label>
        <Input id="id" placeholder='Введіть ID...' />
      </div>
      <div className="flex flex-col gap-1">
        <Label className='pl-1' htmlFor='title'>Найменування:</Label>
        <Input id="title" placeholder='Введіть найменування...' />
      </div>
      <div className="flex flex-col gap-1">
        <Label className='pl-1' htmlFor='category'>Категорія:</Label>
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <FileUploader
        accept='application/pdf'
        allowedExtensions={['PDF']}
        description={""}
        selectedFile={selectedFile}
        onFileSelect={(file) => setSelectedFile(file)}
        onClear={() => {
          // setLocalItem(prev => ({ ...prev, description: "" }));
          setSelectedFile(null);
        }}
      />
    </div>
  )
}
const CategoriesInnerModal = () => {
  const categories = useAppSelector(state => state.information.data.instructions.categories);

  return (
    <div className="flex flex-col gap-2">
      <ScrollArea className='border rounded h-[300px]'>
        {
          categories.map(cat => (
            <div key={cat.id} className={"grid grid-cols-[6fr_2fr_1fr] hover:bg-muted/50 transition-colors cursor-pointer p-2"}>
              <span>{cat.title}</span>
            </div>
          ))
        }
      </ScrollArea>
      <DialogFooter>

      </DialogFooter>
    </div>
  )
}

export default function InstructionsModal() {
  const payload = useAppSelector(state => state.modal.payload) as InstructionsModalPayload | null;

  if (!payload) return <Spinner />
  return (
    <DialogHeader className='w-[400px]'>
      <DialogTitle>
        {
          payload.mode === "instruction" ?
            payload.data ? "Редактор інструкції" : "Додати інструкцію"
          : "Редакор категорій"
        }
      </DialogTitle>
      <DialogDescription>
        {
          payload.mode === "instruction" ?
            payload.data ? "Внесіть зміни до поточної інструкції" : "Додайте нову інструкцію до списку"
          : "Внесіть зміни до списку категорій"
        }
      </DialogDescription>
      <div className="">
        {
          payload.mode === "instruction" ? <InstructionInnerModal item={payload.data} /> : <CategoriesInnerModal />
        }
      </div>
    </DialogHeader>
  )
}
