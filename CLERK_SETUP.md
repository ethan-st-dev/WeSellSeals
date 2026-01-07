# Clerk Authentication Setup Guide

## Overview
WeSellSeals now uses [Clerk](https://clerk.com) for authentication, providing a modern auth experience with:
- Social logins (Google, GitHub, etc.)
- Magic link authentication
- Multi-factor authentication
- Secure session management
- Pre-built UI components

## 1. Create a Clerk Account

1. Go to https://clerk.com and sign up for a free account
2. Create a new application in the Clerk dashboard
3. Choose your preferred authentication methods (email/password, social logins, etc.)

## 2. Get Your API Keys

From your Clerk dashboard:

### Frontend Key (Publishable)
- Navigate to **API Keys** in your Clerk dashboard
- Copy the **Publishable Key** (starts with `pk_test_` or `pk_live_`)

### Backend Key (Secret)
- In the same **API Keys** section
- Copy the **Secret Key** (starts with `sk_test_` or `sk_live_`)
- ⚠️ **Never commit this key to git!**

## 3. Configure Local Development

### Frontend (.env in Client/)
Create a `.env` file in the `Client/` directory:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_API_URL=http://localhost:5159
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_key
```

### Backend (appsettings.Development.json in Server/)
Update `Server/appsettings.Development.json`:

```json
{
  "Clerk": {
    "Authority": "https://your-clerk-domain.clerk.accounts.dev",
    "Audience": "your-clerk-audience"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=wesellseals.db"
  },
  "Stripe": {
    "SecretKey": "sk_test_your_stripe_key",
    "PublishableKey": "pk_test_your_stripe_key"
  }
}
```

To find your Clerk Authority:
1. Go to Clerk Dashboard → **JWT Templates**
2. Click on your application
3. The **Issuer** URL is your Authority

## 4. Configure Production (Azure)

### Add GitHub Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these new secrets:

```
CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
CLERK_SECRET_KEY=sk_live_your_production_secret
CLERK_AUTHORITY=https://your-prod-domain.clerk.accounts.dev
```

Keep existing secrets:
- `AZURE_SQL_CONNECTION_STRING`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLIC_KEY`
- `AZURE_API_URL`
- `AZURE_STATIC_WEB_APPS_API_TOKEN`
- `AZURE_CREDENTIALS`
- `ACR_PASSWORD`

### Update CI/CD Pipeline
The `.github/workflows/ci.yml` file needs to be updated to include Clerk environment variables (this will be done in the next commit).

## 5. Clerk Dashboard Configuration

### Allowed Origins (CORS)
In your Clerk dashboard:
1. Go to **Settings** → **Domains**
2. Add your allowed origins:
   - `http://localhost:5173` (development)
   - `https://brave-beach-02c856b1e.4.azurestaticapps.net` (production)

### Redirect URLs
Configure where users go after auth:
1. Go to **User & Authentication** → **Paths**
2. Set **Sign-in redirect URL**: `/`
3. Set **Sign-out redirect URL**: `/`

### JWT Template
1. Go to **JWT Templates** → Create a new template (or use default)
2. Add custom claims if needed (e.g., user metadata)
3. Note the **Issuer** URL - this is your `CLERK_AUTHORITY`

## 6. Running Locally

### Start Frontend
```bash
cd Client
npm install  # Already done
npm run dev
```

### Start Backend
```bash
cd Server
dotnet run
```

Visit http://localhost:5173 and test:
- Sign up with email/password
- Sign in with social providers (if configured)
- View your profile with the UserButton
- Sign out

## 7. Testing Authentication Flow

1. **Sign Up**: Go to `/signup` - you'll see Clerk's hosted sign-up form
2. **Sign In**: Go to `/login` - Clerk's hosted sign-in form
3. **User Profile**: Click the avatar in the header to see account options
4. **My Seals**: Visit `/user` to see your purchased seals (requires auth)

## 8. How It Works

### Frontend Flow
1. `ClerkProvider` wraps the entire app in `root.tsx`
2. Login/Signup routes use Clerk's `<SignIn>` and `<SignUp>` components
3. `AuthContext` uses Clerk's `useUser()` hook to get current user
4. Header shows `<UserButton>` when signed in
5. Protected routes check `user` from `useAuth()`

### Backend Flow
1. JWT Bearer authentication middleware validates Clerk tokens
2. Each API request includes `Authorization: Bearer <token>` header
3. Backend validates token signature against Clerk's public keys
4. User ID from token is used to link purchases to users

### Database Changes
- `ApplicationUser` model updated to use Clerk User IDs
- No more password storage (handled by Clerk)
- Email and name synced from Clerk on first use

## 9. Migration from ASP.NET Identity

Existing users with ASP.NET Identity accounts will need to:
1. Create new accounts with Clerk
2. Previous purchase data is preserved in the database
3. Consider adding a migration script to map old user IDs to Clerk IDs (if needed)

## 10. Cost

Clerk Free Tier includes:
- Up to 10,000 monthly active users
- All authentication methods
- Pre-built UI components
- Email support

Perfect for development and early production! Upgrade when you exceed limits.

## 11. Troubleshooting

### "Invalid token" errors
- Check that `CLERK_AUTHORITY` matches your JWT Template Issuer
- Ensure Frontend sends token in Authorization header
- Verify token hasn't expired (Clerk tokens expire after 1 hour by default)

### CORS errors
- Add your frontend URL to Clerk dashboard Allowed Origins
- Check backend CORS configuration includes your frontend URL

### User not showing up after login
- Check browser console for errors
- Verify `useUser()` hook is being called
- Ensure `ClerkProvider` wraps your app

## Next Steps

After adding Clerk keys:
1. Update backend `Program.cs` to configure JWT authentication
2. Update all auth-required endpoints to validate Clerk tokens
3. Test the full authentication flow
4. Deploy to Azure with new secrets

---

**Need Help?** Check Clerk's documentation: https://clerk.com/docs
