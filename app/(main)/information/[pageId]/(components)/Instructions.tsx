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


export default function Instructions() {

  const dispatch = useAppDispatch();
  const instructions = useAppSelector(state => state.information.data.instructions);
  const role = useAppSelector(state => state.user.role);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchInstructions());
  }, [dispatch]);

  const { deleteInstruction } = useInstructions();

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
              <Button>Видалити все</Button>
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
            {instructions?.items?.length > 0 ? (
              instructions.items.map((item) => {
                const rowContent = (
                  <div className={"grid grid-cols-[6fr_2fr_1fr] hover:bg-muted/50 transition-colors cursor-pointer"} onDoubleClick={() => {alert("OPEN")}}>
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
                          onConfirm={() => deleteInstruction(item)}
                          trigger={
                            <ContextMenuItem
                              variant="destructive"
                              className="cursor-pointer"
                              onSelect={(e) => e.preventDefault()} // ВАЖЛИВО
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
              <span className='text-center p-6'>Інструкції відсутні</span>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}