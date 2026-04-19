'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchInstructions } from '@/store/slices/informationSlice';
import React, { useEffect, useState } from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CircleCheckBig, Minus, PencilIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { openModal } from '@/store/slices/modalSlice';
import useInstructions from '@/hooks/useInstructions';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import PdfViewer from '@/components/shared/PdfViewer';
import { toast } from 'sonner';


export default function Instructions() {

  const dispatch = useAppDispatch();
  const instructions = useAppSelector(state => state.information.data.instructions);
  const role = useAppSelector(state => state.user.role);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<{ url: string, title: string } | null>(null);

  useEffect(() => {
    dispatch(fetchInstructions());
  }, [dispatch]);

  const { deleteInstruction, clearInstructions } = useInstructions();

  const filteredItems = React.useMemo(() => {
    if (!instructions.items) return [];

    return instructions.items.filter((item) => {
      const matchesCategory = category === "all" || item.categoryId === category;

      const matchesSearch = item.title
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [instructions.items, category, search]);

  const onClearInstructions = async () => {
    await clearInstructions(category);
  }

  if (selectedDoc) {
    return (
      <PdfViewer 
        url={selectedDoc.url} 
        title={selectedDoc.title} 
        onBack={() => setSelectedDoc(null)} 
      />
    );
  }

  return (
    <div className=''>
      <div className="flex justify-between items-center pb-4 px-2">
        <div className="flex gap-4 items-center">
          <div className="flex gap-2 items-center">
            <Label className=''>Категорія:</Label>
            <Select defaultValue='all' onValueChange={setCategory}>
              <SelectTrigger className="w-[180px]" >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Всі</SelectItem>
                  {
                    instructions.categories.map(item => <SelectItem key={item.id} value={item.id}>{item.title}</SelectItem>)
                  }
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 items-center">
            <Label>Пошук:</Label>
            <Input className='w-[360px]' placeholder='Введіть назву інструкції...' value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {
          role === "admin" && 
            <div className="flex gap-2">
              <Button onClick={() => dispatch(openModal({type: "instructions", payload: {mode: "instruction", data: null}}))}>Додати інструкцію</Button>
              <Button onClick={() => dispatch(openModal({type: "instructions", payload: {mode: "categories", data: null }}))}>Редактор категорій</Button>
              <ConfirmDialog 
                title='Видалити всі інструкції?'
                description='Скасувати операцію буде неможливо!'
                trigger={<Button variant={"destructive"} disabled={filteredItems.length <= 0 }>{category === "all" ? "Видалити все" : `Видалити категорію`}</Button>}
                onConfirm={async () => {await onClearInstructions()}}
              />
            </div>
        }
      </div>

      <div className="flex gap-4 flex-1 overflow-hidden">
        <ScrollArea className='relative border w-full rounded-lg overflow-hidden '>

          <div className="grid grid-cols-[6fr_2fr_1fr] bg-sidebar-accent border-b font-semibold text-sm sticky top-0 z-20 w-full">
            <div className="p-4 border-r">Найменування</div>
            <div className="p-4 border-r">Категорія</div>
            <div className="p-4 border-r">Файл</div>
          </div>
          <div className="flex flex-col">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const rowContent = (
                  <div className={"grid grid-cols-[6fr_2fr_1fr] hover:bg-muted/50 transition-colors cursor-pointer"} onDoubleClick={() => item.url ? setSelectedDoc({ url: item.url, title: item.title }) : toast("Файл не знайдено!")}>
                    <div className="p-4 border-r flex items-center font-medium">{item.title}</div>
                    <div className="p-4 border-r flex items-center">
                      {instructions.categories.find((i) => i.id === item.categoryId)?.title}
                    </div>
                    <div className="p-4 border-r flex items-center justify-center">
                      {item.url ? (
                        <CircleCheckBig className="inline-block text-green-600" />
                      ) : (
                        <Minus className="inline-block text-muted-foreground" />
                      )}
                    </div>
                  </div>
                );

                if (role !== 'admin') {
                  return (
                    <div key={item.id} className="border-b last:border-b-0">
                      {rowContent}
                    </div>
                  );
                }

                return (
                  <ContextMenu key={item.id}>
                    <ContextMenuTrigger className="border-b last:border-b-0">
                      {rowContent}
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuGroup>
                        <ContextMenuItem className="cursor-pointer" onClick={() => dispatch(openModal({type: "instructions", payload: {mode: "instruction", data: item}}))}>
                          <PencilIcon />
                          Змінити
                        </ContextMenuItem>
                        <ConfirmDialog
                          title="Видалити?"
                          onConfirm={async () => {await deleteInstruction(item)}}
                          trigger={
                            <ContextMenuItem
                              variant="destructive"
                              className="cursor-pointer"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <TrashIcon />
                              Видалити
                            </ContextMenuItem>
                          }
                        />
                      </ContextMenuGroup>
                    </ContextMenuContent>
                  </ContextMenu>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center p-10 text-muted-foreground">
                <span className="text-lg font-medium">
                  {search || category !== "all" 
                    ? "Нічого не знайдено" 
                    : "Список інструкцій порожній"}
                </span>
                <p className="text-sm">
                  {search || category !== "all"
                    ? "Спробуйте змінити параметри пошуку або обрати іншу категорію"
                    : "Додайте першу інструкцію за допомогою кнопки вище"}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}