import React, { useEffect, useState } from 'react';

import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import { EktaListItem, EktaServicesDataItem, UpdateEktaGroup } from '@/types/services';
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';

import { closeModal } from '@/store/slices/modalSlice';
import { Spinner } from '@/components/ui/spinner';
import FileUploader from '@/components/ui/FileUploader';
import useEktaService from '@/hooks/useEktaService';

type EktaServicesModalPayload =
  | {
      mode: "services";
      data: EktaServicesDataItem;
    }
  | {
      mode: "goods";
      data: {
        service: EktaServicesDataItem;
        listItem: EktaListItem | null;
      };
};

const Service = ({data}: {data: EktaServicesDataItem | null}) => {
  const [item, setItem] = useState<UpdateEktaGroup>(
    data 
      ? { title: data.title, order: data.order, list: data.list }
      : { title: "", order: null, list: [] }
  );

  useEffect(() => {
    if (data) setItem(data);
  }, [data]);

  const dispatch = useAppDispatch();
  const { addEktaGroup, updateEktaGroup } = useEktaService();

  return (
    <div className="w-[350px]">
      <DialogHeader>
        <DialogTitle>{ data ? `Внесіть зміни до: ${data.title}` : "Додайте нову групу" }</DialogTitle>
        <DialogDescription>
          Налаштуйте сервіси Екта
        </DialogDescription>
      </DialogHeader>

      <div className="py-4 flex flex-col gap-4">
        <div className="flex flex-2 flex-col gap-1">
          <Label htmlFor='title' className='ml-2'>Назва сервісу:</Label>
          <Input id="title" placeholder='Введіть назву...' value={item.title} onChange={e => setItem(prev => ({...prev, title: e.target.value}))}  />
        </div>
      </div>

      <DialogFooter>
        <Button type='button' onClick={() => data ? updateEktaGroup(data.id, item) : addEktaGroup(item)}>Зберегти</Button>
        <Button type='button' onClick={() => dispatch(closeModal())}>Відміна</Button>
      </DialogFooter>
    </div>
  )
}

const GoodsAndServices = ({service, listItem}: {
  service: EktaServicesDataItem;
  listItem: EktaListItem | null;
}) => {
  const [localItem, setLocalItem] = useState<EktaListItem>(listItem ? listItem : {
    id: "",
    title: "",
    productCode: "",
    price: 0,
    description: ""
  });

  useEffect(() => {
    if (listItem) setLocalItem(listItem);
  }, [listItem]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const dispatch = useAppDispatch();

  const { addEktaItem, updateEktaItem, isLoading } = useEktaService();

  const onSaveItem = async () => {
    if (listItem) {
      await updateEktaItem({
        docId: service.id,
        newData: localItem,
        fileData: {
          prevURL: listItem.description,
          file: selectedFile
        }
      });
    } else {
      await addEktaItem({ docId: service.id, item: localItem, file: selectedFile });
    }
  }

  return(
    <div className="w-[350px]">
      <DialogHeader>
        <DialogTitle>{ listItem ? `Внесіть зміни до: ${listItem.title}` : "Додайте новий елемент" }</DialogTitle>
        <DialogDescription>
          Налаштуйте сервіси Екта
        </DialogDescription>
      </DialogHeader>

      <div className="py-4 flex flex-col gap-4">
        <div className="flex flex-2 flex-col gap-1">
          <Label htmlFor='productCode' className='ml-2'>Код товару:</Label>
          <Input id="productCode" placeholder='Введіть код товару...' value={localItem.productCode} onChange={e => setLocalItem(prev => ({...prev, productCode: e.target.value}))}  />
        </div>
        <div className="flex flex-2 flex-col gap-1">
          <Label htmlFor='title' className='ml-2'>Назва сервісу:</Label>
          <Input id="title" placeholder='Введіть назву...' value={localItem.title} onChange={e => setLocalItem(prev => ({...prev, title: e.target.value}))}  />
        </div>
        <div className="flex flex-2 flex-col gap-1">
          <Label htmlFor='price' className='ml-2'>Ціна:</Label>
          <Input
            id="price"
            type="number"
            min={0}
            step={1}
            placeholder="Введіть ціну..."
            value={localItem.price === 0 ? "" : localItem.price}
            onChange={(e) => {
              const value = e.target.value;

              setLocalItem(prev => ({
                ...prev,
                price: value === "" ? 0 : parseInt(value, 10)
              }));
            }}
          />
        </div>

        <FileUploader
          accept='application/pdf'
          allowedExtensions={['PDF']}
          description={localItem.description}
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
          onClick={onSaveItem}
          className="min-w-[130px]"
        >
          {isLoading && <Spinner className="mr-2 h-4 w-4" />}
          {isLoading ? "Збереження..." : "Зберегти"}
        </Button>
        <Button type='button' disabled={isLoading} onClick={() => dispatch(closeModal())} >Відміна</Button>
      </DialogFooter>
    </div>
  )
}

export default function EktaServiceModal() {
  const payload = useAppSelector(state => state.modal.payload) as EktaServicesModalPayload | null;

  if (!payload) return null;

  if (payload.mode === "services") return <Service data={payload.data} />
  if (payload.mode === "goods") return <GoodsAndServices service={payload.data.service} listItem={payload.data.listItem} />
}