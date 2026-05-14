// Node Function for handling Stripe webhooks
// This runs in a full Node.js runtime for complex payment processing

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['stripe-signature'];
  
  // In production, verify the webhook signature
  // const event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);

  const event = req.body;

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;

        if (userId && planId) {
          // Update user subscription in KV
          // This would use the KV binding in production
          console.log(`User ${userId} subscribed to ${planId}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log(`Payment succeeded for ${invoice.customer}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log(`Payment failed for ${invoice.customer}`);
        // Notify user, update subscription status
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log(`Subscription cancelled: ${subscription.id}`);
        // Update user plan to free tier
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}
