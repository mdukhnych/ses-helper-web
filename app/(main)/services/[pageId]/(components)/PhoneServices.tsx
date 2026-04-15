"use client"

import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
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

function AdminActions({data}: {data: PhoneServicesData}) {
  const dispatch = useAppDispatch();
  const { clearPhoneServices } = usePhoneServices();

  return (
    <div className="flex gap-4 pb-4">
      <Button type="button" className="cursor-pointer" onClick={() => dispatch(openModal({type: "phone-services", payload: {mode: "services", data: null}}))}>Сервіси</Button>
      <Button type="button" className="cursor-pointer" onClick={() => dispatch(openModal({type: "phone-services", payload: {mode: "goods", data: data.goodsAndServices}}))}>Послуги / товари</Button>
      <ConfirmDialog 
        trigger={<Button type="button" variant={"destructive"} disabled={data.servicesItems.length <= 0}>Видалити всі сервіси</Button>}
        title="Видалити всі сервіси?"
        description="Скасувати операцію буде неможливо!"
        onConfirm={clearPhoneServices}
      />
    </div>
  )
}

export default function PhoneServices() {
  const data = useAppSelector(state => state.services.data.find(item => item.id === "phone-services")?.data as PhoneServicesData);
  const role = useAppSelector(state => state.user.role);

  const { deletePhoneService } = usePhoneServices();

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchPhoneServicesData());
  }, [dispatch])

  const servicesWithSet = useMemo(() => {
    if (!data) return []

    return data.servicesItems.map(service => ({
      ...service,
      itemsSet: new Set(service.items.map(item => item.id)),
    }))
  }, [data]);

  if (!data) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Spinner className="size-40" />
      </div>
    )
  }

  const sortedServicesItems = [...data.servicesItems].sort((a, b) => {
    const orderA = a.order ?? Infinity;
    const orderB = b.order ?? Infinity;

    if (orderA === orderB) {
      return a.id.localeCompare(b.id);
    }

    return orderA - orderB;
  });

  return (
    <div >
      {role === "admin" && <AdminActions data={data} />}
      <div className="relative w-full overflow-auto rounded-md">
        <Table className="table-fixed w-full border">

          <colgroup>
            <col style={{ minWidth: 400 }} />
            {data.servicesItems.map(service => (
              <col
                key={service.id}
                style={{ width: 150, minWidth: 150, maxWidth: 150 }}
              />
            ))}
          </colgroup>

          <TableHeader className="bg-sidebar-accent text-base">
            <TableRow> 
              <TableHead className="sticky left-0 z-20 min-w-[400px] bg-sidebar-accent border-r-4 py-4">
                Перелік товарів та робіт
              </TableHead>

              {sortedServicesItems.map(service => (
                <TableHead className="w-[150px] min-w-[150px] max-w-[150px] text-center border-r" key={service.id}>
                  {
                    role === "admin" ?
                      <DropdownMenu>
                        <DropdownMenuTrigger className="cursor-pointer">{service.title}</DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => dispatch(openModal({type: "phone-services", payload: {mode: "services", data: service}}))} >Змінити</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <ConfirmDialog 
                            trigger={<DropdownMenuItem onSelect={e  => e.preventDefault()}>Видалити</DropdownMenuItem>}
                            title="Видалити сервіс?"
                            description="Скасувати операцію буде неможливо!"
                            onConfirm={() => deletePhoneService(service.id)}
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    : <span>{service.title} </span>
                  }
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.goodsAndServices.map(item => (
              <TableRow key={item.id} className="hover:*:bg-sidebar-accent">
                <TableCell className="sticky left-0 z-10 min-w-[400px] bg-background border-r wrap-break-word whitespace-normal">
                  <Popover>
                    <PopoverTrigger asChild className="cursor-pointer select-none">
                      <span>{item.title}</span>
                    </PopoverTrigger>
                    <PopoverContent align="start">
                      <PopoverHeader>
                        <PopoverTitle>{item.title}</PopoverTitle>
                        <PopoverDescription className="" style={{whiteSpace: 'pre-wrap'}}>
                          {item.description}
                        </PopoverDescription>
                      </PopoverHeader>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                {servicesWithSet.map(service => (
                  <TableCell key={service.id} className="w-[150px] min-w-[150px] max-w-[150px] text-center border-l">
                    {service.itemsSet.has(item.id) ? (
                      <CircleCheckBig className="inline-block text-green-600" />
                    ) : (
                      <Minus className="inline-block text-muted-foreground" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>

          <TableFooter className="text-base">
            <TableRow>
              <TableCell className="sticky left-0 z-10 min-w-[400px] bg-sidebar-accent border-r-4 ">Вартість послуг</TableCell>
              {servicesWithSet.map(service => (
                <TableCell className="w-[150px] min-w-[150px] max-w-[150px] bg-sidebar-accent text-center border-l p-4" key={service.id}>
                  {formatPrice(service.price)}
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
          
        </Table>
      </div>
    </div>
  )
}
