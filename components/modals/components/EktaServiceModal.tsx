import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import { EktaListItem, EktaServicesDataItem } from '@/types/services';
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileUp, FileX, Plus, X } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { closeModal } from '@/store/slices/modalSlice';
import useFirestore from '@/hooks/useFirestore';

export default function EktaServiceModal() {
  const payload = useAppSelector(state => state.modal.payload) as EktaServicesDataItem;
  const [service, setService] = useState<EktaServicesDataItem>(payload ? payload : {
    id: "",
    title: "",
    order: null,
    list: [],
  });

  const dispatch = useAppDispatch();
  const { updateEktaServicesData } = useFirestore();

  useEffect(() => {
    if (payload) setService(payload);
  }, [payload]);

  const onSaveChanges = async () => {
    await updateEktaServicesData({action: payload ? "update" : "add", item: service});
    dispatch(closeModal());
  }

  return (
    <div className="">
      <DialogHeader>
        <DialogTitle>{ payload ? `Внесіть зміни до: ${payload.title}` : "Додайте новий сервіс" }</DialogTitle>
        <DialogDescription>
          Налаштуйте сервіси Екта
        </DialogDescription>
      </DialogHeader>

      <div className="py-4 flex gap-2">
        <div className="flex flex-col">
          <Label htmlFor='id' className='ml-2'>ID:</Label>
          <Input id="id" placeholder='Введіть ID...' value={service.id} onChange={e => setService(prev => ({...prev, id: e.target.value}))} disabled={payload ? true : false}  />
        </div>
        <div className="flex flex-2 flex-col">
          <Label htmlFor='title' className='ml-2'>Назва сервісу:</Label>
          <Input id="title" placeholder='Введіть назву...' value={service.title} onChange={e => setService(prev => ({...prev, title: e.target.value}))} />
        </div>
        <div className="flex flex-col">
          <Label htmlFor='order' className='ml-2'>Порядковий номер:</Label>
          <Input type="number" id='order' placeholder='Введіть порядковий номер...'  />
        </div>       
      </div>

      <div className="border rounded-md overflow-hidden mb-4">
        <Table>
          <TableHeader className='bg-muted/50'>
              <TableRow>
                <TableHead className='min-w-[50px] max-w-[50px] w-[50px] border wrap-break-word whitespace-normal'>Код товару</TableHead>
                <TableHead className='min-w-[300px] max-w-[300px] w-[300px] border'>
                  <div className="flex w-full items-center justify-between">
                    <span>Найменування</span>
                    <div className="flex items-center gap-4">
                      <EktaHoverCard trigger={<EktaEditDialog trigger={<Plus size={24} />} />} text='Додати' />
                      <EktaHoverCard trigger={<X size={24} className='text-chart-5' />} text='Видалити всі' />
                    </div>
                  </div>
                </TableHead>
                <TableHead className='min-w-[50px] max-w-[50px] w-[50px] border'>Ціна, грн.</TableHead>
                <TableHead className='min-w-[50px] max-w-[50px] w-[50px] border'>Порядок</TableHead>
                <TableHead className='min-w-[50px] max-w-[50px] w-[50px] border'>Опис</TableHead>
              </TableRow>
            </TableHeader>
        </Table>
        <ScrollArea className="h-72 w-full rounded-md border">
          <Table>         
            <TableBody>
              {
                service.list.map((item) => (
                    <EktaEditDialog
                      key={item.id}
                      trigger={
                        <TableRow className='cursor-pointer' >
                          <TableCell className='min-w-[50px] max-w-[50px] w-[50px] border wrap-break-word whitespace-normal'>{item.productCode}</TableCell>
                          <TableCell className='min-w-[300px] max-w-[300px] w-[300px] border wrap-break-word whitespace-normal'>{item.title}</TableCell>
                          <TableCell className='min-w-[50px] max-w-[50px] w-[50px] border'>{item.price}</TableCell>
                          <TableCell className='min-w-[50px] max-w-[50px] w-[50px] border'>{item.order ? item.order : "-"}</TableCell>
                          <TableCell className='min-w-[50px] max-w-[50px] w-[50px] border'>{item.description ? "+" : "-"}</TableCell>
                        </TableRow>
                      }
                      items={service.list}
                      setItems={setService}
                      currentItem={item}
                    />
                  ))
              }
            </TableBody>
          </Table>
        </ScrollArea>
        
      </div>

      <DialogFooter>
        <Button type='button' onClick={onSaveChanges}>Зберегти</Button>
        <Button type='button' onClick={() => dispatch(closeModal())}>Відміна</Button>
      </DialogFooter>
    </div>
  )
}

const EktaHoverCard = ({trigger, text}: {
  trigger: React.JSX.Element,
  text: string;
}) => {
  return(
    <HoverCard openDelay={10} closeDelay={100}>
      <HoverCardTrigger className='cursor-pointer' asChild>{ trigger }</HoverCardTrigger>
      <HoverCardContent className='w-auto text-sm'>{ text }</HoverCardContent>
    </HoverCard>
  )
}

function EktaEditDialog({ trigger, items, currentItem, setItems }: {
  trigger: React.JSX.Element;
  items?: EktaListItem[];
  setItems?: Dispatch<SetStateAction<EktaServicesDataItem>>;
  currentItem?: EktaListItem;
}) {
  const [localItem, setLocalItem] = useState<EktaListItem>(currentItem ? currentItem : {
    id: "",
    title: "",
    order: null,
    price: 0,
    description: ""
  });

  // useEffect(() => {
  //   setLocalItem(currentItem);
  // }, [currentItem])

  return (
    <Dialog>
      <DialogTrigger asChild>{ trigger }</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редаткор</DialogTitle>
          <DialogDescription>Внесіть зміни до: {localItem.title}</DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-2">
            <Label htmlFor="id">ID:</Label>
            <Input id="id" value={localItem.id} onChange={e => setLocalItem(prev => ({...prev, id: e.target.value}))} disabled={currentItem ? true : false} />
          </div>

          <div className="col-span-4">
            <Label htmlFor="title">Найменування:</Label>
            <Input id="title" value={localItem.title} onChange={e => setLocalItem(prev => ({...prev, title: e.target.value}))}  />
          </div>

          <div className="col-span-2">
            <Label htmlFor="productCode">Код товару:</Label>
            <Input id="productCode" value={localItem.productCode} onChange={e => setLocalItem(prev => ({...prev, productCode: e.target.value}))}   />
          </div>

          <div className="col-span-2">
            <Label htmlFor="price">Ціна, грн:</Label>
            <Input id="price" value={localItem.price} onChange={e => setLocalItem(prev => ({...prev, price: +e.target.value}))}  />
          </div>

          <div className="col-span-2">
            <Label htmlFor="order">№ порядку:</Label>
            <Input id="order" value={String(localItem.order)} onChange={e => setLocalItem(prev => ({...prev, order: +e.target.value}))}  />
          </div>

          <div className="col-span-4 ">
            <div className="flex items-center gap-2">
              <Label htmlFor="descr">Опис:</Label>
              <Input id="descr" defaultValue="..." />
              <EktaHoverCard trigger={<FileUp />} text='Додати файл опису' />
              <EktaHoverCard trigger={<FileX />} text='Видалити файл опису' />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button>Зберегти</Button>
          <Button type="button" variant={"destructive"}>Видалити</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}