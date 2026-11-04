import "server-only";

import { ApiResponse } from "@/commons/lib/http/responses";
import type { InvoiceInsertPayload } from "@/commons/models/payment";
import type { Subscription } from "@/commons/models/subscription";
import { getPreapprovalApi, getAuthorizedPaymentApi } from "@/server/payment/service/payment.api";
import type { PreApprovalResponse } from "mercadopago/dist/clients/preApproval/commonTypes";
import type { InvoiceResponse } from "mercadopago/dist/clients/invoice/commonTypes";
import { toIsoOrNull } from "@/commons/utils/helper";
import { getPlanBenefits } from "@/commons/constants/subscription";
import { formatBRL, formatDate } from "@/commons/utils/format";
import {
  sendRenewalSuccessEmailApi,
  sendRenewalFailedEmailApi,
  sendCancellationEmailApi,
  sendPlanChangeEmailApi,
} from "@/server/email";
import {
  webhookGetSubscriptionByIdSupabase,
  webhookGetSubscriptionByPayerEmailSupabase,
  webhookSyncSubscriptionSupabase,
  webhookGetSubscriptionByMpSubscriptionIdSupabase,
  webhookUpsertInvoiceSupabase,
} from "../repository/webhook.subscription.supabase";
import { internalSupabase } from "@/commons/lib/supabase/internal";
import { updateProfileAvatarSupabase } from "../repository/auth.supabase";

interface PlanFeaturesConfig {
  max_debtors?: number | null;
  can_debtor_portal?: boolean;
  can_access_financial?: boolean;
  custom_templates?: boolean;
  can_risk_score?: boolean;
  can_attach_receipts?: boolean;
}

type PreapprovalSyncResult =
  | ReturnType<typeof ApiResponse.Ok>
  | ReturnType<typeof ApiResponse.NotFound>
  | ReturnType<typeof ApiResponse.InternalError>;

const UPGRADE_EMAIL_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutos

const globalForWebhookSync = globalThis as unknown as {
  __caloteiroInFlightPreapprovalSyncs?: Map<string, Promise<PreapprovalSyncResult>>;
  __caloteiroInFlightAuthorizedPaymentSyncs?: Map<string, Promise<PreapprovalSyncResult>>;
  __caloteiroRecentlyNotifiedUpgrades?: Map<string, number>;
};

/**
 * Mapas globais em memória para deduplicar chamadas concorrentes ao mesmo preapprovalId / authorizedPaymentId
 * e evitar disparo redundante de "Assinatura Renovada" no ato da contratação inicial / upgrade.
 */
const inFlightPreapprovalSyncs =
  globalForWebhookSync.__caloteiroInFlightPreapprovalSyncs ??
  (globalForWebhookSync.__caloteiroInFlightPreapprovalSyncs = new Map<
    string,
    Promise<PreapprovalSyncResult>
  >());

const inFlightAuthorizedPaymentSyncs =
  globalForWebhookSync.__caloteiroInFlightAuthorizedPaymentSyncs ??
  (globalForWebhookSync.__caloteiroInFlightAuthorizedPaymentSyncs = new Map<
    string,
    Promise<PreapprovalSyncResult>
  >());

const recentlyNotifiedUpgrades =
  globalForWebhookSync.__caloteiroRecentlyNotifiedUpgrades ??
  (globalForWebhookSync.__caloteiroRecentlyNotifiedUpgrades = new Map<string, number>());

const webhookUpdateSubscriptionPreapprovalApi = async (preapproval: PreApprovalResponse) => {
  let subscription: Subscription | null = null;
  const subscriptionId = preapproval.external_reference;

  if (subscriptionId) {
    subscription = (await webhookGetSubscriptionByIdSupabase(subscriptionId)) as Subscription | null;
  }

  if (!subscription && preapproval.payer_email) {
    subscription = (await webhookGetSubscriptionByPayerEmailSupabase(preapproval.payer_email)) as Subscription | null;
  }

  if (!subscription && preapproval.id) {
    subscription = (await webhookGetSubscriptionByMpSubscriptionIdSupabase(preapproval.id)) as Subscription | null;
  }

  if (!subscription) {
    console.warn(`[WEBHOOK:updatePreapproval] Assinatura local não encontrada para preapproval: ${preapproval.id}`);
    return null;
  }

  const supabase = internalSupabase();

  // Buscar perfil e email do tubarão (com fallback para profiles.email)
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("id", subscription.user_id)
    .maybeSingle();

  const recipientName = profile?.name || "Tubarão";
  const resolvedEmail =
    (preapproval.payer_email && preapproval.payer_email.trim()) ||
    (subscription.mp_payer_email && subscription.mp_payer_email.trim()) ||
    profile?.email ||
    null;

  const previousStatus = subscription.mp_status;
  const previousPlanId = subscription.plan_id;
  const previousPlanName = subscription.plan?.name || "Tubarão Lixa";
  const nextStatus = preapproval.status;

  let targetPlanId = subscription.plan_id;
  let targetPlanName = subscription.plan?.name || "Tubarão Branco";
  let targetPlanPrice = Number(
    preapproval.auto_recurring?.transaction_amount || subscription.plan?.price || subscription.base_value || 0
  );
  let resolvedConfig: PlanFeaturesConfig | null =
    (subscription.plan?.config_plan as unknown as PlanFeaturesConfig) || null;

  const payload: Partial<Subscription> = {
    mp_subscription_id: preapproval.id,
    mp_payer_id: preapproval.payer_id ? Number(preapproval.payer_id) : subscription.mp_payer_id,
    mp_payer_email: resolvedEmail ?? undefined,
    mp_status: nextStatus,
    current_period_end: toIsoOrNull(preapproval.next_payment_date),
  };

  let matchedSlug: string | null = null;

  // Se o preapproval tiver reason (nome do plano passado no checkout), promove o plan_id local
  if (preapproval.reason) {
    const { data: matchedPlan } = await supabase
      .from("plans")
      .select("*, config_plan:config_plans(*)")
      .ilike("name", preapproval.reason)
      .maybeSingle();

    if (matchedPlan) {
      targetPlanId = matchedPlan.id;
      targetPlanName = matchedPlan.name;
      targetPlanPrice = Number(matchedPlan.price);
      matchedSlug = matchedPlan.slug;
      resolvedConfig = (matchedPlan.config_plan as unknown as PlanFeaturesConfig) || null;
      payload.plan_id = matchedPlan.id;
      payload.base_value = Number(matchedPlan.price);
      if (subscription.scheduled_plan_id === matchedPlan.id) {
        payload.scheduled_plan_id = null;
      }
    }
  }

  if (!resolvedConfig && targetPlanId) {
    const { data: currentPlan } = await supabase
      .from("plans")
      .select("*, config_plan:config_plans(*)")
      .eq("id", targetPlanId)
      .maybeSingle();
    if (currentPlan) {
      targetPlanName = currentPlan.name;
      targetPlanPrice = Number(currentPlan.price);
      matchedSlug = currentPlan.slug;
      resolvedConfig = (currentPlan.config_plan as unknown as PlanFeaturesConfig) || null;
    }
  }

  // Verificar idempotência: se status, plan_id e mp_subscription_id já estão idênticos no banco,
  // apenas atualiza current_period_end silenciosamente e evita reenvio de e-mail duplicado.
  const isStatusNewlyAuthorized = nextStatus === "authorized" && previousStatus !== "authorized";
  const isPlanChangedWhileAuthorized =
    nextStatus === "authorized" && Boolean(targetPlanId) && previousPlanId !== targetPlanId;
  const shouldSendUpgradeEmail = isStatusNewlyAuthorized || isPlanChangedWhileAuthorized;

  const updateResult = await webhookSyncSubscriptionSupabase(payload, subscription.id);

  if (shouldSendUpgradeEmail && matchedSlug && subscription.user_id) {
    await updateProfileAvatarSupabase(subscription.user_id, matchedSlug);
  }

  if (resolvedEmail) {
    // 1. Autorização inicial ou Upgrade de plano (ex: Tubarão Lixa -> Tubarão Branco) confirmado no Mercado Pago
    if (shouldSendUpgradeEmail) {
      const config = resolvedConfig;
      const benefits = getPlanBenefits(targetPlanName, config);

      if (preapproval.id) {
        recentlyNotifiedUpgrades.set(preapproval.id, Date.now());
      }

      await sendPlanChangeEmailApi(resolvedEmail, {
        recipientName,
        previousPlanName,
        newPlanName: targetPlanName,
        isUpgrade: true,
        newPrice: targetPlanPrice,
        maxDebtors: config?.max_debtors,
        benefits,
        chargedNow: true,
      });
    }
    // 2. Cancelamento
    else if (nextStatus === "cancelled" && previousStatus !== "cancelled") {
      await sendCancellationEmailApi(resolvedEmail, {
        recipientName,
        planName: targetPlanName,
        accessUntil: formatDate(subscription.current_period_end || preapproval.next_payment_date),
      });
    }
  } else {
    console.warn(`[WEBHOOK:updatePreapproval] Nenhum e-mail encontrado para user_id: ${subscription.user_id}`);
  }

  return updateResult;
};

const webhookSaveInvoiceFromAuthorizedPaymentApi = async (authorizedPayment: InvoiceResponse) => {
  try {
    const preapprovalId = authorizedPayment.preapproval_id;
    if (!preapprovalId) {
      return ApiResponse.BadRequest({
        message: "preapproval_id ausente no authorized_payment",
      });
    }

    const subscription = (await webhookGetSubscriptionByMpSubscriptionIdSupabase(preapprovalId)) as Subscription | null;
    if (!subscription) {
      return ApiResponse.NotFound({
        message: `Assinatura local não encontrada para preapproval_id: ${preapprovalId}`,
      });
    }

    const paymentStatus = authorizedPayment.payment?.status ?? authorizedPayment.status ?? "pending";
    const rawPayment = authorizedPayment as unknown as Record<string, unknown>;

    const payload: InvoiceInsertPayload = {
      user_id: subscription.user_id,
      subscription_id: subscription.id,
      mp_invoice_id: String(authorizedPayment.id),
      mp_subscription_id: preapprovalId,
      amount: authorizedPayment.transaction_amount ?? subscription.base_value ?? 0,
      currency: authorizedPayment.currency_id ?? "BRL",
      status: paymentStatus,
      paid_at: typeof rawPayment.date_approved === "string" ? toIsoOrNull(rawPayment.date_approved) : null,
      raw_payload: rawPayment as InvoiceInsertPayload["raw_payload"],
    };

    const upsertResult = await webhookUpsertInvoiceSupabase(payload);
    const { data, error, previousStatus } = upsertResult;
    if (error) {
      console.error("[WEBHOOK:saveInvoice] Erro ao salvar fatura:", error);
      return ApiResponse.InternalError({
        message: "Erro ao salvar fatura",
        error: error.message,
      });
    }

    // 1. Idempotência: se a fatura já estava salva com exatamente o mesmo status (ex: reenvio de webhook do MP), não reenvia e-mail
    const isInvoiceStatusUnchanged = Boolean(previousStatus) && previousStatus === paymentStatus;

    // 2. Evitar e-mail redundante de "Assinatura Renovada" no ato do Upgrade inicial (onde o e-mail "Evolução de Tubarão" acabou de ser enviado)
    const upgradeNotifiedAt = recentlyNotifiedUpgrades.get(preapprovalId);
    const wasUpgradeJustNotified =
      typeof upgradeNotifiedAt === "number" &&
      Date.now() - upgradeNotifiedAt < UPGRADE_EMAIL_COOLDOWN_MS;

    if (!isInvoiceStatusUnchanged) {
      const supabase = internalSupabase();
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("id", subscription.user_id)
        .maybeSingle();

      const targetEmail = (subscription.mp_payer_email && subscription.mp_payer_email.trim()) || profile?.email;
      if (targetEmail) {
        const recipientName = profile?.name || "Tubarão";
        const amountFormatted = formatBRL(Number(authorizedPayment.transaction_amount ?? subscription.base_value ?? 0));

        if (paymentStatus === "approved") {
          if (!wasUpgradeJustNotified) {
            await sendRenewalSuccessEmailApi(targetEmail, {
              recipientName,
              planName: subscription.plan?.name || "Central Caloteiro",
              amountFormatted,
              nextPaymentDate: formatDate(authorizedPayment.debit_date || authorizedPayment.date_created),
            });
          } else {
            console.info(
              `⏭️ [WEBHOOK:saveInvoice] E-mail de renovação suprimido para fatura inicial ${authorizedPayment.id} (e-mail de evolução de plano já disparado).`
            );
          }
        } else if (paymentStatus === "rejected") {
          await sendRenewalFailedEmailApi(targetEmail, {
            recipientName,
            planName: subscription.plan?.name || "Central Caloteiro",
            amountFormatted,
            reason: "Cartão não autorizado pela operadora",
          });
        }
      }
    } else {
      console.info(
        `⏭️ [WEBHOOK:saveInvoice] Fatura ${authorizedPayment.id} já processada com status "${paymentStatus}". Ignorando reenvio de e-mail.`
      );
    }

    return ApiResponse.Ok({
      message: "Fatura registrada com sucesso",
      data,
    });
  } catch (error) {
    return ApiResponse.InternalError({
      message: "Erro ao processar fatura",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const webhookSubscriptionPreapprovalApi = async (preapprovalId: string) => {
  // Se já existe uma sincronização em andamento para este mesmo preapprovalId, aguarda a mesma Promise
  const existingSync = inFlightPreapprovalSyncs.get(preapprovalId);
  if (existingSync) {
    console.info(`⏳ [WEBHOOK:preapproval] Reutilizando sincronização em andamento para: ${preapprovalId}`);
    return await existingSync;
  }

  const syncPromise = (async () => {
    try {
      const preapprovalResult = await getPreapprovalApi(preapprovalId);
      if (preapprovalResult.error || !preapprovalResult.data) {
        return ApiResponse.InternalError({
          message: preapprovalResult.message,
          error: preapprovalResult.error,
        });
      }

      const updated = await webhookUpdateSubscriptionPreapprovalApi(preapprovalResult.data);
      if (!updated) {
        return ApiResponse.NotFound({
          message: "Assinatura associada ao email do pagador não encontrada.",
        });
      }

      return ApiResponse.Ok({
        message: "Preapproval processado com sucesso",
        data: updated,
      });
    } catch (error) {
      return ApiResponse.InternalError({
        message: "Erro ao processar preapproval",
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      inFlightPreapprovalSyncs.delete(preapprovalId);
    }
  })();

  inFlightPreapprovalSyncs.set(preapprovalId, syncPromise);
  return await syncPromise;
};

export const webhookSubscriptionAuthorizedPaymentApi = async (authorizedPaymentId: string) => {
  const existingPaymentSync = inFlightAuthorizedPaymentSyncs.get(authorizedPaymentId);
  if (existingPaymentSync) {
    console.info(
      `⏳ [WEBHOOK:authorized_payment] Reutilizando processamento em andamento para: ${authorizedPaymentId}`
    );
    return await existingPaymentSync;
  }

  const paymentSyncPromise = (async () => {
    try {
      const authorizedPaymentResult = await getAuthorizedPaymentApi(authorizedPaymentId);
      if (authorizedPaymentResult.error || !authorizedPaymentResult.data) {
        return ApiResponse.InternalError({
          message: authorizedPaymentResult.message,
          error: authorizedPaymentResult.error,
        });
      }

      const authorizedPayment = authorizedPaymentResult.data;
      const preapprovalId = authorizedPayment.preapproval_id!;

      // 1. Garante primeiro que a assinatura e o plano estão sincronizados
      const preapprovalSyncResult = await webhookSubscriptionPreapprovalApi(preapprovalId);

      // 2. Registra a fatura no banco
      await webhookSaveInvoiceFromAuthorizedPaymentApi(authorizedPayment);

      return preapprovalSyncResult;
    } catch (error) {
      return ApiResponse.InternalError({
        message: "Erro ao processar authorized_payment",
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      inFlightAuthorizedPaymentSyncs.delete(authorizedPaymentId);
    }
  })();

  inFlightAuthorizedPaymentSyncs.set(authorizedPaymentId, paymentSyncPromise);
  return await paymentSyncPromise;
};
