import { json, error } from '../_lib/http.js';

const JWT_SECRET = 'inkling-secret-key-change-in-production';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

// Simple JWT implementation for Edge Functions
const base64url = (str) => btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

const createToken = (payload) => {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify({ ...payload, iat: Date.now() }));
  const signature = base64url(`${header}.${body}.${JWT_SECRET}`);
  return `${header}.${body}.${signature}`;
};

const verifyToken = (token) => {
  try {
    const [header, body, signature] = token.split('.');
    const expectedSignature = base64url(`${header}.${body}.${JWT_SECRET}`);
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(atob(body));
    if (Date.now() - payload.iat > 7 * 24 * 60 * 60 * 1000) return null; // 7 days expiry
    return payload;
  } catch {
    return null;
  }
};

// Hash password (simple implementation - use bcrypt in production)
const hashPassword = (password) => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return base64url(String(hash));
};

export const postLogin = async ({ request, storage }) => {
  const body = await request.json().catch(() => null);
  const { email, password } = body || {};

  if (!email || !password) {
    return error('Email and password are required.', 400);
  }

  if (!emailPattern.test(email)) {
    return error('Please enter a valid email address.', 400);
  }

  const userKey = `user:email:${email.toLowerCase()}`;
  const userId = await storage?.get(userKey);

  if (!userId) {
    return error('Invalid email or password.', 401);
  }

  const userData = await storage?.get(`user:${userId}`);
  if (!userData) {
    return error('User not found.', 404);
  }

  const user = JSON.parse(userData);
  const passwordHash = hashPassword(password);

  if (user.passwordHash !== passwordHash) {
    return error('Invalid email or password.', 401);
  }

  const token = createToken({ userId: user.id, email: user.email });

  // Store session
  await storage?.put(`session:${token}`, JSON.stringify({
    userId: user.id,
    email: user.email,
    createdAt: new Date().toISOString()
  }));

  return json({
    ok: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan || 'free'
    }
  });
};

export const postRegister = async ({ request, storage }) => {
  const body = await request.json().catch(() => null);
  const { email, password, name } = body || {};

  if (!email || !password || !name) {
    return error('Email, password, and name are required.', 400);
  }

  if (!emailPattern.test(email)) {
    return error('Please enter a valid email address.', 400);
  }

  if (password.length < 8) {
    return error('Password must be at least 8 characters.', 400);
  }

  const userKey = `user:email:${email.toLowerCase()}`;
  const existingUserId = await storage?.get(userKey);

  if (existingUserId) {
    return error('An account with this email already exists.', 409);
  }

  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const passwordHash = hashPassword(password);

  const user = {
    id: userId,
    email: email.toLowerCase(),
    name,
    passwordHash,
    plan: 'free',
    createdAt: new Date().toISOString()
  };

  await storage?.put(`user:${userId}`, JSON.stringify(user));
  await storage?.put(userKey, userId);

  const token = createToken({ userId, email: user.email });

  await storage?.put(`session:${token}`, JSON.stringify({
    userId,
    email: user.email,
    createdAt: new Date().toISOString()
  }));

  return json({
    ok: true,
    token,
    user: {
      id: userId,
      email: user.email,
      name,
      plan: 'free'
    }
  }, { status: 201 });
};

export const getMe = async ({ request, storage }) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return error('Authentication required.', 401);
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  if (!payload) {
    return error('Invalid or expired token.', 401);
  }

  const userData = await storage?.get(`user:${payload.userId}`);
  if (!userData) {
    return error('User not found.', 404);
  }

  const user = JSON.parse(userData);

  return json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan || 'free',
      createdAt: user.createdAt
    }
  });
};
