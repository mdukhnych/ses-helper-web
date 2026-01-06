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
import { CircleCheckBig, Ellipsis, Minus } from "lucide-react";
import { formatPrice } from "@/utils";
import { PhoneServicesData } from "@/types/services";
import { openModal } from "@/store/slices/modalSlice";

function AdminActions() {

  const dispatch = useAppDispatch();
  return (
    <div className="flex gap-4 border-b pb-4">
      <Button type="button" className="cursor-pointer" onClick={() => {dispatch(openModal({type: "phone-services", payload: null}))}}>Сервіси</Button>
      <Button type="button" className="cursor-pointer">Послуги / товари</Button>
    </div>
  )
}

export default function PhoneServices() {
  const data = useAppSelector(state => state.services.data.find(item => item.id === "phone-services")?.data as PhoneServicesData);
  const role = useAppSelector(state => state.user.role);

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

  return (
    <div>
      {role === "admin" && <AdminActions />}

      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow> 
            <TableHead className="border-l first:border-l-0 flex items-center justify-between py-6">
              Перелік товарів та робіт
              {
                role === "admin" && 
                  <DropdownMenu>
                    <DropdownMenuTrigger className="cursor-pointer"><Ellipsis/></DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Додати</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Видалити всі</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              }
            </TableHead>

            {servicesWithSet.map(service => (
              <TableHead className="text-center" key={service.id}>
                {
                  role === "admin" ?
                    <DropdownMenu>
                      <DropdownMenuTrigger className="cursor-pointer">{service.title}</DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Змінити</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Видалити</DropdownMenuItem>
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
            <TableRow key={item}>
              <TableCell className="font-medium flex items-center justify-between">
                {item}
                {
                  role === "admin" ?
                    <DropdownMenu>
                      <DropdownMenuTrigger className="cursor-pointer"><Ellipsis/></DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Змінити</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Видалити</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  : <span>{item}</span>
                }
              </TableCell>

              {servicesWithSet.map(service => (
                <TableCell key={service.id} className="text-center border-l">
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

        <TableFooter>
          <TableRow>
            <TableCell>Вартість послуг</TableCell>

            {servicesWithSet.map(service => (
              <TableCell className="text-center py-4" key={service.id}>
                {formatPrice(service.price)}
              </TableCell>
            ))}
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
