const paymentService = require('../services/payment.service');
const stripe = require('../config/stripe');

/**
 * Create a payment session for premium upgrade
 */
async function createPaymentSession(req, res) {
  try {
    const userId = req.user._id;
    const { successUrl, cancelUrl } = req.body;

    // Default URLs if not provided
    const defaultSuccessUrl = successUrl || `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const defaultCancelUrl = cancelUrl || `${process.env.CLIENT_URL}/payment/cancel`;

    const session = await paymentService.createPaymentSession(
      userId,
      defaultSuccessUrl,
      defaultCancelUrl
    );

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Payment session creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment session',
      error: error.message,
    });
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(req, res) {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
    }

    const result = await paymentService.handleSuccessfulPayment(session_id);
    
    res.json(result);
  } catch (error) {
    console.error('Payment success handling error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to handle payment success',
      error: error.message,
    });
  }
}

/**
 * Check user's premium status
 */
async function checkPremiumStatus(req, res) {
  try {
    const userId = req.user._id;
    const isPremium = await paymentService.checkPremiumAccess(userId);
    
    res.json({
      success: true,
      isPremium,
    });
  } catch (error) {
    console.error('Premium status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check premium status',
      error: error.message,
    });
  }
}

/**
 * Create billing portal session
 */
async function createBillingPortalSession(req, res) {
  try {
    const userId = req.user._id;
    const returnUrl = req.body.returnUrl || `${process.env.CLIENT_URL}/dashboard`;

    const session = await paymentService.createBillingPortalSession(userId, returnUrl);
    
    res.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error('Billing portal creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create billing portal session',
      error: error.message,
    });
  }
}

/**
 * Handle Stripe webhooks
 */
async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const result = await paymentService.handleWebhook(event);
    res.json(result);
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to handle webhook',
      error: error.message,
    });
  }
}

module.exports = {
  createPaymentSession,
  handlePaymentSuccess,
  checkPremiumStatus,
  createBillingPortalSession,
  handleWebhook,
};
