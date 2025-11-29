import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
  return (
    <div className="flex w-full h-full justify-center items-center">
      <Spinner className="size-20"/>
    </div>
  )
}
