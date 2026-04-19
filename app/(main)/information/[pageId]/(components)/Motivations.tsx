'use client'

import ConfirmDialog from '@/components/shared/ConfirmDialog';
import PdfViewer from '@/components/shared/PdfViewer';
import { Button } from '@/components/ui/button';
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import useMotivations from '@/hooks/useMotivations';
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchMotivations } from '@/store/slices/informationSlice';
import { openModal } from '@/store/slices/modalSlice';
import { CircleCheckBig, Minus, PencilIcon, TrashIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

export default function Instructions() {
  const role = useAppSelector(state => state.user.role);
  const motivations = useAppSelector(state => state.information.data.motivations);
  const [selectedDoc, setSelectedDoc] = useState<{ url: string, title: string } | null>(null);
  const [searchValue, setSearchValue] = useState("");

  const dispatch = useAppDispatch();
  const { deleteMotivation, clearMotivations } = useMotivations();

  useEffect(() => {
    dispatch(fetchMotivations());
  }, [dispatch]);

  const filteredItems = React.useMemo(() => {
    if (!motivations.items) return [];

    return motivations.items.filter((item) => {

      const matchesSearch = item.title
        .toLowerCase()
        .includes(searchValue.toLowerCase());

      return matchesSearch;
    });
  }, [motivations.items, searchValue]);

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
    <div className='flex flex-col gap-4'>
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <Label>Пошук:</Label>
          <Input className='w-[400px]' placeholder='Введіть назву мотивації...' value={searchValue} onChange={e => setSearchValue(e.target.value)} />
        </div>
        {
          role === "admin" &&
            <div className="flex gap-2">
              <Button type='button' onClick={() => dispatch(openModal({type: "motivations", payload: null}))}>Додати</Button>
              <ConfirmDialog 
                trigger={<Button disabled={!motivations.items?.length} variant={"destructive"} type='button'>Видалити всі</Button>}
                title='Видалити всі мотивації?'
                description='Скасувати операцію буде неможливо!'
                onConfirm={async () => {
                  await clearMotivations();
                }}
              />
            </div>
        }
      </div>

      <div className="flex gap-4 flex-1 overflow-hidden">
        <ScrollArea className='relative border w-full rounded-lg overflow-hidden '>

          <div className="grid grid-cols-[6fr_1fr] bg-sidebar-accent border-b font-semibold text-sm sticky top-0 z-20 w-full">
            <div className="p-4 border-r">Найменування</div>
            <div className="p-4 border-r">Файл</div>
          </div>
          <div className="flex flex-col">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const rowContent = (
                  <div className={"grid grid-cols-[6fr_1fr] hover:bg-muted/50 transition-colors select-none cursor-pointer"} onDoubleClick={() => item.url ? setSelectedDoc({ url: item.url, title: item.title }) : toast("Файл не знайдено!")}>
                    <div className="p-4 border-r flex items-center font-medium">{item.title}</div>
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
                        <ContextMenuItem className="cursor-pointer" onClick={() => dispatch(openModal({type: "motivations", payload: item}))}>
                          <PencilIcon />
                          Змінити
                        </ContextMenuItem>
                        <ConfirmDialog
                          title="Видалити?"
                          onConfirm={async () => {
                            await deleteMotivation(item);
                          }}
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
                <span className="text-lg font-medium">Список мотивацій порожній</span>
                <p className="text-sm">Додайте першу мотивацію за допомогою кнопки вище</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

    </div>
  )
}
