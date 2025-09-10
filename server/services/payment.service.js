const stripe = require('../config/stripe');
const User = require('../models/User');

class PaymentService {
  /**
   * Create a Stripe customer for a user
   */
  async createCustomer(user) {
    try {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString(),
        },
      });

      // Update user with Stripe customer ID
      await User.findByIdAndUpdate(user._id, {
        stripeCustomerId: customer.id,
      });

      return customer;
    } catch (error) {
      throw new Error(`Failed to create Stripe customer: ${error.message}`);
    }
  }

  /**
   * Create a payment session for upgrading to premium
   */
  async createPaymentSession(userId, successUrl, cancelUrl) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Create customer if doesn't exist
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await this.createCustomer(user);
        customerId = customer.id;
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        mode: 'payment', // One-time payment
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'NextAI Idea Premium Access',
                description: 'Unlock landing page creation feature and premium tools',
                images: ['https://nextaiidea.com/logo.png'], // Add your logo URL
              },
              unit_amount: 2999, // $29.99 in cents
            },
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: userId.toString(),
          type: 'premium_upgrade',
        },
      });

      return session;
    } catch (error) {
      throw new Error(`Failed to create payment session: ${error.message}`);
    }
  }

  /**
   * Handle successful payment
   */
  async handleSuccessfulPayment(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status === 'paid') {
        const userId = session.metadata.userId;
        
        await User.findByIdAndUpdate(userId, {
          isPremium: true,
          premiumPurchaseDate: new Date(),
          subscriptionStatus: 'active',
        });

        return { success: true, userId };
      }
      
      return { success: false, message: 'Payment not completed' };
    } catch (error) {
      throw new Error(`Failed to handle successful payment: ${error.message}`);
    }
  }

  /**
   * Check if user has premium access
   */
  async checkPremiumAccess(userId) {
    try {
      const user = await User.findById(userId);
      return user && user.isPremium;
    } catch (error) {
      throw new Error(`Failed to check premium access: ${error.message}`);
    }
  }

  /**
   * Create a billing portal session for managing subscriptions
   */
  async createBillingPortalSession(userId, returnUrl) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.stripeCustomerId) {
        throw new Error('Customer not found');
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: returnUrl,
      });

      return session;
    } catch (error) {
      throw new Error(`Failed to create billing portal session: ${error.message}`);
    }
  }

  /**
   * Handle Stripe webhooks
   */
  async handleWebhook(event) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          return await this.handleSuccessfulPayment(event.data.object.id);
        
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          return await this.handleSubscriptionChange(event.data.object);
        
        default:
          console.log(`Unhandled event type: ${event.type}`);
          return { success: true, message: 'Event not handled' };
      }
    } catch (error) {
      throw new Error(`Webhook handling failed: ${error.message}`);
    }
  }

  /**
   * Handle subscription changes
   */
  async handleSubscriptionChange(subscription) {
    try {
      const customer = await stripe.customers.retrieve(subscription.customer);
      const userId = customer.metadata.userId;

      if (!userId) {
        throw new Error('User ID not found in customer metadata');
      }

      const updateData = {
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
      };

      // Update premium status based on subscription status
      if (subscription.status === 'active') {
        updateData.isPremium = true;
      } else if (['canceled', 'incomplete_expired', 'past_due'].includes(subscription.status)) {
        updateData.isPremium = false;
      }

      await User.findByIdAndUpdate(userId, updateData);

      return { success: true, userId };
    } catch (error) {
      throw new Error(`Failed to handle subscription change: ${error.message}`);
    }
  }
}

module.exports = new PaymentService();
