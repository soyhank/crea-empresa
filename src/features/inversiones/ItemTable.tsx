import type { ItemInversion } from "@/core/schemas";
import { sumaItems, costoTotalItem } from "@/core/calc";
import { formatNumber } from "@/core/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { rowId } from "@/lib/utils";
import { Lock, Plus, Trash2 } from "lucide-react";

/** Tabla editable de ítems de inversión (rubro · cantidad · precio → total). */
export function ItemTable({
  items, onChange, prefijo = "it", subtotalLabel = "Subtotal",
}: {
  items: ItemInversion[];
  onChange: (next: ItemInversion[]) => void;
  prefijo?: string;
  subtotalLabel?: string;
}) {
  const upd = (id: string, patch: Partial<ItemInversion>) => onChange(items.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const add = () => onChange([...items, { id: rowId(prefijo), rubro: "", cantidad: 1, precio: 0 }]);
  const del = (id: string) => onChange(items.filter((x) => x.id !== id));
  const num = (v: string) => Number(v) || 0;
  const enterAdds = (e: React.KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); add(); } };

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs font-medium text-muted-foreground">
            <th className="pb-1 pl-1">Rubro</th><th className="pb-1 w-16">Cant.</th>
            <th className="pb-1 w-24">Precio</th><th className="pb-1 w-24 text-right">Total</th><th className="w-9" />
          </tr>
        </thead>
        <tbody>
          {items.map((x) => (
            <tr key={x.id}>
              <td className="py-1 pr-2"><Input value={x.rubro} placeholder="Rubro" onChange={(e) => upd(x.id, { rubro: e.target.value })} /></td>
              <td className="py-1 pr-2"><Input type="number" className="tabular" value={x.cantidad || ""} onChange={(e) => upd(x.id, { cantidad: num(e.target.value) })} /></td>
              <td className="py-1 pr-2">
                <div className="relative"><span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">S/</span><Input type="number" className="tabular pl-7" value={x.precio || ""} onKeyDown={enterAdds} onChange={(e) => upd(x.id, { precio: num(e.target.value) })} /></div>
              </td>
              <td className="py-1 pr-2 text-right text-sm font-medium tabular text-slate-700">{formatNumber(costoTotalItem(x))}</td>
              <td className="py-1"><Button variant="ghost" size="icon" onClick={() => del(x.id)} disabled={items.length <= 1} aria-label="Eliminar"><Trash2 className="text-muted-foreground" /></Button></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="rounded-l-md bg-slate-50 py-2 pl-3 text-xs font-medium text-slate-700"><span className="inline-flex items-center gap-1"><Lock className="size-3 text-muted-foreground" /> {subtotalLabel}</span></td>
            <td className="bg-slate-50 py-2 text-right text-sm font-semibold tabular text-slate-900">{formatNumber(sumaItems(items))}</td>
            <td className="rounded-r-md bg-slate-50" />
          </tr>
        </tfoot>
      </table>
      <div className="mt-2"><Button variant="outline" size="sm" onClick={add}><Plus /> Agregar ítem</Button></div>
    </div>
  );
}
