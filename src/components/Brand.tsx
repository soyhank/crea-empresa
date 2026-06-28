import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
        C
      </div>
      <span className="text-sm font-semibold tracking-tight">
        Crea<span className="text-primary">Empresa</span>
      </span>
    </div>
  );
}
