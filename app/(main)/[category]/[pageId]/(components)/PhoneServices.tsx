"use client"

import React, { useMemo } from "react";
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

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { CircleCheckBig, Minus } from "lucide-react";
import { formatPrice } from "@/utils";
import { PhoneServiceItem, PhoneServicesData } from "@/types/services";
import { openModal } from "@/store/slices/modalSlice";
import useFirestore from "@/hooks/useFirestore";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

function AdminActions({data}: {data: PhoneServicesData}) {
  const dispatch = useAppDispatch();

  return (
    <div className="flex gap-4 pb-4">
      <Button type="button" className="cursor-pointer" onClick={() => dispatch(openModal({type: "phone-services", payload: {mode: "services", data: null}}))}>Сервіси</Button>
      <Button type="button" className="cursor-pointer" onClick={() => dispatch(openModal({type: "phone-services", payload: {mode: "goods", data: data.goodsAndServices}}))}>Послуги / товари</Button>
    </div>
  )
}

export default function PhoneServices() {
  const data = useAppSelector(state => state.services.data.find(item => item.id === "phone-services")?.data as PhoneServicesData);
  const role = useAppSelector(state => state.user.role);

  const { updatePhoneServicesData } = useFirestore();

  const dispatch = useAppDispatch();

  const servicesWithSet = useMemo(() => {
    if (!data) return []

    return data.servicesItems.map(service => ({
      ...service,
      itemsSet: new Set(service.items),
    }))
  }, [data])

  if (!data) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Spinner className="size-40" />
      </div>
    )
  }

  const handleDeleteService = async (service: PhoneServiceItem) => {
    const updatedServices = data.servicesItems.filter(item => item.id !== service.id);
    await updatePhoneServicesData({action: "services", items: updatedServices});
  }

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
              <TableHead className="sticky left-0 z-20 min-w-[400px] bg-sidebar-accent border-r py-4">
                Перелік товарів та робіт
              </TableHead>

              {data.servicesItems.map(service => (
                <TableHead className="w-[150px] min-w-[150px] max-w-[150px] text-center border-r" key={service.id}>
                  {
                    role === "admin" ?
                      <DropdownMenu>
                        <DropdownMenuTrigger className="cursor-pointer">{service.title}</DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => dispatch(openModal({type: "phone-services", payload: {mode: "services", data: service}}))} >Змінити</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {/* <AlertDialogDemo trigger={<DropdownMenuItem onSelect={e  => e.preventDefault()}>Видалити</DropdownMenuItem>} title="Видалити сервіс?" description="Ви точно впевнені? Після видалення відновлення не можливе!" submit={() => handleDeleteService(service)} /> */}
                          <ConfirmDialog 
                            trigger={<DropdownMenuItem onSelect={e  => e.preventDefault()}>Видалити</DropdownMenuItem>}
                            title="Видалити сервіс?"
                            description="Скасувати операцію буде неможливо!"
                            onConfirm={() => handleDeleteService(service)}
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
              <TableRow key={item} className="hover:*:bg-sidebar-accent">
                <TableCell className="sticky left-0 z-10 min-w-[400px] bg-background border-r wrap-break-word whitespace-normal">
                  {item}
                </TableCell>
                {servicesWithSet.map(service => (
                  <TableCell key={service.id} className="w-[150px] min-w-[150px] max-w-[150px] text-center border-l">
                    {service.itemsSet.has(item) ? (
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
              <TableCell className="sticky left-0 z-10 min-w-[400px] bg-sidebar-accent border-r ">Вартість послуг</TableCell>
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
