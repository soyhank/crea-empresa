import { describe, expect, it } from "vitest";
import {
  IDENTITY_EMAIL_DOMAIN,
  isValidUsername,
  normalizeUsername,
  slugToEmail,
  usernameToEmail,
} from "./identity";

describe("normalizeUsername", () => {
  it("quita acentos y pasa a minúsculas con guiones", () => {
    expect(normalizeUsername("José Pérez")).toBe("jose-perez");
  });

  it("colapsa espacios y recorta extremos", () => {
    expect(normalizeUsername("  María  José  ")).toBe("maria-jose");
  });

  it("trata puntuación como separador", () => {
    expect(normalizeUsername("K-KORI S.A.C.")).toBe("k-kori-s-a-c");
  });

  it("maneja la ñ", () => {
    expect(normalizeUsername("Ñoño")).toBe("nono");
  });

  it("es idempotente (login y creación coinciden)", () => {
    const nombres = ["José Pérez", "  María  José  ", "K-KORI S.A.C.", "Ñoño"];
    for (const n of nombres) {
      const slug = normalizeUsername(n);
      expect(normalizeUsername(slug)).toBe(slug);
    }
  });
});

describe("slugToEmail / usernameToEmail", () => {
  it("genera el email sintético desde el slug", () => {
    expect(slugToEmail("jose-perez")).toBe(`jose-perez@${IDENTITY_EMAIL_DOMAIN}`);
  });

  it("nombre → email coincide con normalizar luego slugToEmail", () => {
    expect(usernameToEmail("José Pérez")).toBe(slugToEmail(normalizeUsername("José Pérez")));
  });
});

describe("isValidUsername", () => {
  it("acepta slugs válidos", () => {
    expect(isValidUsername("jose-perez")).toBe(true);
    expect(isValidUsername("ab")).toBe(true);
  });

  it("rechaza demasiado cortos o mal formados", () => {
    expect(isValidUsername("a")).toBe(false);
    expect(isValidUsername("-x-")).toBe(false);
    expect(isValidUsername("")).toBe(false);
  });
});
