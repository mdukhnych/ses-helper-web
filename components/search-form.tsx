import { Search } from "lucide-react"

import { Label } from "@/components/ui/label"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "@/components/ui/sidebar"
import { FormEvent } from "react";

interface ISerchFormParams {
  value: string;
  onChange: (value: string) => void;
}

export function SearchForm({ value, onChange }: ISerchFormParams ) {
  return (
    <form onSubmit={(e: FormEvent) => {e.preventDefault()}}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder="Пошук..."
            className="pl-8"
            value={value}
            onChange={e => onChange(e.target.value)}
          />
          <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  )
}
