import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FileUploader from '@/components/ui/FileUploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import useInstructions from '@/hooks/useInstructions';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeModal } from '@/store/slices/modalSlice';
import { InformationBase, InstructionsItem } from '@/types/information';
import { CircleCheck, CircleX, PencilIcon, TrashIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

type InstructionsModalPayload =
  | {
      mode: "instruction";
      data: InstructionsItem;
    }
  | {
      mode: "categories";
      data: InformationBase[];
    }
  | {
      mode: "instruction" | "categories";
      data: null;
};

const InstructionInnerModal = ({item}: {item: InstructionsItem | null}) => {
  const categories = useAppSelector(state => state.information.data.instructions.categories);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localItem, setLocalItem] = useState<InstructionsItem>(item ? item : {
    id: "",
    title: "",
    categoryId: "",
    url: ""
  } );

  const { addInstruction, updateInstruction, isLoading } = useInstructions();
  const dispatch = useAppDispatch();

  const onSaveItem = async () => {
    if (item) {
      await updateInstruction({item: localItem, file: selectedFile});
    } else {
      await addInstruction({item: localItem, file: selectedFile});
    }
    setSelectedFile(null);
    dispatch(closeModal());
  }

  return (
    <>
      <div className="flex flex-col gap-4 border-t pt-4">
        <div className="grid grid-cols-4 gap-2">
          <Label className=' pl-1' htmlFor='title'>Найменування:</Label>
          <Input id="title" className='col-span-3' placeholder='Введіть найменування...' value={localItem.title} onChange={e => setLocalItem(prev => ({...prev, title: e.target.value}))} />
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Label className='pl-1' htmlFor='category'>Категорія:</Label>
          <Select 
            value={localItem.categoryId}
            onValueChange={(value) =>
            setLocalItem(prev => ({
              ...prev,
              categoryId: value,
            }))
          }
          >
            <SelectTrigger className="col-span-3 w-full">
              <SelectValue placeholder="Виберіть категорію..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={"-"}>-</SelectItem>
                {
                  categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.title}</SelectItem>)
                }
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <FileUploader
          accept='application/pdf'
          allowedExtensions={['PDF']}
          description={localItem.url}
          selectedFile={selectedFile}
          onFileSelect={(file) => setSelectedFile(file)}
          onClear={() => {
            setLocalItem(prev => ({ ...prev, url: "" }));
            setSelectedFile(null);
          }}
        />
      </div>
      <DialogFooter className='pt-2'>
        <Button disabled={isLoading} onClick={onSaveItem} className='cursor-pointer'>
          {isLoading && <Spinner className="w-4 h-4" />}
          {isLoading ? "Збереження..." : "Зберегти"}
        </Button>
        <Button disabled={isLoading} onClick={() => dispatch(closeModal())} className='cursor-pointer'>Відміна</Button>
      </DialogFooter>
    </>
  )
}

const CategoriesInnerModal = () => {
  const categories = useAppSelector(state => state.information.data.instructions.categories);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [localItems, setLocalItems] = useState<InformationBase[]>(categories);
  const [editingCat, setEditingCat] = useState<InformationBase>({
    id: "",
    title: ""
  });

  useEffect(() => {
    setLocalItems(categories);
  }, [categories]);

  const dispatch = useAppDispatch();

  const { updateCategories } = useInstructions();

  const OnCategoryEdit = () => {
    setLocalItems(prev => prev.map(i => i.id === editingCat.id ? editingCat : i));
    setEditingCat({id: "", title: ""});
  }

  const onSaveCategories = async () => {
    await updateCategories(localItems);
    dispatch(closeModal());
  }

  const onClearCategories = async () => {
    await updateCategories([]);
    setLocalItems([]);
  }

  const onAddNewCategory = () => {
    if (!newCategoryName.trim()) {
      toast("Назва нової категорії не може бути порожня!");
      return;
    }
    if (localItems.some(c => c.title === newCategoryName.trim())) {
      toast("Категорія вже існує");
      return;
    }
    setLocalItems(prev => [...prev, {id: crypto.randomUUID(), title: newCategoryName}]);
    setNewCategoryName("");
  }

  const onDeleteCategory = (id: string) => {
    setLocalItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 justify-end">
        <Input placeholder='Введіть назву категорії...' value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
        <Button onClick={onAddNewCategory} className='cursor-pointer' disabled={!!editingCat.id}>Додати</Button>
        <ConfirmDialog 
          title='Видалити всі категрії?'
          description='Скасувати дію буде не можливо!'
          trigger={<Button variant={"destructive"} className='cursor-pointer'>Очистити</Button>}
          onConfirm={onClearCategories}
        />
      </div>
      <ScrollArea className='border rounded h-[400px]'>
        {
          localItems.map(cat => (
            <ContextMenu key={cat.id}>
              <ContextMenuTrigger className="border-b last:border-b-0">
                <div className={"hover:bg-muted/50 transition-colors cursor-pointer p-3 border-b"}>
                  {
                    editingCat.id.length > 0 && cat.id === editingCat.id? (
                      <div className="flex gap-2">
                        <Input 
                          value={editingCat.title} 
                          onChange={e => setEditingCat(prev => ({...prev, title: e.target.value}))}
                          onKeyDown={e => {
                            if (e.key === "Enter") OnCategoryEdit();
                          }}  
                        />
                        <div className="flex gap-2">
                          <button className='cursor-pointer' onClick={OnCategoryEdit}><CircleCheck /></button>
                          <button className='cursor-pointer' onClick={() => setEditingCat({id: "", title: ""})}><CircleX/></button>
                        </div>
                      </div>
                    ) : (
                      <span>{cat.title}</span>
                    )
                  }
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuGroup>
                  <ContextMenuItem className="cursor-pointer" onClick={() => setEditingCat({...cat})}>
                    <PencilIcon />
                    Змінити
                  </ContextMenuItem>
                  <ContextMenuItem variant="destructive" className="cursor-pointer" onClick={() => onDeleteCategory(cat.id)}>
                    <TrashIcon />
                    Видалити
                  </ContextMenuItem>
                </ContextMenuGroup>
              </ContextMenuContent>
            </ContextMenu>
          ))
        }
      </ScrollArea>
      <DialogFooter className='pt-2'>
        <Button className='cursor-pointer' onClick={onSaveCategories}>Зберегти</Button>
        <Button onClick={() => dispatch(closeModal())} className='cursor-pointer'>Відміна</Button>
      </DialogFooter>
    </div>
  )
}

export default function InstructionsModal() {
  const payload = useAppSelector(state => state.modal.payload) as InstructionsModalPayload | null;

  if (!payload) return <Spinner />
  return (
    <div className="">
      <DialogHeader className='w-[500px] pb-4'>
        <DialogTitle>
          {
            payload.mode === "instruction" ?
              payload.data ? "Редактор інструкції" : "Додати інструкцію"
            : "Редакор категорій"
          }
        </DialogTitle>
        <DialogDescription>
          {
            payload.mode === "instruction" ?
              payload.data ? "Внесіть зміни до поточної інструкції" : "Додайте нову інструкцію до списку"
            : "Внесіть зміни до списку категорій"
          }
        </DialogDescription>
      </DialogHeader>
      <div className="">
        {
          payload.mode === "instruction" ? <InstructionInnerModal item={payload.data} /> : <CategoriesInnerModal />
        }
      </div>
      
    </div>
  )
}