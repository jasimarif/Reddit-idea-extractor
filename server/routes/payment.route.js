const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  createPaymentSession,
  handlePaymentSuccess,
  checkPremiumStatus,
  createBillingPortalSession,
  handleWebhook,
} = require('../controllers/payment.controller');

// Protected routes (require authentication)
router.post('/create-session', protect, createPaymentSession);
router.get('/success', protect, handlePaymentSuccess);
router.get('/premium-status', protect, checkPremiumStatus);
router.post('/billing-portal', protect, createBillingPortalSession);

// Webhook route (no auth required, Stripe handles verification)
// Note: Raw body parser is applied in app.js specifically for this route
router.post('/webhook', handleWebhook);

module.exports = router;
