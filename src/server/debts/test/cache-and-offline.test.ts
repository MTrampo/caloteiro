import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSecondsUntilMidnightSaoPaulo, getCalendarDateInSaoPaulo } from "@/commons/utils/date";
import { CACHE_TAGS, invalidateUserDataCache } from "@/commons/lib/cache/server-cache";
import * as nextCache from "next/cache";

describe("Controle de Cache Inteligente e Virada de Meia-Noite (Next.js 16)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Cálculo do TTL até a Meia-Noite (getSecondsUntilMidnightSaoPaulo)", () => {
    it("deve calcular corretamente a quantidade de segundos restantes para 23:59:59 no fuso de São Paulo", () => {
      // Cria uma data fixa em UTC correspondente a 12:00:00 em São Paulo (UTC-3 -> 15:00:00Z)
      const noonSaoPaulo = new Date("2026-11-01T15:00:00.000Z");
      const seconds = getSecondsUntilMidnightSaoPaulo(noonSaoPaulo);

      // De 12:00:00 até 24:00:00 restam 12 horas = 43200 segundos
      expect(seconds).toBe(43200);
    });

    it("deve garantir uma margem mínima segura de 60 segundos nos últimos instantes do dia", () => {
      // 23:59:45 em São Paulo (UTC-3 -> 02:59:45Z do dia seguinte)
      const lateNightSaoPaulo = new Date("2026-11-02T02:59:45.000Z");
      const seconds = getSecondsUntilMidnightSaoPaulo(lateNightSaoPaulo);

      expect(seconds).toBeGreaterThanOrEqual(60);
    });

    it("deve retornar 86400 segundos no exato início do dia (00:00:00 em São Paulo)", () => {
      // 00:00:00 em São Paulo (UTC-3 -> 03:00:00Z)
      const midnightSaoPaulo = new Date("2026-11-01T03:00:00.000Z");
      const seconds = getSecondsUntilMidnightSaoPaulo(midnightSaoPaulo);

      expect(seconds).toBe(86400);
    });
  });

  describe("Data Civil de São Paulo para Rollover Automático de Chaves", () => {
    it("deve extrair a data correta no fuso de São Paulo sem recuo indevido de dia", () => {
      // 23:30 em Brasília (UTC-3) do dia 01/11/2026 (02:30Z de 02/11/2026)
      const lateEvening = new Date("2026-11-02T02:30:00.000Z");
      const dateStr = getCalendarDateInSaoPaulo(lateEvening);

      expect(dateStr).toBe("2026-11-01");
    });

    it("deve virar o dia exatamente às 00:00:00 de Brasília", () => {
      // 00:00:01 em Brasília (UTC-3) do dia 02/11/2026 (03:00:01Z de 02/11/2026)
      const newDay = new Date("2026-11-02T03:00:01.000Z");
      const dateStr = getCalendarDateInSaoPaulo(newDay);

      expect(dateStr).toBe("2026-11-02");
    });
  });

  describe("Gerador de Tags e Invalidação Instantânea (invalidateUserDataCache)", () => {
    it("deve estruturar as tags mestre e granulares por usuário e dívida", () => {
      const userId = "tubarao-cache-test";
      const debtId = "debt-xyz";
      const debtorId = "debtor-abc";

      expect(CACHE_TAGS.userData(userId)).toBe(`user-data:${userId}`);
      expect(CACHE_TAGS.userSettings(userId)).toBe(`user-settings:${userId}`);
      expect(CACHE_TAGS.debtDetails(debtId)).toBe(`debt-details:${debtId}`);
      expect(CACHE_TAGS.debtReceipts(debtId)).toBe(`debt-receipts:${debtId}`);
      expect(CACHE_TAGS.debtorDetails(debtorId)).toBe(`debtor-details:${debtorId}`);
    });

    it("deve disparar updateTag e revalidatePath para read-your-own-writes em mutações", () => {
      const updateTagSpy = vi.spyOn(nextCache, "updateTag");
      const revalidatePathSpy = vi.spyOn(nextCache, "revalidatePath");

      const userId = "tubarao-mutation-test";
      const debtId = "debt-123";

      invalidateUserDataCache({ userId, debtId });

      expect(updateTagSpy).toHaveBeenCalledWith(`user-data:${userId}`);
      expect(updateTagSpy).toHaveBeenCalledWith(`debt-details:${debtId}`);
      expect(updateTagSpy).toHaveBeenCalledWith(`debt-receipts:${debtId}`);
      expect(revalidatePathSpy).toHaveBeenCalledWith("/painel", "layout");
      expect(revalidatePathSpy).toHaveBeenCalledWith(`/painel/dividas/${debtId}`, "page");
    });
  });
});

