"use client"

import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { CircleCheckBig, Minus } from "lucide-react";
import { formatPrice } from "@/utils";
import { PhoneServicesData } from "@/types/services";
import { openModal } from "@/store/slices/modalSlice";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { fetchPhoneServicesData } from "@/store/slices/servicesSlice";
import usePhoneServices from "@/hooks/usePhoneServices";

function AdminActions({ data }: { data: PhoneServicesData }) {
  const dispatch = useAppDispatch();
  const { clearPhoneServices } = usePhoneServices();

  return (
    <div className="flex gap-4 pb-4">
      <Button 
        type="button" 
        onClick={() => dispatch(openModal({ type: "phone-services", payload: { mode: "services", data: null } }))}
      >
        Сервіси
      </Button>
      <Button 
        type="button" 
        onClick={() => dispatch(openModal({ type: "phone-services", payload: { mode: "goods", data: data.goodsAndServices } }))}
      >
        Послуги / товари
      </Button>
      <ConfirmDialog 
        trigger={
          <Button type="button" variant="destructive" disabled={data.servicesItems.length <= 0}>
            Видалити всі сервіси
          </Button>
        }
        title="Видалити всі сервіси?"
        description="Скасувати операцію буде неможливо!"
        onConfirm={clearPhoneServices}
      />
    </div>
  )
}

export default function PhoneServices() {
  const dispatch = useAppDispatch();
  const { deletePhoneService } = usePhoneServices();
  
  const rawData = useAppSelector(state => state.services.data.find(item => item.id === "phone-services")?.data);
  const data = rawData as PhoneServicesData | undefined;
  const role = useAppSelector(state => state.user.role);

  useEffect(() => {
    dispatch(fetchPhoneServicesData());
  }, [dispatch]);

  const sortedServices = useMemo(() => {
    if (!data?.servicesItems) return [];
    
    return [...data.servicesItems]
      .sort((a, b) => {
        const orderA = a.order ?? Infinity;
        const orderB = b.order ?? Infinity;
        return orderA === orderB ? a.id.localeCompare(b.id) : orderA - orderB;
      })
      .map(service => ({
        ...service,
        itemsSet: new Set(service.items.map(item => item.id)),
      }));
  }, [data?.servicesItems]);

  const sortedGoods = useMemo(() => {
    if (!data?.goodsAndServices) return [];
    return [...data.goodsAndServices].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [data?.goodsAndServices]);

  if (!data) {
    return (
      <div className="flex w-full h-full items-center justify-center min-h-[400px]">
        <Spinner className="size-20" />
      </div>
    );
  }

  const gridTemplate = `minmax(400px, 1fr) repeat(${sortedServices.length}, 150px)`;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {role === "admin" && <AdminActions data={data} />}
      
      <div className="relative flex-1 border rounded-md overflow-auto shadow-sm bg-background">
        <div className="min-w-full w-fit">
          
          <div 
            className="sticky top-0 z-30 bg-sidebar-accent border-b font-medium text-base shadow-sm"
            style={{ display: 'grid', gridTemplateColumns: gridTemplate }}
          >
            <div className="p-4 border-r sticky left-0 z-40 bg-sidebar-accent">
              Перелік товарів та робіт
            </div>
            {sortedServices.map(service => (
              <div key={service.id} className="p-4 border-r text-center flex items-center justify-center bg-sidebar-accent">
                {role === "admin" ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="cursor-pointer hover:underline outline-none">
                      {service.title}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => dispatch(openModal({ type: "phone-services", payload: { mode: "services", data: service } }))}>
                        Змінити
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <ConfirmDialog 
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                            Видалити
                          </DropdownMenuItem>
                        }
                        title="Видалити сервіс?"
                        onConfirm={() => deletePhoneService(service.id)}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <span>{service.title}</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col">
            {sortedGoods.length > 0 ? (
              sortedGoods.map(item => (
                <div 
                  key={item.id} 
                  className="grid border-b hover:bg-muted/50 transition-colors group"
                  style={{ gridTemplateColumns: gridTemplate }}
                >
                  <div className="p-4 border-r sticky left-0 z-10 bg-background group-hover:bg-muted/50 font-medium overflow-hidden">
                    <Popover>
                      <PopoverTrigger asChild>
                        <span className="cursor-pointer hover:text-primary transition-colors block truncate w-full text-left">
                          {item.title}
                        </span>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-medium leading-none">{item.title}</h4>
                          <p className="text-sm whitespace-pre-wrap">
                            {item.description || "Опис відсутній"}
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  {sortedServices.map(service => (
                    <div key={`${item.id}-${service.id}`} className="p-4 border-r flex items-center justify-center">
                      {service.itemsSet.has(item.id) ? (
                        <CircleCheckBig className="text-green-600 size-5" />
                      ) : (
                        <Minus className="text-muted-foreground/40 size-5" />
                      )}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-muted-foreground bg-background">
                Список товарів порожній
              </div>
            )}
          </div>

          <div 
            className="sticky bottom-0 z-30 bg-sidebar-accent border-t font-semibold shadow-[0_-2px_4px_rgba(0,0,0,0.05)]"
            style={{ display: 'grid', gridTemplateColumns: gridTemplate }}
          >
            <div className="p-4 border-r sticky left-0 z-40 bg-sidebar-accent uppercase text-xs text-muted-foreground flex items-center">
              Вартість послуг
            </div>
            {sortedServices.map(service => (
              <div key={`footer-${service.id}`} className="p-4 border-r text-center flex items-center justify-center bg-sidebar-accent">
                {formatPrice(service.price)}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}