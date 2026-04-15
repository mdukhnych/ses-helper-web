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


export default function WarrantyModal() {
  const data = useAppSelector(state => state.modal.payload) as WarrantyDataItem | null;
  const [loading, setLoading] = useState(false);
  const defaultFormData: Warranty = useMemo(() => ({
    title: "",
    price: 0,
    description: ""
  }), []);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    setFormData(data ?? defaultFormData)
  }, [data, defaultFormData])

  const dispatch = useAppDispatch();

  const { addWarranty, updateWarranty } = useWarrantyProtection();

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
    setLoading(true);

    if (data) {
      await updateWarranty(data.id, formData);
      setLoading(false);
    } else {
      await addWarranty(formData);
    }
    setLoading(false);
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
      </div>
      <DialogFooter className='pt-4 border-t'>
        <Button
          type="button"
          variant="outline"
          onClick={() => dispatch(closeModal())}
          disabled={loading}
          className='cursor-pointer'
        >
          Відміна
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="cursor-pointer relative flex items-center justify-center"
        >
          <span className={loading ? "opacity-0" : "opacity-100"}>Зберегти</span>
          {loading && (
            <span className="absolute inset-0 flex items-center justify-center">
              <Spinner />
            </span>
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}
