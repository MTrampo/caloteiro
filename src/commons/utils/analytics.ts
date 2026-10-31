import { GA_ID, IS_DEV } from "@/commons/constants/env";

declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "js" | "set",
      targetIdOrEventName: string,
      params?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

export type AnalyticsEventName =
  | "intent_create_account"
  | "intent_login"
  | "select_plan_intent"
  | "interact_simulation"
  | "calculate_roi"
  | "view_legal_document"
  | "read_legal_document_depth"
  | "app_feature_view"
  | "complete_registration"
  | "subscription_success";

export type SimulatorKey =
  | "caderninho"
  | "whatsapp_weapon"
  | "grotto_demo"
  | "roi_calculator";

/**
 * Dispara um evento personalizado para o Google Analytics 4 com tratamento de erro e proteção SSR.
 */
export function trackEvent(
  eventName: AnalyticsEventName | string,
  params?: Record<string, unknown>
): void {
  try {
    if (typeof window === "undefined") {
      return;
    }

    if (IS_DEV) {
      // Log amigável em ambiente de desenvolvimento para inspeção sem ruído
      console.debug(`[Analytics:Event] ${eventName}`, params ?? {});
    }

    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
    }
  } catch (error) {
    if (IS_DEV) {
      console.warn("[Analytics] Falha silenciosa ao registrar evento:", error);
    }
  }
}

/**
 * Rastreia engajamento com os simuladores interativos da landing page.
 */
export function trackSimulator(
  simulator: SimulatorKey,
  action: string,
  value?: string | number | boolean
): void {
  trackEvent("interact_simulation", {
    simulator_name: simulator,
    simulator_action: action,
    simulator_value: value !== undefined ? String(value) : undefined,
  });
}

/**
 * Rastreia a intenção explícita do usuário de assinar ou fazer upgrade de plano.
 */
export function trackPlanIntent(
  planId: string,
  planName: string,
  location: string
): void {
  trackEvent("select_plan_intent", {
    plan_id: planId,
    plan_name: planName,
    cta_location: location,
  });
}

/**
 * Rastreia cliques de intenção de criação de conta/abertura de gruta.
 */
export function trackAccountIntent(location: string, ctaText?: string): void {
  trackEvent("intent_create_account", {
    cta_location: location,
    cta_text: ctaText,
  });
}

/**
 * Rastreia cliques de intenção de login.
 */
export function trackLoginIntent(location: string): void {
  trackEvent("intent_login", {
    cta_location: location,
  });
}

/**
 * Rastreia a profundidade de leitura e tempo de permanência em documentos legais (termos, privacidade, planos).
 */
export function trackLegalReading(
  docName: string,
  scrollPercent: number,
  timeSpentSec: number
): void {
  trackEvent("read_legal_document_depth", {
    document_name: docName,
    scroll_depth_percent: scrollPercent,
    time_spent_seconds: timeSpentSec,
  });
}

/**
 * Rastreia o acesso a uma funcionalidade interna do painel para mapear valor real e retenção.
 */
export function trackFeatureView(featureKey: string, path: string): void {
  trackEvent("app_feature_view", {
    feature_key: featureKey,
    page_path: path,
  });
}

