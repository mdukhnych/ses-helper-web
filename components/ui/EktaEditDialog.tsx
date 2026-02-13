import { EktaListItem, EktaServicesDataItem } from "@/types/services";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { DialogFooter, DialogHeader } from "./dialog";
import { Label } from "@radix-ui/react-label";
import { Input } from "./input";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Button } from "./button";
import AlertDialogDemo from "../shared/ConfirmDialog";
import { FileUp, FileX } from "lucide-react";
import { checkUniqueId } from "@/utils";
import { useAppDispatch } from "@/store/hooks";

export default function EktaEditDialog({ trigger, items, currentItem, setItems }: {
  trigger: React.JSX.Element;
  items: EktaListItem[];
  setItems: Dispatch<SetStateAction<EktaServicesDataItem>>;
  currentItem: EktaListItem | null;
}) {
  const [localItem, setLocalItem] = useState<EktaListItem>(currentItem ? currentItem : {
    id: "",
    title: "",
    productCode: "",
    order: null,
    price: 0,
    description: ""
  });
  const [isOpen, setIsOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();




  useEffect(() => {
    if (isOpen) {
      setLocalItem(currentItem ?? {
        id: "",
        title: "",
        productCode: "",
        order: null,
        price: 0,
        description: ""
      });
    }
  }, [isOpen, currentItem]);

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
    setFileName(file.name);
  };

  const onSaveItem = () => {
    console.log(selectedFile)
    let updatedList: EktaListItem[] = [];
    const ids: string[] = items.map(item => item.id);

    if (currentItem) {
      updatedList = items.map(item => item.id === localItem.id ? localItem : item );
      setItems(prev => ({...prev, list: updatedList}));
      setIsOpen(false);
      return;
    } 

    if(checkUniqueId(localItem.id, ids)) {
      updatedList = [...items, localItem];
      setItems(prev => ({...prev, list: updatedList}));
      setIsOpen(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} >
      <DialogTrigger asChild>{ trigger }</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редаткор</DialogTitle>
          <DialogDescription>
            {
              currentItem ?
                <span>Внесіть зміни до: {currentItem.title}</span>
              : <span>Додайте новий елемент</span>
            }
          </DialogDescription>
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
              <Input
                id="descr"
                value={fileName}
                readOnly
                placeholder="Файл опису..."
              />

              <EktaHoverCard trigger={<FileUp onClick={handleFileSelect} />} text='Додати файл опису' />
              <EktaHoverCard trigger={<FileX />} text='Видалити файл опису' />

              <input
                type="file"
                accept="application/pdf"
                ref={fileInputRef}
                onChange={handleFileChange}
                hidden
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type='button' onClick={onSaveItem}>Зберегти</Button>
          {
            currentItem && 
              <AlertDialogDemo 
                trigger={<Button type="button" variant={"destructive"}>Видалити</Button>} 
                title='Видалити запис?' 
                submit={() => {
                  const updatedList = items.filter(item => item.id !== currentItem.id);
                  setItems(prev => ({...prev, list: updatedList}));
                  setIsOpen(false);
                }} 
              />
          }
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
