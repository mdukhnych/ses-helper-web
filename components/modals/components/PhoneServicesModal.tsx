'use client'

import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import {  DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Pencil, Plus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { closeModal } from '@/store/slices/modalSlice';
import { Input } from '@/components/ui/input';
import AlertDialogDemo from '@/components/shared/AlertDialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Spinner } from '@/components/ui/spinner';
import { PhoneServiceItem, PhoneServicesData } from '@/types/services';
import { Label } from '@radix-ui/react-label';
import useFirestore from '@/hooks/useFirestore';
import { checkUniqueId } from '@/utils';

type PhoneServicesModalPayload =
  | {
      mode: "services";
      data: PhoneServiceItem;
    }
  | {
      mode: "goods";
      data: string[];
    }
  | {
      mode: "services" | "goods";
      data: null;
};

const GoodsAndServicesModal = ({data}: {data: string[] | null}) => {
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState<string>("");

  const dispatch = useAppDispatch();

  const { updatePhoneServicesData } = useFirestore();

  useEffect(() => {
    if (data) {
      setItems(data)
    }
  }, [data]);

  const handleRemove = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleAdd = (item: string) => {
    if (item.length > 0) {
      setItems(prev => [...prev, item]);
      setNewItem("");
    } else {
      toast.info("Поле не може бути порожнім!");
    }
  }

  return(
    <div>
      <DialogHeader className='py-4'>
        <DialogTitle>{"Налаштування товарів та робіт"}</DialogTitle>
        <DialogDescription className='flex items-center justify-between'>
          Внесіть зміни
          <AlertDialogDemo trigger={<Button variant={"destructive"} type="button">Видалити все</Button>} title='Ви впевнені?' description='Ви точно впевнені в своєму рішені? Відновити видалені дані буде не можливо!' submit={() => setItems([])} />
        </DialogDescription>
      </DialogHeader>
      <ScrollArea className="h-72 w-full rounded-md border">
        <div className="p-4">
          {items.map((item, i) => (
            <React.Fragment key={item}>
              <div className="text-sm flex items-center justify-between min-w-0">
                <span className='flex-1 min-w-0 break-all whitespace-normal'>{item}</span>
                <div className="flex gap-2 items-center">
                  <EditPopover items={items} setItems={setItems} index={i} />
                  <X className='cursor-pointer text-chart-5' onClick={() => handleRemove(i)} />
                </div>
              </div>
              <Separator className="my-2" />
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>

      <div className="py-4 flex gap-2">
        <Input placeholder='Введіть назву...' value={newItem} onChange={e => setNewItem(e.target.value)} />
        <Button type='button' onClick={() => handleAdd(newItem)}><Plus/></Button>
      </div>
      
      <DialogFooter className='mt-4'>
        <Button type="button" onClick={() => dispatch(closeModal())}>Відмінити</Button>
        <Button type="button" onClick={() => {
          updatePhoneServicesData({action: "goods", items: items});
          dispatch(closeModal());
        }}>Зберегти</Button>
      </DialogFooter>
    </div>
  )
}

const PhoneServiceModal = ({data}: {data: PhoneServiceItem | null}) => {
  const { goodsAndServices, servicesItems } = useAppSelector(state => state.services.data.find(item => item.id === "phone-services"))?.data as PhoneServicesData;
  const [service, setService] = useState<PhoneServiceItem>(
    data ? data : {
      id: "",
      title: "",
      price: 0,
      order: null,
      items: []
    }
  );
  const [nonSelectedItems, setNonselectedItems] = useState<string[]>([]);

  useEffect(() => {
    if (data) {
      setService(data);
    }
    if (goodsAndServices) {
      setNonselectedItems(goodsAndServices.filter(item => !data?.items.includes(item)));
    }
  }, [data, goodsAndServices])

  const moveToSelected = (item: string) => {
    setNonselectedItems(prev => prev.filter(i => i !== item));
    setService(prev => ({...prev, items: [...prev.items, item]}));
  };

  const moveToNonSelected = (item: string) => {
    setService(prev => ({...prev, items: prev.items.filter(i => i !== item)}));
    setNonselectedItems(prev => [...prev, item]);
  };

  const phoneServicesIds = servicesItems.map(item => item.id);

  const dispatch = useAppDispatch();

  const { updatePhoneServicesData } = useFirestore();

  return(
    <div>
      <DialogHeader className='py-4'>
        <DialogTitle>
          {
            data ? `Налаштування сервісу "${data.title}"` : "Додайте новий сервіс"
          }
        </DialogTitle>
        <DialogDescription className='flex items-center justify-between'>
          Внесіть зміни
        </DialogDescription>
      </DialogHeader>

      <div className="flex items-center gap-2">
        <ScrollArea className="h-72 w-full rounded-md border">
          <div className="p-4">
            {nonSelectedItems.map(item => item).map((item) => (
              <React.Fragment key={item}>
                <div className="text-sm flex items-center justify-between cursor-pointer" onDoubleClick={() => moveToSelected(item)}>
                  <span>{item}</span>
                </div>
                <Separator className="my-2" />
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>

        <ScrollArea className="h-72 w-full rounded-md border">
          <div className="p-4">
            {service.items.map((item) => (
              <React.Fragment key={item}>
                <div className="text-sm flex items-center justify-between cursor-pointer" onDoubleClick={() => moveToNonSelected(item)}>
                  <span>{item}</span>
                </div>
                <Separator className="my-2" />
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="py-4 flex gap-2">
        { 
          !data &&
            <div className="flex flex-col">
              <Label htmlFor='id' className='ml-2'>ID:</Label>
              <Input id="id" placeholder='Введіть ID...' value={service.id} onChange={e => setService({...service, id: e.target.value})} />
            </div>
        }
        <div className="flex flex-col">
          <Label htmlFor='title' className='ml-2'>Назва:</Label>
          <Input id="title" placeholder='Введіть назву...' value={service.title} onChange={e => setService({...service, title: e.target.value})} />
        </div>
        <div className="flex flex-col">
          <Label htmlFor='price' className='ml-2'>Ціна, грн.:</Label>
          <Input id='price' placeholder='Введіть ціну в грн...' value={service.price} onChange={e => setService({...service, price: +e.target.value})} />
        </div>
        <div className="flex flex-col">
          <Label htmlFor='order' className='ml-2'>Порядок:</Label>
          <Input type="number" id='prder' placeholder='Введіть порядковий номер...' value={service.order ? service.order : ""} onChange={e => setService({...service, order: e.target.value.length > 0 ? +e.target.value : null})} />
        </div>
        
      </div>
      
      <DialogFooter className='mt-4 '>
        <Button type="button" onClick={() => dispatch(closeModal())}>Відмінити</Button>
        <Button type="button" onClick={() => {
          if (!data) {
            if (checkUniqueId(service.id, phoneServicesIds ? phoneServicesIds : [])) {
              const newServices = [...servicesItems, service];
              updatePhoneServicesData({action: "services", items: newServices});
              dispatch(closeModal());
            }
          } else {
            const newServices = servicesItems.map(item => item.id === service.id ? service : item);
            updatePhoneServicesData({action: "services", items: newServices});
            dispatch(closeModal());
          }
        }}>Зберегти</Button>
      </DialogFooter>
    </div>
  )
}

export default function PhoneServicesModal() {
  const payload = useAppSelector(state => state.modal.payload) as PhoneServicesModalPayload | null;

  if (!payload) return <Spinner />
  if (payload.mode === "goods") return <GoodsAndServicesModal data={payload.data} />
  if (payload.mode === "services") return <PhoneServiceModal data={payload.data} />
}

const EditPopover = ({items, setItems, index}: {
  items: string[];
  setItems: React.Dispatch<React.SetStateAction<string[]>>;
  index: number;
}) => {
  const [value, setValue] = useState(items[index]);

  const handleEdit = () => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  }

  return(
    <Popover>
      <PopoverTrigger asChild>
        <Pencil />
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Введіть нове значення:</h4>
          </div>
          <div className="grid gap-2">
            <Input
              className='w-full'
              value={value}
              onChange={e => setValue(e.target.value)}
            />
            <Button type='button' onClick={handleEdit}>Змінити</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}