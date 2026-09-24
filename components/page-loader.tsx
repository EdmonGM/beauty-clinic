import { Spinner } from "./ui/spinner"

export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 rounded-lg bg-background p-8">
        <Spinner className="size-8" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
