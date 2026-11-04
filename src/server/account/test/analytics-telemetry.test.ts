import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  trackEvent,
  trackSimulator,
  trackPlanIntent,
  trackAccountIntent,
  trackLoginIntent,
  trackLegalReading,
  trackFeatureView,
} from "@/commons/utils/analytics";

describe("Serviço de Telemetria e Analytics (analytics.ts)", () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // Simula ambiente de navegador com gtag
    (globalThis as Record<string, unknown>).window = {
      gtag: vi.fn(),
    };
  });

  afterEach(() => {
    global.window = originalWindow;
    vi.restoreAllMocks();
  });

  it("deve disparar trackEvent chamando window.gtag com os parâmetros corretos", () => {
    trackEvent("intent_create_account", { cta_location: "hero" });

    expect(window.gtag).toHaveBeenCalledTimes(1);
    expect(window.gtag).toHaveBeenCalledWith(
      "event",
      "intent_create_account",
      { cta_location: "hero" }
    );
  });

  it("não deve lançar exceção se window.gtag não estiver definido", () => {
    (globalThis as Record<string, unknown>).window = {};

    expect(() => {
      trackEvent("intent_login", { cta_location: "header" });
    }).not.toThrow();
  });

  it("não deve lançar exceção em ambiente SSR (sem window)", () => {
    delete (globalThis as Record<string, unknown>).window;

    expect(() => {
      trackEvent("intent_login", { cta_location: "header" });
    }).not.toThrow();
  });

  it("deve disparar trackSimulator com chave do simulador, ação e valor convertidos", () => {
    trackSimulator("caderninho", "switch_view", "caloteiro");

    expect(window.gtag).toHaveBeenCalledWith("event", "interact_simulation", {
      simulator_name: "caderninho",
      simulator_action: "switch_view",
      simulator_value: "caloteiro",
    });
  });

  it("deve disparar trackPlanIntent com dados do plano e localização", () => {
    trackPlanIntent("tubarao-cabeca-chato", "Tubarão Cabeça Chato", "landing_plans_stepper");

    expect(window.gtag).toHaveBeenCalledWith("event", "select_plan_intent", {
      plan_id: "tubarao-cabeca-chato",
      plan_name: "Tubarão Cabeça Chato",
      cta_location: "landing_plans_stepper",
    });
  });

  it("deve disparar trackAccountIntent e trackLoginIntent corretamente", () => {
    trackAccountIntent("header_mobile", "Criar Gruta");
    trackLoginIntent("header_desktop");

    expect(window.gtag).toHaveBeenCalledWith("event", "intent_create_account", {
      cta_location: "header_mobile",
      cta_text: "Criar Gruta",
    });

    expect(window.gtag).toHaveBeenCalledWith("event", "intent_login", {
      cta_location: "header_desktop",
    });
  });

  it("deve disparar trackLegalReading com profundidade de leitura e tempo de permanência", () => {
    trackLegalReading("termos", 90, 45);

    expect(window.gtag).toHaveBeenCalledWith("event", "read_legal_document_depth", {
      document_name: "termos",
      scroll_depth_percent: 90,
      time_spent_seconds: 45,
    });
  });

  it("deve disparar trackFeatureView mapeando uso de funcionalidade interna", () => {
    trackFeatureView("painel_termometro_risco", "/painel/termometro");

    expect(window.gtag).toHaveBeenCalledWith("event", "app_feature_view", {
      feature_key: "painel_termometro_risco",
      page_path: "/painel/termometro",
    });
  });
});

