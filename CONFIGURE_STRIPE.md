# 🔧 Stripe Configuration Required

Your application is currently using placeholder Stripe API keys, which is causing payment errors.

## Quick Setup (5 minutes)

### Step 1: Get Your Stripe Keys

1. Go to https://dashboard.stripe.com/register (or login if you have an account)
2. Navigate to **Developers → API Keys**
3. Copy these two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - Click "Reveal test key"

### Step 2: Configure Backend

Edit `/Server/appsettings.json` and replace the placeholder keys:

```json
{
  "Stripe": {
    "SecretKey": "sk_test_YOUR_ACTUAL_SECRET_KEY_HERE",
    "PublishableKey": "pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE",
    "WebhookSecret": "whsec_YOUR_WEBHOOK_SECRET_HERE"
  }
}
```

### Step 3: Configure Frontend

Create or edit `/Client/.env`:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE
```

### Step 4: Restart Your Servers

**Backend:**
```bash
cd Server
# Stop the current server (Ctrl+C)
dotnet run
```

**Frontend:**
```bash
cd Client
# Stop the current server (Ctrl+C)
npm run dev
```

## Test the Integration

Use Stripe's test card numbers:
- **Success**: `4242 4242 4242 4242`
- Any future expiration date
- Any 3-digit CVC
- Any ZIP code

## Errors You're Seeing

1. **Hydration Error** - ✅ Fixed (cart badge rendering)
2. **500 Internal Server Error** - ⚠️ Requires Stripe API keys
3. **"The string did not match the expected pattern"** - ⚠️ Caused by invalid API response

Once you add real Stripe keys, these errors will disappear!

## Need Help?

See [STRIPE_SETUP.md](./STRIPE_SETUP.md) for more detailed instructions including webhook setup.
