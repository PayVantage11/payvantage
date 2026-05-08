export type RailName = "payram" | "inqud" | "alchemypay" | "nexapay";

export interface CreatePaymentParams {
  amount: number;
  currency: string;
  merchantId: string;
  walletAddress: string;
  chain: string;
  customerEmail: string;
  customerId: string;
  orderId: string;
  callbackUrl: string;
  returnUrl?: string | undefined;
}

export interface CreatePaymentResult {
  paymentUrl: string;
  providerOrderId: string;
  providerReference?: string;
  rawResponse: unknown;
}

export interface RailProvider {
  name: RailName;
  createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult>;
  getPaymentStatus?(providerOrderId: string): Promise<string>;
  verifyWebhook?(request: Request): Promise<boolean>;
}
