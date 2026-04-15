'use client'

import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Pencil,  X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { closeModal } from '@/store/slices/modalSlice';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { AddPhoneServiceItem, BaseServiceItem, GoodsAndServicesItem, PhoneServiceItem, PhoneServicesData } from '@/types/services';
import { Label } from '@radix-ui/react-label';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import usePhoneServices from '@/hooks/usePhoneServices';

type PhoneServicesModalPayload =
  | {
      mode: "services";
      data: PhoneServiceItem;
    }
  | {
      mode: "goods";
      data: GoodsAndServicesItem[];
    }
  | {
      mode: "services" | "goods";
      data: null;
};

const GoodsAndServicesModal = ({data}: {data: GoodsAndServicesItem[] | null}) => {
  const [items, setItems] = useState<GoodsAndServicesItem[]>([]);
  const dispatch = useAppDispatch();


  useEffect(() => {
    if (data) {
      setItems(data)
    }
  }, [data]);

  const { updateGoodsAndServices } = usePhoneServices();

  const handleRemove = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  return(
    <div className='w-[750px]'>
      <DialogHeader className='py-4'>
        <DialogTitle>{"Налаштування товарів та робіт"}</DialogTitle>
        <DialogDescription>{'Для збереження порядку використовуйте послідовність чисел в полі "ID"'}</DialogDescription>
        <div className="flex gap-2 justify-end">
          <EditDiaolg trigger={<Button type='button'>Додати</Button>} item={null} setItems={setItems} />
          
          <ConfirmDialog 
            trigger={<Button disabled={items.length <= 0} variant={"destructive"} type="button">Видалити все</Button>} 
            title='Ви впевнені?'
            description='Скасувати операцію буде неможливо!'
            onConfirm={() => setItems([])}
          />
        </div>
      </DialogHeader>
      <ScrollArea className="h-72 w-full rounded-md border">
        <div className="p-4">
          {items.map((item, i) => (
            <React.Fragment key={item.id}>
              <div className="text-sm flex items-center justify-between min-w-0">
                <span className='flex-1 min-w-0 break-all whitespace-normal'>{item.title}</span>
                <div className="flex gap-2 items-center">
                  <EditDiaolg trigger={<Pencil className='cursor-pointer' />} item={item} setItems={setItems} />
                  
                  <X className='cursor-pointer text-chart-5' onClick={() => handleRemove(i)} />
                </div>
              </div>
              <Separator className="my-2" />
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>
      
      <DialogFooter className='mt-4'>
        <Button type="button" onClick={async () => {
          await updateGoodsAndServices(items);
          dispatch(closeModal());
        }}>Зберегти</Button>
        <Button type="button" onClick={() => dispatch(closeModal())}>Відмінити</Button>
      </DialogFooter>
    </div>
  )
}

const ServiceModal = ({data}: {data: PhoneServiceItem | null}) => {
  const { goodsAndServices } = useAppSelector(state => state.services.data.find(item => item.id === "phone-services"))?.data as PhoneServicesData;
  const [localItem, setLocalItem] = useState<AddPhoneServiceItem>(() => {
    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...itemWithoutId } = data;
      return itemWithoutId;
    }
    return {
      title: "",
      price: 0,
      order: null,
      items: [],
    };
  });
  const [isLoading, setIsLoading] = useState(false);

  const nonSelectedItems = useMemo(() => {
    if (!goodsAndServices) return [];
      const selectedIds = new Set(localItem.items.map(i => i.id));
      
      return goodsAndServices
        .filter(item => !selectedIds.has(item.id))
        .map(item => ({ id: item.id, title: item.title }));
    }, [goodsAndServices, localItem.items]);

  const dispatch = useAppDispatch();
  const { addPhoneService, updatePhoneService } = usePhoneServices();

  const moveToSelected = (item: BaseServiceItem) => {
    setLocalItem(prev => ({
      ...prev, 
      items: [...prev.items, { id: item.id, title: item.title }]
    }));
  };

  const moveToNonSelected = (item: BaseServiceItem) => {
    setLocalItem(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== item.id)
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      if (!data) {
        addPhoneService(localItem);
      } else {
        console.log(localItem)
        updatePhoneService(data.id, localItem);
      }
      toast.success("Дані збережено успішно!");
      dispatch(closeModal()); 
    } catch (error) {
      console.error(error);
      toast.error("Помилка при збереженні");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[750px]">
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
          <div className="p-2">
            {nonSelectedItems.map(item => item).map((item) => (
              <React.Fragment key={item.id}>
                  <div className="text-sm flex items-center justify-between cursor-pointer select-none hover:bg-accent py-3 px-1 rounded" onDoubleClick={() => moveToSelected(item)}>
                    <span>{item.title}</span>
                  </div>
                <Separator className="" />
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>

        <ScrollArea className="h-72 w-full rounded-md border">
          <div className="p-2">
            {localItem.items.map((item) => (
              <React.Fragment key={item.id}>
                <div className="text-sm flex items-center justify-between cursor-pointer select-none hover:bg-accent py-3 px-1 rounded" onDoubleClick={() => moveToNonSelected(item)}>
                  <span>{item.title}</span>
                </div>
                <Separator className="" />
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="py-4 flex gap-2">
        <div className="flex flex-col flex-2">
          <Label htmlFor='title' className='ml-2'>Назва:</Label>
          <Input id="title" placeholder='Введіть назву...' value={localItem.title} onChange={e => setLocalItem(prev => ({...prev, title: e.target.value}))} />
        </div>
        <div className="flex flex-col">
          <Label htmlFor='price' className='ml-2'>Ціна, грн.:</Label>
          <Input id='price' placeholder='Введіть ціну в грн...' value={localItem.price} onChange={e => setLocalItem(prev => ({...prev, price: +e.target.value}))} />
        </div>
      </div>

      <DialogFooter className='mt-4 '>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Збереження...
            </>
          ) : (
            "Зберегти"
          )}
        </Button>
        <Button type="button" onClick={() => dispatch(closeModal())}>Відмінити</Button>
      </DialogFooter>
      
    </div>
  )
}

export default function PhoneServicesModal() {
  const payload = useAppSelector(state => state.modal.payload) as PhoneServicesModalPayload | null;

  if (!payload) return <Spinner />
  if (payload.mode === "goods") return <GoodsAndServicesModal data={payload.data} />
  if (payload.mode === "services") return <ServiceModal data={payload.data} />
}

const EditDiaolg = ({trigger, item, setItems}: {
  trigger: React.JSX.Element;
  item: GoodsAndServicesItem | null;
  setItems: React.Dispatch<React.SetStateAction<GoodsAndServicesItem[]>>;
}) => {
  const [localItem, setLocalItem] = useState<GoodsAndServicesItem>(item ? item : {
    id: "",
    title: "",
    description: "",
  });
  const [open, setOpen] = useState(false);
 
  useEffect(() => {
    if (item) {
      setLocalItem(item);
    } else if (open) { 
      setLocalItem({
        id: crypto.randomUUID(),
        title: "",
        description: ""
      });
    }
  }, [item, open]);

  const onSave = () => {
    setItems(prev => {
      if (item) {
        return prev.map(el => 
          el.id === localItem.id ? localItem : el
        );
      } else {
        return [...prev, localItem];
      }
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Внесіть зміни" : "Додайте новий"}</DialogTitle>
          <DialogDescription>
            Внесіть зміни
          </DialogDescription>
        </DialogHeader>
        <div className="">
          <div className="flex flex-col">
            <Label htmlFor='title' className='ml-2'>Назва:</Label>
            <Input id="title" placeholder='Введіть назву...' value={localItem.title} onChange={e => setLocalItem(prev => ({...prev, title: e.target.value}))} />
          </div>
          <div className="flex flex-col">
            <Label htmlFor='descr' className='ml-2'>Опис:</Label>
            <Textarea id="descr" placeholder='Введіть опис...' value={localItem.description} onChange={e => setLocalItem(prev => ({...prev, description: e.target.value}))} />
          </div>
        </div>
        <DialogFooter>
          <Button type='button' onClick={onSave}>Зберегти</Button>
          <Button type='button' onClick={() => setOpen(false)}>Відміна</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}