"use client"

import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { ListRestart, ListX, Sheet } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';

import { formatPrice } from '@/utils';
import { EasyProData, EasyProPricelistItem } from '@/types/services';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { fetchEasyProData } from '@/store/slices/servicesSlice';
import Link from 'next/link';
import useEasyPro from '@/hooks/useEasyPro';

export default function EasyPro() {
  const [search, setSearch] = useState("");
  // const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const dispatch = useAppDispatch();

  useEffect(() =>{
    dispatch(fetchEasyProData());
  },[dispatch])

  const { updateEasyproPricelist, isLoading } = useEasyPro();

  const role = useAppSelector(state => state.user.role)

  const data = useAppSelector(state => state.services.data.find(item => item.id === "easy-pro"))?.data as EasyProData;
  if (!data) return <div className="w-full h-full flex items-center justify-center"><Spinner className='size-20' /></div>

  const filteredList = data.pricelist.filter(item =>
    item.model.toLowerCase().includes(search.toLowerCase())
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;


    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      if (!bstr) return;

      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(ws, { defval: "" }) as EasyProPricelistItem[];

      updateEasyproPricelist(jsonData);
      e.target.value = "";  

    };
    reader.readAsArrayBuffer(file); 
  };

  const clearPricelist = async () => {
    updateEasyproPricelist([]);
  }

  return (
    <div className='w-full max-w-[1500px] h-full flex flex-col'>

      <div className='flex items-center gap-2 w-full pb-4'>
        <span>Модель:</span>
        <Input id='model' placeholder='Введіть модель пристрою...' value={search} onChange={e => setSearch(e.target.value)} />
        {
          role === "admin" &&
            <>
              <Link title='Завантажити шаблон таблиці' className={buttonVariants({ variant: "default" })} href='https://firebasestorage.googleapis.com/v0/b/ses-helper-b00aa.firebasestorage.app/o/services%2Fpricelist.xlsx?alt=media&token=09f1d5aa-fd7b-4e69-8a96-5d0f3c72d276'><Sheet/></Link>
              <Button title='Оновити прайсліст' type='button' onClick={() => fileInputRef.current?.click()}><ListRestart/></Button>
              <ConfirmDialog trigger={<Button title='Очистити прайсліст' disabled={filteredList.length === 0} type='button' variant={"destructive"}><ListX/></Button>} title='Очистити прайсліст?' description='Відмінити операцію буде неможливо!' onConfirm={clearPricelist} />
              <input type="file" accept=".xlsx, .xls" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            </>
        }
      </div>

      {
        isLoading 
          ? <div className="flex items-center"><Spinner className='size-20' /></div>
          : <div className="flex gap-4 flex-1 overflow-hidden">
              <ScrollArea className='relative border w-full rounded-lg overflow-hidden '>

                <div className="grid grid-cols-[2fr_1fr_1fr_1fr] bg-sidebar-accent border-b font-semibold text-sm sticky top-0 z-20 w-full">
                  <div className="p-4 border-r">Модель</div>
                  {
                      data.description.map(item => <EPDialog key={item.id} trigger={<div className="p-4 border-r cursor-pointer text-center">{item.shortName || item.title}</div>} title={item.title} description={item.text} />)
                  }
                </div>
                <div className="flex flex-col">
                  {
                    filteredList.length > 0 ? (
                      filteredList.map((item, i) => (
                        <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr] border-b last:border-b-0 hover:bg-muted/50 transition-colors">
                          <div className="p-4 border-r flex items-center font-medium">
                            {item.model}
                          </div>
                          <div className="p-4 border-r flex items-center justify-center">
                            {item.easypro ? formatPrice(item.easypro) : "—"}
                          </div>
                          <div className="p-4 border-r flex items-center justify-center">
                            {item.easypro2 ? formatPrice(item.easypro2) : "—"}
                          </div>
                          <div className="p-4 flex items-center justify-center">
                            {item.easypro3 ? formatPrice(item.easypro3) : "—"}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center p-10 text-muted-foreground">
                        <span className="text-lg font-medium">Прайсліст порожній</span>
                        <p className="text-sm">Зверніться до адміністратора для оновлення</p>
                      </div>
                    )
                  }
                </div>
              </ScrollArea>
            </div>
      }
    </div>
  )
}

const EPDialog = ({trigger, title, description}: {
  trigger: React.JSX.Element;
  title: string;
  description: string;
}) => {
  return (
    <Dialog>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='border-b pb-4'>{title}</DialogTitle>
          <DialogDescription className='whitespace-pre-wrap' style={{whiteSpace: "pre-wrap"}}>{description}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}