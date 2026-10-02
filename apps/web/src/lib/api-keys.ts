import crypto from 'crypto';

import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

import { runInBackground } from './background';
import { connectDB } from './db';
import ApiKey from './models/api-key';
import Form from './models/form';
import { checkSharedRateLimit } from './rate-limit';

export const API_KEY_PREFIX = 'osf_live_';
export const API_KEY_RATE_LIMIT = 60; // requests per minute, per key
export const MAX_API_KEYS_PER_USER = 10;

// Only write lastUsedAt when the stored value is older than this
const LAST_USED_RESOLUTION_MS = 60_000;

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Generate a new API key. Return `key` to the user exactly once;
 * persist only `keyHash` and `prefix`.
 */
export function generateApiKey() {
  const key = API_KEY_PREFIX + crypto.randomBytes(24).toString('base64url');
  return {
    key,
    prefix: key.slice(0, API_KEY_PREFIX.length + 4),
    keyHash: hashApiKey(key),
  };
}

export interface AuthenticatedApiKey {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  formIds: mongoose.Types.ObjectId[];
}

/** True if this key was granted read access to the form. */
function canReadForm(apiKey: AuthenticatedApiKey, formId: string) {
  const id = formId.toLowerCase();
  return apiKey.formIds.some((f) => f.toString() === id);
}

/**
 * Resolve a form reference — the form ID or its endpoint slug — to a form ID
 * this key may read. Returns null if the form doesn't exist or is out of scope.
 */
export async function resolveReadableFormId(
  apiKey: AuthenticatedApiKey,
  formRef: string
): Promise<string | null> {
  if (/^[a-f0-9]{24}$/i.test(formRef)) {
    return canReadForm(apiKey, formRef) ? formRef.toLowerCase() : null;
  }

  // Slugs are nanoid(12), so they never collide with the 24-hex ID format
  const form = await Form.findOne({ slug: formRef, userId: apiKey.userId })
    .select('_id')
    .lean();
  if (!form) {
    return null;
  }
  const id = form._id.toString();
  return canReadForm(apiKey, id) ? id : null;
}

/**
 * Authenticate a pull-API request by its `Authorization: Bearer osf_live_...`
 * header and apply the per-key rate limit. API keys are read-only and only
 * accepted by the pull API — never by getCurrentUser().
 *
 * `headers` carries the X-RateLimit-* headers; spread them into the response.
 */
export async function authenticateApiKey(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const key = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : '';

  if (!key.startsWith(API_KEY_PREFIX)) {
    return {
      apiKey: null as never,
      headers: {},
      error: NextResponse.json(
        {
          error: `Missing API key. Send it as "Authorization: Bearer ${API_KEY_PREFIX}...". Create one in Dashboard → Settings → API Keys.`,
        },
        { status: 401 }
      ),
    };
  }

  await connectDB();

  const apiKey = await ApiKey.findOne({ keyHash: hashApiKey(key) })
    .select('userId formIds lastUsedAt')
    .lean();

  if (!apiKey) {
    return {
      apiKey: null as never,
      headers: {},
      error: NextResponse.json(
        {
          error:
            'API key not recognized. It may have been revoked. Check the key in Dashboard → Settings → API Keys.',
        },
        { status: 401 }
      ),
    };
  }

  const rl = await checkSharedRateLimit(
    `apikey:${apiKey._id.toString()}`,
    API_KEY_RATE_LIMIT
  );
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(API_KEY_RATE_LIMIT),
    'X-RateLimit-Remaining': String(rl.remaining),
    'X-RateLimit-Reset': String(Math.ceil(rl.resetAt / 1000)),
  };

  if (!rl.allowed) {
    const retryAfter = Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000));
    return {
      apiKey: null as never,
      headers,
      error: NextResponse.json(
        {
          error: `Rate limit exceeded: ${API_KEY_RATE_LIMIT} requests per minute per API key. Retry in ${retryAfter}s.`,
        },
        {
          status: 429,
          headers: { ...headers, 'Retry-After': String(retryAfter) },
        }
      ),
    };
  }

  const lastUsed = apiKey.lastUsedAt
    ? new Date(apiKey.lastUsedAt).getTime()
    : 0;
  if (Date.now() - lastUsed > LAST_USED_RESOLUTION_MS) {
    runInBackground(async () => {
      await ApiKey.updateOne(
        { _id: apiKey._id },
        { $set: { lastUsedAt: new Date() } }
      );
    });
  }

  const authenticated: AuthenticatedApiKey = {
    _id: apiKey._id,
    userId: apiKey.userId,
    formIds: apiKey.formIds,
  };
  return { apiKey: authenticated, headers, error: null };
}
