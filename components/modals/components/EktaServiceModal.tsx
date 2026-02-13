import React, { useEffect, useRef, useState } from 'react';

import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import { EktaListItem, EktaServicesDataItem } from '@/types/services';
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input';

import { closeModal } from '@/store/slices/modalSlice';
import useFirestore from '@/hooks/useFirestore';
import { Spinner } from '@/components/ui/spinner';
import { FileUp, FileX } from 'lucide-react';
import { checkUniqueId } from '@/utils';
import useFirebaseStorage from '@/hooks/useFirebaseStorage';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

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
  const [item, setItem] = useState<EktaServicesDataItem>(data ? data : {
    id: "",
    title: "",
    order: null,
    list: []
  });

  useEffect(() => {
    if (data) setItem(data);
  }, [data]);


  const dispatch = useAppDispatch();
  const { updateEktaServicesData } = useFirestore();

  const onSaveChanges = async () => {
    await updateEktaServicesData({action: data ? "update" : "add", item: item});
    dispatch(closeModal());
  }

  return (
    <div className="w-[350px]">
      <DialogHeader>
        <DialogTitle>{ data ? `Внесіть зміни до: ${data.title}` : "Додайте нову групу" }</DialogTitle>
        <DialogDescription>
          Налаштуйте сервіси Екта
        </DialogDescription>
      </DialogHeader>

      <div className="py-4 flex flex-col gap-4">
        <div className="flex flex-col">
          <Label htmlFor='id' className='ml-2'>ID:</Label>
          <Input id="id" placeholder='Введіть ID...' disabled={data ? true : false} value={item.id} onChange={e => setItem(prev => ({...prev, id: e.target.value}))}  />
        </div>
        <div className="flex flex-2 flex-col">
          <Label htmlFor='title' className='ml-2'>Назва сервісу:</Label>
          <Input id="title" placeholder='Введіть назву...' value={item.title} onChange={e => setItem(prev => ({...prev, title: e.target.value}))}  />
        </div>
        <div className="flex flex-col">
          <Label htmlFor='order' className='ml-2'>Порядковий номер:</Label>
          <Input type="number" id='order' placeholder='Введіть порядковий номер...' value={item.order ?? ""} onChange={e => setItem({...item, order: e.target.value.length > 0 ? +e.target.value : null})} />
        </div>       
      </div>

      <DialogFooter>
        <Button type='button' onClick={onSaveChanges}>Зберегти</Button>
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();

  const { updateEktaServicesData } = useFirestore();
  const { uploadFile, deleteFile, loading } = useFirebaseStorage();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Only PDF allowed");
      return;
    }
    setSelectedFile(file);
  };

  const onSaveItem = async () => {
    let updatedList: EktaListItem[] = [];
    const ids: string[] = service.list.map(item => item.id);

    if (!listItem) {
      if (!checkUniqueId(localItem.id, ids)) return;
    }

    let downloadURL: string | null = null;

    try {
      if (selectedFile) {
        downloadURL = await uploadFile({path: `/services/ekta/${service.id}/`, file: selectedFile});
      }

      if (!localItem.description && listItem?.description) {
        await deleteFile(listItem.description);
        downloadURL = null;
      }

      if (listItem) {
        updatedList = service.list.map(item =>
          item.id === localItem.id ? {
            ...localItem,
            description: downloadURL ?? "",
          } : item
        );
      } else {
        
        updatedList = [...service.list, {
          ...localItem,
          description: downloadURL ?? "",
        }];
      }

      await updateEktaServicesData({action: "update", item: {...service, list: updatedList}});
      setSelectedFile(null);
      dispatch(closeModal());
    } catch (error) {
      console.error("Save error:", error);
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
        <div className="flex flex-col">
          <Label htmlFor='id' className='ml-2'>ID:</Label>
          <Input id="id" placeholder='Введіть ID...' disabled={listItem ? true : false} value={localItem.id} onChange={e => setLocalItem(prev => ({...prev, id: e.target.value}))}  />
        </div>
        <div className="flex flex-2 flex-col">
          <Label htmlFor='productCode' className='ml-2'>Код товару:</Label>
          <Input id="productCode" placeholder='Введіть код товару...' value={localItem.productCode} onChange={e => setLocalItem(prev => ({...prev, productCode: e.target.value}))}  />
        </div>
        <div className="flex flex-2 flex-col">
          <Label htmlFor='title' className='ml-2'>Назва сервісу:</Label>
          <Input id="title" placeholder='Введіть назву...' value={localItem.title} onChange={e => setLocalItem(prev => ({...prev, title: e.target.value}))}  />
        </div>
        <div className="flex flex-2 flex-col">
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

        <div className="flex items-center gap-2">
          <Label htmlFor="descr">Опис:</Label>
          <Input
            id="descr"
            value={selectedFile ? selectedFile.name : localItem.description}
            readOnly
            placeholder="Файл опису..."
          />

          <button
            type="button"
            title="Додати файл опису"
            onClick={handleFileSelect}
            className="cursor-pointer"
          >
            <FileUp />
          </button>
          
          <ConfirmDialog 
            trigger={
              <button
                type="button"
                title="Видалити файл опису"
                className="cursor-pointer"
              >
                <FileX />
              </button>
            } 
            title='Видалити файл?' 
            description='Скасувати операцію буде неможливо!'
            onConfirm={
              () => {
                setLocalItem(prev => ({...prev, description: ""}));
                setSelectedFile(null);
              }
            }
          />
          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
            hidden
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          disabled={loading}
          onClick={onSaveItem}
          className="min-w-[130px]"
        >
          {loading && <Spinner className="mr-2 h-4 w-4" />}
          {loading ? "Збереження..." : "Зберегти"}
        </Button>
        <Button type='button' disabled={loading} onClick={() => dispatch(closeModal())} >Відміна</Button>
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