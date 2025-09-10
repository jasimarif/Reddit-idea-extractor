# Stripe Integration Setup Guide

This guide will help you set up Stripe payments for your Next AI Idea application in test mode.

## Prerequisites

- Stripe account (free)
- Access to your deployed application
- Environment variable configuration access

## Step 1: Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete the account verification process

## Step 2: Get Your Stripe Keys

1. Log into your Stripe Dashboard
2. Navigate to **Developers** > **API keys**
3. Make sure you're in **Test mode** (toggle at the top)
4. Copy the following keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

## Step 3: Configure Environment Variables

### Backend (.env file):
```bash
# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Client and Server URLs
CLIENT_URL=https://nextaiidea.com
SERVER_URL=https://api.nextaiidea.com
```

### Frontend (.env file):
```bash
# Stripe Configuration (Test Mode)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# API Base URL
VITE_API_BASE_URL=https://api.nextaiidea.com
```

## Step 4: Set Up Webhooks

1. In Stripe Dashboard, go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://api.nextaiidea.com/api/payments/webhook`
4. Select the following events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`) and add it to your environment variables

## Step 5: Test Payment Flow

### Test Card Numbers (Stripe Test Mode):
- **Successful payment**: `4242 4242 4242 4242`
- **Declined payment**: `4000 0000 0000 0002`
- **Authentication required**: `4000 0025 0000 3155`

### Test Details:
- **Expiry**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

## Step 6: Deploy and Test

1. Deploy your backend with the new environment variables
2. Deploy your frontend with the Stripe publishable key
3. Test the payment flow:
   - Try to create a landing page (should show premium modal)
   - Click "Upgrade to Premium"
   - Complete payment with test card
   - Verify premium access is granted

## Features Implemented

### Frontend:
- ✅ Payment context for managing premium state
- ✅ Premium gate component to lock features
- ✅ Premium upgrade modal
- ✅ Payment success/cancel pages
- ✅ Premium badge in navbar
- ✅ Locked "Create Landing Page" buttons

### Backend:
- ✅ Stripe payment session creation
- ✅ Webhook handling for payment completion
- ✅ Premium middleware for protected routes
- ✅ User model updated with payment fields
- ✅ Payment service with all necessary methods

## Pricing Structure

**Current Setup**: One-time payment of $29.99 for premium access

**Features Unlocked**:
- Unlimited landing page creation
- Professional templates
- One-click deployment to Vercel
- Custom domain support
- Priority support
- Advanced analytics

## Troubleshooting

### Common Issues:

1. **Webhook not receiving events**:
   - Check webhook URL is correct
   - Verify webhook secret is properly set
   - Check server logs for webhook errors

2. **Payment not completing**:
   - Verify all Stripe keys are correct
   - Check environment variables are loaded
   - Ensure webhook endpoint is accessible

3. **Premium status not updating**:
   - Check webhook is working
   - Verify database connection
   - Check server logs for errors

### Support:
- Stripe Documentation: [https://stripe.com/docs](https://stripe.com/docs)
- Test your webhooks: [https://stripe.com/docs/webhooks/test](https://stripe.com/docs/webhooks/test)

## Going to Production

1. Switch to Stripe live mode in dashboard
2. Get live API keys (starts with `pk_live_` and `sk_live_`)
3. Update environment variables with live keys
4. Update webhook endpoint to production URL
5. Test with real payment methods

## Security Notes

- ✅ Never expose secret keys on frontend
- ✅ Always verify payments server-side
- ✅ Use webhooks for reliable payment confirmation
- ✅ Validate webhook signatures
- ✅ Store minimal payment data

Your Stripe integration is now ready to use in test mode! 🎉
