'use client'

import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button } from "@/components/ui/button"
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Warranty, WarrantyDataItem } from '@/types/services';
import { Spinner } from '@/components/ui/spinner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeModal } from '@/store/slices/modalSlice';
import useWarrantyProtection from '@/hooks/useWarrantyProtection';
import FileUploader from '@/components/ui/FileUploader';

export default function WarrantyModal() {
  const data = useAppSelector(state => state.modal.payload) as WarrantyDataItem | null;
  const defaultFormData: Warranty = useMemo(() => ({
    title: "",
    price: 0,
    description: "",
    fileURL: ""
  }), []);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    setFormData(data ?? defaultFormData)
  }, [data, defaultFormData])

  const dispatch = useAppDispatch();

  const { addWarranty, updateWarranty, isLoading } = useWarrantyProtection();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "price") {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        setFormData({ ...formData, price: numericValue / 100 });
      } else {
        setFormData({ ...formData, price: 0 });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const onFormSubmitHandler = async (e: FormEvent) => {
    e.preventDefault();
    if (data) {
      await updateWarranty({
        id: data.id,
        data: formData,
        fileData: {
          prevURL: data.fileURL,
          file: selectedFile
        }
      });
    } else {
      await addWarranty({
        data: formData,
        file: selectedFile
      });
    }
  }

  return (
    <form onSubmit={onFormSubmitHandler} className='w-[350px]'>
      <DialogHeader className='py-4 border-b'>
        <DialogTitle>{data ? "Редактор" : "Додати"}</DialogTitle>
        <DialogDescription>
          {data ? 
            `Внесіть зміни до послуги ${data.title}`
            : "Додавання нової послуги"
          }
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-3">
          <Label htmlFor="warrabty-title">Назва послуги:</Label>
          <Input
            id="warrabty-title"
            name="title"
            placeholder="Введіть назву послуги..."
            value={formData.title}
            onChange={handleChange}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="warranty-price">Ціна послуги у %:</Label>
          <Input
            id="warranty-price"
            name="price"
            placeholder="Введіть ціну у відсотках..."
            value={(formData.price * 100).toFixed(0)}
            onChange={handleChange}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="warranty-description">Опис для послуги</Label>
          <Textarea
            className="max-h-[150px] overflow-y-auto resize-none"
            id="warranty-description"
            name="description"
            placeholder="Введіть опис послуги..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <FileUploader
          accept='application/pdf'
          allowedExtensions={['PDF']}
          description={formData.fileURL}
          selectedFile={selectedFile}
          onFileSelect={(file) => setSelectedFile(file)}
          onClear={() => {
            setFormData(prev => ({ ...prev, fileURL: "" }));
            setSelectedFile(null);
          }}
        />
      </div>
      <DialogFooter className='pt-4 border-t'>
        <Button 
          disabled={isLoading}
          type='submit' 
          className='cursor-pointer'
        >
          {isLoading && <Spinner className="w-4 h-4" />}
          {isLoading ? "Збереження..." : "Зберегти"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => dispatch(closeModal())}
          disabled={isLoading}
          className='cursor-pointer'
        >
          Відміна
        </Button>
      </DialogFooter>
    </form>
  )
}
