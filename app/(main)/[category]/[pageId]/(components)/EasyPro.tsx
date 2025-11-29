"use client"

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useAppSelector } from '@/store/hooks'
import { EasyProDescrKeys, IEasyProData, IEasyProPricelistItem } from '@/types/data';
import { ListRestart } from 'lucide-react';
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import useFirestore from '@/hooks/useFirestore';

export default function EasyPro() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { updateEasyproPricelist } = useFirestore();

  const role = useAppSelector(state => state.user.role)

  const data = useAppSelector(state => state.data.collections.services.find(item => item.id === "easypro"))?.data as IEasyProData;
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
      const jsonData = XLSX.utils.sheet_to_json(ws, { defval: "" }) as IEasyProPricelistItem[]; // дефолтні пусті клітинки

      updateEasyproPricelist(jsonData, setLoading);
      e.target.value = "";  

    };
    reader.readAsArrayBuffer(file); 
  };

  return (
    <div className='w-full max-w-[1200px] flex flex-col'>
      <div className='flex items-center gap-2 w-full pb-4'>
        <span>Модель:</span>
        <Input id='model' placeholder='Введіть модель пристрою...' value={search} onChange={e => setSearch(e.target.value)} />
        {
          role === "admin" &&
            <>
              <Button type='button' onClick={() => fileInputRef.current?.click()}><ListRestart/></Button>
              <input type="file" accept=".xlsx, .xls" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            </>
        }
      </div>

      {
        loading 
          ? <div className="flex items-center"><Spinner className='size-20' /></div>
          : <div className="flex gap-4">
            <div className="pricelist flex-2">
              <h3></h3>
              <div className="flex flex-col w-full">
                <Table className='table-fixed'>
                  <colgroup>
                    <col style={{ width: "25%" }} />
                    <col style={{ width: "25%" }} />
                    <col style={{ width: "25%" }} />
                    <col style={{ width: "25%" }} />
                  </colgroup>

                  <TableHeader>
                    <TableRow>
                      <TableHead>Модель</TableHead>
                      <TableHead>Easy Pro</TableHead>
                      <TableHead>Easy Pro +2</TableHead>
                      <TableHead>Easy Pro +3</TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>

                <div className="max-h-[70vh] overflow-y-scroll">
                  <Table className='table-fixed'>
                    <colgroup>
                      <col style={{ width: "25%" }} />
                      <col style={{ width: "25%" }} />
                      <col style={{ width: "25%" }} />
                      <col style={{ width: "25%" }} />
                    </colgroup>
                  
                    <TableBody>
                      {
                        filteredList.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{item.model}</TableCell>
                            <TableCell>{item.easypro && item.easypro.toFixed(2)}</TableCell>
                            <TableCell>{item.easypro2 && item.easypro2.toFixed(2)}</TableCell>
                            <TableCell>{item.easypro3 && item.easypro3.toFixed(2)}</TableCell>
                          </TableRow>
                        ))
                      }
                    </TableBody>
                  </Table>
                </div>
              </div>
              
            </div>

            <div className="flex-1">
              <Accordion type="single" collapsible>
                {
                  Object.keys(data.description).sort().map((item, i) => {
                    const key = item as EasyProDescrKeys;
                    return (
                      <Card key={key} className='p-0 my-2'>
                        <AccordionItem value={`item-${i}`}>
                          <AccordionTrigger className='p-4 cursor-pointer'>{data.description[key].title}</AccordionTrigger>
                          <AccordionContent className='py-4 border-t-1 p-4 whitespace-pre-line'>
                            { data.description[key].text.replace(/<br\s*\/?>/g, '\n') }
                          </AccordionContent>
                        </AccordionItem>
                      </Card>
                    )
                  })
                }
              </Accordion>
            </div>
          </div>
      }
    </div>
  )
}

