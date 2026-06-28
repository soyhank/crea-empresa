import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface BaseProps {
  label: string;
  /** Unidad mostrada como sufijo (S/, %, kg, unid). */
  unidad?: string;
  helper?: string;
  error?: string;
  className?: string;
  id?: string;
}

interface NumberFieldProps extends BaseProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

/** Campo numérico editable (fondo blanco) con unidad, helper y error inline. */
export function NumberField({
  label, unidad, helper, error, value, onChange, min, max, step, placeholder, className, id,
}: NumberFieldProps) {
  const auto = React.useId();
  const fid = id ?? auto;
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={fid}>{label}</Label>
      <div className="relative">
        <Input
          id={fid}
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step ?? "any"}
          placeholder={placeholder}
          aria-invalid={!!error}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className={cn("tabular", unidad && "pr-12")}
        />
        {unidad && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
            {unidad}
          </span>
        )}
      </div>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : helper ? (
        <p className="text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  );
}

interface PercentFieldProps extends BaseProps {
  /** Fracción 0..1 (se muestra como %). */
  value: number;
  onChange: (fraction: number) => void;
  /** Anotación a la derecha del label, p. ej. "→ Mercado disponible". */
  annotation?: React.ReactNode;
  max?: number;
}

/** Campo de porcentaje: el usuario escribe %, el modelo guarda fracción 0..1. */
export function PercentField({
  label, helper, error, value, onChange, annotation, max = 100, className, id,
}: PercentFieldProps) {
  const auto = React.useId();
  const fid = id ?? auto;
  const display = value ? +(value * 100).toFixed(4) : "";
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={fid}>{label}</Label>
        {annotation && <span className="text-xs font-medium text-primary">{annotation}</span>}
      </div>
      <div className="relative">
        <Input
          id={fid}
          type="number"
          inputMode="decimal"
          step="any"
          min={0}
          max={max}
          value={display}
          aria-invalid={!!error}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value) / 100)}
          className="tabular pr-8"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">%</span>
      </div>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : helper ? (
        <p className="text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  );
}

interface TextFieldProps extends BaseProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

/** Campo de texto editable con helper y error inline. */
export function TextField({ label, helper, error, value, onChange, placeholder, className, id }: TextFieldProps) {
  const auto = React.useId();
  const fid = id ?? auto;
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={fid}>{label}</Label>
      <Input
        id={fid}
        value={value}
        placeholder={placeholder}
        aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value)}
      />
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : helper ? (
        <p className="text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  );
}
