import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  CACHE_TAGS,
  invalidateUserDataCache,
} from "@/commons/lib/cache/server-cache";
import * as nextCache from "next/cache";

vi.mock("next/cache", () => ({
  updateTag: vi.fn(),
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));

describe("Server Cache & On-Demand Revalidation (server-cache.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve gerar tags determinísticas isoladas por identificador", () => {
    expect(CACHE_TAGS.userData("user-1")).toBe("user-data:user-1");
    expect(CACHE_TAGS.userSettings("user-1")).toBe("user-settings:user-1");
    expect(CACHE_TAGS.debtDetails("debt-9")).toBe("debt-details:debt-9");
    expect(CACHE_TAGS.debtReceipts("debt-9")).toBe("debt-receipts:debt-9");
    expect(CACHE_TAGS.debtorDetails("debtor-5")).toBe(
      "debtor-details:debtor-5"
    );
  });

  it("deve invalidar user-data, user-settings e tags granulares via updateTag (read-your-own-writes)", () => {
    invalidateUserDataCache({
      userId: "user-abc",
      debtId: "debt-123",
      debtorId: "debtor-456",
    });

    expect(nextCache.updateTag).toHaveBeenCalledWith("user-data:user-abc");
    expect(nextCache.updateTag).toHaveBeenCalledWith("user-settings:user-abc");
    expect(nextCache.updateTag).toHaveBeenCalledWith("debt-details:debt-123");
    expect(nextCache.updateTag).toHaveBeenCalledWith("debt-receipts:debt-123");
    expect(nextCache.updateTag).toHaveBeenCalledWith(
      "debtor-details:debtor-456"
    );
    expect(nextCache.revalidatePath).toHaveBeenCalledWith("/painel", "layout");
    expect(nextCache.revalidatePath).toHaveBeenCalledWith(
      "/painel/dividas/debt-123",
      "page"
    );
    expect(nextCache.revalidatePath).toHaveBeenCalledWith(
      "/fatura/debt-123",
      "page"
    );
    expect(nextCache.revalidatePath).toHaveBeenCalledWith(
      "/painel/devedores/debtor-456",
      "page"
    );
  });

  it("deve fazer fallback para revalidateTag com expire: 0 caso updateTag lance erro fora de Server Action", () => {
    vi.mocked(nextCache.updateTag).mockImplementationOnce(() => {
      throw new Error("updateTag can only be called inside a Server Action");
    });

    invalidateUserDataCache({
      userId: "user-xyz",
      debtId: "debt-789",
      debtorId: "debtor-321",
    });

    expect(nextCache.revalidateTag).toHaveBeenCalledWith("user-data:user-xyz", {
      expire: 0,
    });
    expect(nextCache.revalidateTag).toHaveBeenCalledWith(
      "user-settings:user-xyz",
      { expire: 0 }
    );
    expect(nextCache.revalidateTag).toHaveBeenCalledWith(
      "debt-details:debt-789",
      { expire: 0 }
    );
    expect(nextCache.revalidateTag).toHaveBeenCalledWith(
      "debt-receipts:debt-789",
      { expire: 0 }
    );
    expect(nextCache.revalidateTag).toHaveBeenCalledWith(
      "debtor-details:debtor-321",
      { expire: 0 }
    );
  });
});

