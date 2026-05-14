const JWT_SECRET = 'inkling-secret-key-change-in-production';

const base64url = (str) => btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

const verifyToken = (token) => {
  try {
    const [header, body, signature] = token.split('.');
    const expectedSignature = base64url(`${header}.${body}.${JWT_SECRET}`);
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(atob(body));
    if (Date.now() - payload.iat > 7 * 24 * 60 * 60 * 1000) return null;
    return payload;
  } catch {
    return null;
  }
};

export const onRequest = async (context) => {
  const { request } = context;
  const url = new URL(request.url);

  // Skip auth for public routes
  const publicRoutes = ['/api/site', '/api/features', '/api/pricing', '/api/testimonials', '/api/stats', '/api/health', '/api/waitlist', '/api/share', '/api/chat'];
  if (publicRoutes.some(route => url.pathname.startsWith(route))) {
    return context.next();
  }

  // Check for auth header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Authentication required.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  if (!payload) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Add user info to request headers for downstream use
  const modifiedRequest = new Request(request, {
    headers: new Headers({
      ...Object.fromEntries(request.headers),
      'X-User-Id': payload.userId,
      'X-User-Email': payload.email
    })
  });

  return context.next({ request: modifiedRequest });
};
