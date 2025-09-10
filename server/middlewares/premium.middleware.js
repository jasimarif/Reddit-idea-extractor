const paymentService = require('../services/payment.service');

/**
 * Middleware to check if user has premium access
 */
const requirePremium = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const isPremium = await paymentService.checkPremiumAccess(userId);
    
    if (!isPremium) {
      return res.status(403).json({
        success: false,
        message: 'Premium access required',
        code: 'PREMIUM_REQUIRED',
      });
    }
    
    next();
  } catch (error) {
    console.error('Premium check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify premium access',
      error: error.message,
    });
  }
};

module.exports = {
  requirePremium,
};
