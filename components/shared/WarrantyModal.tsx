'use client'

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '../ui/textarea';

interface IModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data?: [];
  nextId?: number;
}

export default function WarrantyModal({
  isOpen,
  setIsOpen,
  data = [],
  nextId = 0
}: IModalProps) {

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(
    data ? ({...data}) : ({
      id: nextId,
      title: "",
      price: 0,
      description: ""
    })
  );


  useEffect(() => {
    if (data) {
      setFormData(data)
    } else {
      setFormData({
        id: nextId,
        title: "",
        price: 0,
        description: ""
      })
    }
  }, [data, nextId]);


  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   const { name, value } = e.target;
  //   if (name === "price") {
  //     const numericValue = parseFloat(value);
  //     if (!isNaN(numericValue)) {
  //       setFormData({ ...formData, price: numericValue / 100 });
  //     } else {
  //       setFormData({ ...formData, price: 0 });
  //     }
  //   } else {
  //     setFormData({ ...formData, [name]: value });
  //   }
  // };

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (data) {
      alert("Edit")
    } else {
      alert("Addedd")
    }
    setIsOpen(false);
    setLoading(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={onFormSubmit}>
          <DialogHeader className='py-4 border-b-1'>
            <DialogTitle>{data ? "Редагування" : "Додати"}</DialogTitle>
            <DialogDescription>
              {data
                ? `Редагування інформації про послугу ${0}`
                : "Додайте нову послугу до списку"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="warrabty-title">Назва послуги:</Label>
              <Input
                id="warrabty-title"
                name="title"
                placeholder="Введіть назву послуги..."
                // value={formData.title}
                // onChange={handleChange}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="warranty-price">Ціна послуги у %:</Label>
              <Input
                id="warranty-price"
                name="price"
                placeholder="Введіть ціну у відсотках..."
                // value={(formData.price * 100).toFixed(0)}
                // onChange={handleChange}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="warranty-description">Опис для послуги</Label>
              <Textarea
                className="max-h-[150px] overflow-y-auto resize-none"
                id="warranty-description"
                name="description"
                placeholder="Введіть опис послуги..."
                // value={formData.description}
                // onChange={handleChange}
              />
              <p className="text-muted-foreground text-sm">
                {"Використовуйте тег <br> для перенесення рядка."}
              </p>
            </div>
          </div>
          <DialogFooter className='pt-4 border-t-1'>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className='cursor-pointer'
            >
              Відміна
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className='cursor-pointer'
            >
              {loading ? "Збереження..." : "Зберегти"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
