import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { connectDB } from './db';
import User from './models/user';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const COOKIE_NAME = 'ff_token';
const TOKEN_EXPIRY = '7d';

// ── Password ────────────────────────────────────────────────

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── JWT ─────────────────────────────────────────────────────

export interface JWTPayload {
  userId: string;
  email: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// ── Cookie helpers ──────────────────────────────────────────

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ── Get current user from request ───────────────────────────

/**
 * Extract the current user from JWT.
 * Reads from cookie (browser) or Authorization header (API/SDK).
 * Returns null if not authenticated.
 */
export async function getCurrentUser(req?: NextRequest) {
  let token: string | undefined;

  if (req) {
    // API route: check Authorization header first, then cookie
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else {
      token = req.cookies.get(COOKIE_NAME)?.value;
    }
  } else {
    // Server component: read from cookies
    const cookieStore = await cookies();
    token = cookieStore.get(COOKIE_NAME)?.value;
  }

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  await connectDB();
  const user = await User.findById(payload.userId).lean();
  return user;
}

/**
 * Require auth for an API route. Returns user or throws 401-style object.
 */
export async function requireAuth(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return {
      user: null as never,
      error: Response.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { user, error: null };
}
