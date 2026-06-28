/** Genera una contraseña temporal legible y segura (sin caracteres ambiguos). */
export function generarPasswordTemporal(longitud = 12): string {
  const mayus = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // sin I, O
  const minus = "abcdefghijkmnpqrstuvwxyz"; // sin l, o
  const nums = "23456789"; // sin 0, 1
  const sign = "!@#$%*?";
  const all = mayus + minus + nums + sign;
  const rnd = (n: number) => {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return a[0] % n;
  };
  // Garantiza al menos uno de cada clase.
  const base = [mayus[rnd(mayus.length)], minus[rnd(minus.length)], nums[rnd(nums.length)], sign[rnd(sign.length)]];
  for (let i = base.length; i < longitud; i++) base.push(all[rnd(all.length)]);
  // Mezcla (Fisher-Yates).
  for (let i = base.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [base[i], base[j]] = [base[j], base[i]];
  }
  return base.join("");
}

/** Copia texto al portapapeles; devuelve true si lo logró. */
export async function copiarAlPortapapeles(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    return false;
  }
}
