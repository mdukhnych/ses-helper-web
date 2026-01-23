'use client'

import React, { FormEvent, useState } from 'react';
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
import useFirestore from '@/hooks/useFirestore';
import { WarrantyDataItem } from '@/types/services';
import { Spinner } from '@/components/ui/spinner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeModal } from '@/store/slices/modalSlice';
import { checkUniqueId } from '@/utils';


export default function WarrantyModal() {
  const data = useAppSelector(state => state.modal.payload) as WarrantyDataItem | null;
  const warrantyItems = useAppSelector(state => state.services.data.find(item => item.id === "warranty-protection"))?.data as WarrantyDataItem[];
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(
    data ?
      {
        ...data
      } : 
      {
        id: "",
        title: "",
        price: 0,
        description: ""
      }
  );

  const dispatch = useAppDispatch();

  const ids = warrantyItems.map(item => item.id);
  
  const { modifyWarrantyService } = useFirestore();


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
      await modifyWarrantyService("update", formData);
      dispatch(closeModal());
      setLoading(false);
    } else {
      if (checkUniqueId(formData.id, ids ? ids : []))  {
        await modifyWarrantyService("add", formData);
        dispatch(closeModal())
      }
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onFormSubmitHandler}>
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
        {
          !data ? 
            <div className="grid gap-3">
              <Label htmlFor="warrabty-id">Ідентифікатор послуги (ID):</Label>
              <Input
                id="warrabty-id"
                name="id"
                placeholder="Введіть ID послуги..."
                value={formData.id}
                onChange={handleChange}
              />
            </div>
          : null
        }
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
          <p className="text-muted-foreground text-sm">
            {"Використовуйте тег <br> для перенесення рядка."}
          </p>
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
