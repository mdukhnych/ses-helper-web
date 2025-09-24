'use client'

import * as React from "react"
import { GalleryVerticalEnd, Minus, Plus } from "lucide-react"

import { SearchForm } from "@/components/search-form"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAppSelector } from "@/store/hooks"
import Link from "next/link"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [openItem, setOpenItem] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const data = useAppSelector(state => state.data.data);

  const sortedData = [...data].sort((a, b) => {
    if (a.order === undefined && b.order === undefined) return 0; 
    if (a.order === undefined) return 1; 
    if (b.order === undefined) return -1; 
    return a.order - b.order;
  });

  const filteredData = sortedData
    .map(group => {
      const filteredSubItems = group.data?.filter(sub =>
        sub.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) || []

      if (group.title.toLowerCase().includes(searchQuery.toLowerCase()) || filteredSubItems.length) {
        return { ...group, data: filteredSubItems }
      }

      return null
    })
    .filter(Boolean) as typeof sortedData

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">SES-helper</span>
                  <span className="">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SearchForm value={searchQuery} onChange={setSearchQuery} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {filteredData.map((item, index) => (
              <Collapsible
                key={item.title}
                className="group/collapsible"
                onOpenChange={(openItem) => setOpenItem(openItem ? index : null)}
                open={searchQuery.length > 0 ? true : openItem === index}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="cursor-pointer">
                      {item.title}{" "}
                      <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                      <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {item.data?.length ? (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {
                          item.data.map((item, index) => (
                            <SidebarMenuSubItem key={index} className="cursor-pointer">
                              <SidebarMenuSubButton
                                asChild
                                // isActive={item.isActive}
                              >
                                <Link href={`/${item.id}`}>{item.title}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        )}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
