'use client'

import { Button } from '@/components/ui/button'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import FileUploader from '@/components/ui/FileUploader'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import usePromos from '@/hooks/usePromos'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { closeModal } from '@/store/slices/modalSlice'
import { PromoItem } from '@/types/information'
import React, { useState } from 'react'

export default function PromosModal() {
  const data = useAppSelector(state => state.modal.payload) as PromoItem | null;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localItem, setLocalItem] = useState<PromoItem>(data ? {...data} : {
    id: "",
    title: "",
    description: "",
    sku: ""
  });
  const dispatch = useAppDispatch();

  const { addPromo, updatePromo, isLoading } = usePromos();

  const onSave = async () => {
    if (data) {
      await updatePromo({item: localItem, file: selectedFile});
    } else {
      await addPromo({item: localItem, file: selectedFile});
    }
    dispatch(closeModal())
  }

  return (
    <div className="w-[550px]">
      <DialogHeader>
        <DialogTitle>{data ? "Внесіть зміни" : "Додайте нову акію"}</DialogTitle>
        <DialogDescription>
          
        </DialogDescription>
      </DialogHeader>

      <div className="py-4 flex flex-col gap-4">
        <div className="flex flex-2 flex-col gap-1">
          <Label htmlFor='title' className='ml-2'>Назва акції:</Label>
          <Input id="title" placeholder='Введіть назву...' value={localItem.title} onChange={e => setLocalItem(prev => ({...prev, title: e.target.value}))} />
        </div>
        <div className="flex flex-2 flex-col gap-1">
          <Label htmlFor='descr' className='ml-2'>Назва акції:</Label>
          <Textarea id="descr" placeholder='Введіть назву...' className="h-50" value={localItem.description} onChange={e => setLocalItem(prev => ({...prev, description: e.target.value}))} />
        </div>

        <FileUploader
          accept="image/*, .xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          allowedExtensions={['IMG', 'XLS', 'XLSX']}
          description={localItem.sku}
          selectedFile={selectedFile}
          onFileSelect={(file) => setSelectedFile(file)}
          onClear={() => {
            setLocalItem(prev => ({ ...prev, description: "" }));
            setSelectedFile(null);
          }}
        />
      </div>

      <DialogFooter>
        <Button
          type="button"
          disabled={isLoading}
          onClick={onSave}
          className="min-w-[130px]"
        >
          {isLoading && <Spinner className="mr-2 h-4 w-4" />}
          {isLoading ? "Збереження..." : "Зберегти"}
        </Button>
        <Button type='button' onClick={() => dispatch(closeModal())}>Відміна</Button>
      </DialogFooter>
    </div>
  )
}
