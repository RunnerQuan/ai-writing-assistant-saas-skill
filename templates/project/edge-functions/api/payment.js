import { json, error } from '../_lib/http.js';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

export const postCreateCheckout = async ({ request, storage }) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return error('Authentication required.', 401);
  }

  const body = await request.json().catch(() => null);
  const { planId, successUrl, cancelUrl } = body || {};

  if (!planId) {
    return error('Plan ID is required.', 400);
  }

  // In production, you would:
  // 1. Verify the user's auth token
  // 2. Create a Stripe checkout session
  // 3. Return the session URL

  // For demo purposes, we'll simulate a checkout session
  const sessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Store the pending subscription
  await storage?.put(`checkout:${sessionId}`, JSON.stringify({
    planId,
    status: 'pending',
    createdAt: new Date().toISOString()
  }));

  return json({
    ok: true,
    sessionId,
    url: successUrl || `${request.headers.get('Origin')}/dashboard?session=${sessionId}`
  });
};

export const postWebhook = async ({ request, storage }) => {
  // In production, verify Stripe webhook signature
  const body = await request.json().catch(() => null);
  const { type, data } = body || {};

  if (type === 'checkout.session.completed') {
    const { sessionId, userId, planId } = data || {};

    // Update user subscription
    if (userId && planId) {
      const userData = await storage?.get(`user:${userId}`);
      if (userData) {
        const user = JSON.parse(userData);
        user.plan = planId;
        user.subscribedAt = new Date().toISOString();
        await storage?.put(`user:${userId}`, JSON.stringify(user));
      }

      // Store subscription record
      await storage?.put(`subscription:${userId}`, JSON.stringify({
        planId,
        sessionId,
        status: 'active',
        createdAt: new Date().toISOString()
      }));
    }

    // Mark checkout as completed
    if (sessionId) {
      await storage?.put(`checkout:${sessionId}`, JSON.stringify({
        planId,
        userId,
        status: 'completed',
        completedAt: new Date().toISOString()
      }));
    }
  }

  return json({ received: true });
};
