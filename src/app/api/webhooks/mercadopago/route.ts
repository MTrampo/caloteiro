import { webhookSubscriptionPreapprovalApi, webhookSubscriptionAuthorizedPaymentApi } from '@/server/account/service/webhook.subscription.api';
import { HttpStatusEnum } from '@/commons/enums/http';
import { verifyMercadoPagoSignature } from '@/commons/lib/mercadopago/security';

export async function POST(request: Request) {
  console.info('📬 Webhook recebido:', {
    url: request.url,
    headers: Object.fromEntries(request.headers.entries())
  });

  const verification = verifyMercadoPagoSignature(request.headers, request.url);
  if (!verification.ok) {
    return Response.json({ received: false, error: verification.error }, { status: verification.status })
  }

  const body = await request.json();
  console.info('🎲 Dados recebidos do Mercado Pago:', {
    dataId: verification.dataId,
    requestId: verification.requestId,
    body,
  });

  const dataId = body?.data?.id
  if (!dataId) {
    return Response.json({ received: false, error: 'data.id não informado no webhook' }, { status: 400 })
  }

  console.info(`🔀 [WEBHOOK] Processando evento: ${body.type} | dataId: ${dataId}`)

  switch (body.type) {
    case 'subscription_preapproval': {
      console.info(`🔔 [WEBHOOK:preapproval] Iniciando processamento | preapprovalId: ${dataId}`)
      const result = await webhookSubscriptionPreapprovalApi(dataId)
      console.info(`🔔 [WEBHOOK:preapproval] Resultado:`, { status: result.status, message: result.message, error: result.error })

      if (result.error || result.status !== HttpStatusEnum.Ok) {
        console.error(`❌ [WEBHOOK:preapproval] Falha | status: ${result.status}`, { error: result.error, message: result.message })
        return Response.json(
          {
            received: false,
            error: result.error || result.message || 'Falha ao processar subscription_preapproval',
          },
          { status: result.status }
        )
      }

      console.info(`✅ [WEBHOOK:preapproval] Processado com sucesso`)
      return Response.json({ received: true }, { status: 200 })
    }
    case 'subscription_authorized_payment': {
      console.info(`🔔 [WEBHOOK:authorized_payment] Iniciando processamento | authorizedPaymentId: ${dataId}`)
      const result = await webhookSubscriptionAuthorizedPaymentApi(dataId)
      console.info(`🔔 [WEBHOOK:authorized_payment] Resultado:`, { status: result.status, message: result.message, error: result.error })

      if (result.error || result.status !== HttpStatusEnum.Ok) {
        console.error(`❌ [WEBHOOK:authorized_payment] Falha | status: ${result.status}`, { error: result.error, message: result.message })
        return Response.json(
          {
            received: false,
            error: result.error || result.message || 'Falha ao processar subscription_authorized_payment',
          },
          { status: result.status }
        )
      }

      console.info(`✅ [WEBHOOK:authorized_payment] Processado com sucesso`)
      return Response.json({ received: true }, { status: 200 })
    }
    case 'payment':
      console.info(`🔔 [WEBHOOK:payment] Evento payment recebido (não processado) | dataId: ${dataId}`)
      break;
    default:
      console.warn('⚠️ [WEBHOOK] Tipo de evento não mapeado:', body.type);
  }
  
  return Response.json({ received: true }, { status: 200 });
}