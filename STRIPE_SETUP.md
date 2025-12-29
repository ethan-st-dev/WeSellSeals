# Stripe Payment Integration Setup

## 🎯 Overview
Stripe has been integrated for secure payment processing. Users can now purchase seals with credit/debit cards.

## 📋 Setup Instructions

### 1. Create Stripe Account
1. Go to https://stripe.com and sign up
2. Navigate to Dashboard → Developers → API Keys
3. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### 2. Configure Backend (Server)

Edit `/Server/appsettings.json`:
```json
{
  "Stripe": {
    "SecretKey": "sk_test_YOUR_SECRET_KEY_HERE",
    "PublishableKey": "pk_test_YOUR_PUBLISHABLE_KEY_HERE",
    "WebhookSecret": "whsec_YOUR_WEBHOOK_SECRET" // Get this from step 3
  }
}
```

### 3. Configure Frontend (Client)

Create `/Client/.env` file:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

### 4. Setup Webhook (for production)

For local testing, Stripe CLI handles webhooks automatically:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5159/api/payments/webhook
```

This will give you a webhook secret (starts with `whsec_`) - add it to `appsettings.json`.

## 🧪 Testing

### Test Cards
Use these card numbers in test mode:

- **Success**: `4242 4242 4242 4242`
- **Requires authentication**: `4000 0025 0000 3155`
- **Declined**: `4000 0000 0000 9995`

Any future expiration date, any 3-digit CVC, any ZIP code.

## 🔄 Payment Flow

1. User adds seals to cart
2. Clicks "Proceed to Checkout"
3. Payment form loads (powered by Stripe Elements)
4. User enters card details
5. Payment is processed securely by Stripe
6. On success:
   - Webhook confirms payment
   - Purchase records created in database
   - Cart cleared
   - User redirected to their library

## 🔒 Security

- Card details never touch your server
- PCI compliance handled by Stripe
- Payments use SCA (Strong Customer Authentication)
- All communication over HTTPS

## 📁 Files Added/Modified

### Backend
- `Program.cs` - Payment intent & webhook endpoints
- `appsettings.json` - Stripe configuration

### Frontend
- `routes/checkout.tsx` - Checkout page with Stripe integration
- `components/CheckoutForm.tsx` - Payment form component
- `routes/cart.tsx` - Updated to navigate to checkout
- `.env.example` - Environment variable template

## 🚀 Next Steps

1. Add your real Stripe keys
2. Test the payment flow with test cards
3. For production:
   - Switch to live keys (`pk_live_` and `sk_live_`)
   - Configure production webhook in Stripe Dashboard
   - Enable HTTPS

## 💡 Features

- Secure card payment processing
- Real-time payment validation
- Support for multiple payment methods (credit/debit cards)
- Automatic receipt emails (configured in Stripe Dashboard)
- Refund support (via Stripe Dashboard)
