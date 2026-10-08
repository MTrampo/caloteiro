import { MercadoPagoConfig, PreApproval, PreApprovalPlan, Invoice } from 'mercadopago';

export const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN! 
});

export const clientPreAproval = new PreApproval(client);
export const clientPreApprovalPlan = new PreApprovalPlan(client);
export const clientInvoice = new Invoice(client);

export const secret = process.env.MP_WEBHOOK_SECRET;