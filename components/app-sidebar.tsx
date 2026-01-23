'use client'

import { GalleryVerticalEnd, LogOut, Minus, Plus } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { ThemeSwitcher } from "./ui/theme-switcher";
import { Button } from "./ui/button";
import useAuth from "@/hooks/useAuth";
import { useAppSelector } from "@/store/hooks";
import { Spinner } from "./ui/spinner";
import { Services } from "@/types/services";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { logout } = useAuth();

  const services = useAppSelector(state => state.services.data);

  function sortByOrder(arr: Services) {
    return [...arr].sort((a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : Infinity;
      const orderB = typeof b.order === 'number' ? b.order : Infinity;

      return orderA - orderB;
    });
  }

  if (!services) return <div className="flex items-center justify-center"><Spinner/></div>

  return(
    <Sidebar {...props}>
      <SidebarHeader >
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between p-2">
            <div className="flex gap-2 items-center">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">SES-helper</span>
                <span className="">v1.0.0</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent >
        <SidebarGroup>
          <SidebarMenu>

            <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="cursor-pointer">
                      <span className="">Сервіси SES</span>
                      <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                      <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {sortByOrder(services).map((subItem, idx) => (
                        <SidebarMenuSubItem key={idx} className="cursor-pointer">
                          <SidebarMenuSubButton asChild className="overflow-visible h-auto p-1" >
                            <Link href={`/services/${subItem.id}`} >{subItem.title}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            {/* {sortByOrder(data.menu).map((item) => (
              <Collapsible
                key={item.id}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="cursor-pointer">
                      {item.title}
                      <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                      <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {sortByOrder(data.collections[item.id]).map((subItem, idx) => (
                        <SidebarMenuSubItem key={idx} className="cursor-pointer">
                          <SidebarMenuSubButton asChild className="overflow-visible h-auto p-1" >
                            <Link href={`/${item.id}/${subItem.id}`} >{subItem.title}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))} */}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />

      <SidebarFooter className="border-t py-3">
        <div className="flex items-center justify-end gap-2">
          <ThemeSwitcher />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="cursor-pointer">
                <LogOut />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Ви впевнені що хочете вийти з облікового запису?</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">Ні</AlertDialogCancel>
                <AlertDialogAction className="cursor-pointer" onClick={logout}>Так</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}