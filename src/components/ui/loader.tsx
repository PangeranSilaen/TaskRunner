import { Loader2 } from "lucide-react";

export function FullScreenLoader() {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-background">
      <Loader2 className="size-7 animate-spin text-primary" />
    </div>
  );
}
