# PayVantage Shopify Integration

## Overview

This guide describes the architecture for integrating PayVantage as a custom payment method in Shopify stores using a Node.js Custom App and the PayVantage API.

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Shopify    │────▶│  PayVantage App  │────▶│  PayVantage API │
│   Checkout   │     │   (Node.js)      │     │  /api/checkout   │
└─────────────┘     └──────────────────┘     └─────────────────┘
       │                     │                        │
       │              ┌──────┴──────┐          ┌──────┴──────┐
       │              │  Redirect   │          │  PayRam     │
       │              │  Customer   │          │  Checkout   │
       │              └─────────────┘          └─────────────┘
       │                                             │
       │              ┌──────────────┐               │
       └──────────────│  Webhook     │◀──────────────┘
                      │  /webhooks   │
                      └──────────────┘
```

## Prerequisites

- A Shopify Partner account or development store
- Node.js 18+
- A PayVantage merchant account with API keys

## Setup Steps

### 1. Create a Shopify Custom App

1. Go to your Shopify admin → Settings → Apps and sales channels
2. Click "Develop apps" → "Create an app"
3. Name it "PayVantage Payments"
4. Under API scopes, request:
   - `write_payment_gateways`
   - `write_orders`
   - `read_orders`

### 2. Scaffold the Node.js App

```bash
npx create-next-app@latest payvantage-shopify --typescript
cd payvantage-shopify
npm install @shopify/shopify-api @shopify/shopify-app-remix
```

### 3. Environment Variables

Create a `.env` file:

```env
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SHOPIFY_SCOPES=write_payment_gateways,write_orders,read_orders
PAYVANTAGE_API_URL=https://yourdomain.com
PAYVANTAGE_PUBLISHABLE_KEY=pv_pub_...
PAYVANTAGE_SECRET_KEY=pv_sec_...
```

### 4. Payment Flow

1. **Customer reaches checkout** → Shopify triggers the payment gateway extension
2. **App creates checkout session** → POST to `PAYVANTAGE_API_URL/api/checkout` with:
   ```json
   {
     "amount": 99.99,
     "currency": "USD",
     "merchant_api_key": "pk_live_..."
   }
   ```
3. **Customer is redirected** to the PayRam checkout URL returned in the response
4. **Customer completes payment** → card is charged, funds converted to stablecoins
5. **PayRam sends webhook** to `PAYVANTAGE_API_URL/api/webhooks/payram`
6. **PayVantage sends webhook** to your Shopify app endpoint
7. **App marks order as paid** via the Shopify Admin API

### 5. Webhook Handler

Your app needs an endpoint to receive payment confirmations:

```typescript
// app/api/payment-callback/route.ts
export async function POST(request: Request) {
  const body = await request.json();

  if (body.status === "completed") {
    // Use Shopify Admin API to mark the order as paid
    // shopify.rest.Order.update({ id: orderId, financial_status: "paid" })
  }

  return Response.json({ received: true });
}
```

### 6. Deploy

Deploy to Vercel, Railway, or any Node.js hosting platform. Update your Shopify app configuration with the production URL.

## Testing

1. Use your Shopify development store
2. Install the custom app
3. Place a test order using the PayVantage payment method
4. Verify the payment appears in your PayVantage dashboard

## Support

- **API Docs**: https://payvantage.io/docs
- **Email**: support@payvantage.io
