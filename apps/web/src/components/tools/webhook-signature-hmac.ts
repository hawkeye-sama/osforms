/**
 * Pure HMAC helpers for the webhook signature tool.
 *
 * No React, no Node APIs, no path aliases: everything here runs on the Web
 * Crypto API (`crypto.subtle`), which exists in browsers and in Node 20+, so
 * the same file can be unit-checked with plain `node`.
 */

export type HmacAlgorithm = 'SHA-256' | 'SHA-1' | 'SHA-512';
export type DigestEncoding = 'hex' | 'base64';

export const HMAC_ALGORITHMS: HmacAlgorithm[] = ['SHA-256', 'SHA-1', 'SHA-512'];

const encoder = new TextEncoder();

/** HMAC of `message` keyed with `secret`, both taken as UTF-8 text. */
export async function hmacDigest(
  secret: string,
  message: string,
  algorithm: HmacAlgorithm = 'SHA-256'
): Promise<Uint8Array> {
  if (secret.length === 0) {
    // Web Crypto rejects zero-length HMAC keys.
    throw new Error('Secret is empty');
  }
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message)
  );
  return new Uint8Array(signature);
}

export function toHex(bytes: Uint8Array): string {
  let out = '';
  for (const b of bytes) {
    out += b.toString(16).padStart(2, '0');
  }
  return out;
}

export function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary);
}

export function encodeDigest(
  bytes: Uint8Array,
  encoding: DigestEncoding
): string {
  return encoding === 'hex' ? toHex(bytes) : toBase64(bytes);
}

/** UTF-8 byte length of a string (what the sender actually hashes). */
export function byteLength(text: string): number {
  return encoder.encode(text).length;
}

/**
 * The exact string that gets signed. Stripe signs `<timestamp>.<raw body>`;
 * every other supported sender signs the raw body alone.
 */
export function signedMessage(
  payload: string,
  timestamp: string | null
): string {
  return timestamp ? `${timestamp}.${payload}` : payload;
}

export interface ParsedSignature {
  /** Candidate signature values with any known prefix removed. */
  signatures: string[];
  /** `t=` value when a full Stripe-Signature header was pasted. */
  timestamp: string | null;
  /** Prefix that was stripped, e.g. `sha256=`. */
  prefix: string | null;
}

const PREFIX_RE = /^(sha256|sha1|sha512)=/i;
const STRIPE_HEADER_RE = /(^|,)\s*v1=/;

/**
 * Accepts what people paste from request logs: a bare digest, a GitHub-style
 * `sha256=<hex>` value, or a full Stripe `t=...,v1=...` header. A leading
 * `Header-Name:` is ignored too.
 */
export function parseReceivedSignature(input: string): ParsedSignature {
  let value = input.trim();
  const headerName = /^[A-Za-z0-9-]+:\s*/.exec(value);
  if (headerName && !/^(t|v\d+)=/.test(value)) {
    value = value.slice(headerName[0].length).trim();
  }
  if (!value) {
    return { signatures: [], timestamp: null, prefix: null };
  }

  if (STRIPE_HEADER_RE.test(value)) {
    let timestamp: string | null = null;
    const signatures: string[] = [];
    for (const part of value.split(',')) {
      const eq = part.indexOf('=');
      if (eq === -1) {
        continue;
      }
      const name = part.slice(0, eq).trim();
      const val = part.slice(eq + 1).trim();
      if (name === 't') {
        timestamp = val;
      } else if (name === 'v1' && val) {
        // Only v1 is a live scheme; v0 is a test-only decoy.
        signatures.push(val);
      }
    }
    return { signatures, timestamp, prefix: null };
  }

  const prefixMatch = PREFIX_RE.exec(value);
  if (prefixMatch) {
    return {
      signatures: [value.slice(prefixMatch[0].length).trim()],
      timestamp: null,
      prefix: prefixMatch[0].toLowerCase(),
    };
  }
  return { signatures: [value], timestamp: null, prefix: null };
}

/**
 * Decodes a received signature as hex or base64 (including base64url),
 * accepting it only if it decodes to `expectedBytes` bytes.
 */
export function decodeSignature(
  value: string,
  expectedBytes: number
): { bytes: Uint8Array; encoding: DigestEncoding } | null {
  const v = value.trim();
  if (/^[0-9a-fA-F]+$/.test(v) && v.length === expectedBytes * 2) {
    const bytes = new Uint8Array(expectedBytes);
    for (let i = 0; i < expectedBytes; i++) {
      bytes[i] = parseInt(v.slice(i * 2, i * 2 + 2), 16);
    }
    return { bytes, encoding: 'hex' };
  }

  let b64 = v.replace(/-/g, '+').replace(/_/g, '/');
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(b64)) {
    return null;
  }
  b64 = b64.replace(/=+$/, '');
  b64 += '='.repeat((4 - (b64.length % 4)) % 4);
  try {
    const binary = atob(b64);
    if (binary.length !== expectedBytes) {
      return null;
    }
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return { bytes, encoding: 'base64' };
  } catch {
    return null;
  }
}

/**
 * Byte comparison that doesn't exit early. Timing doesn't matter in a
 * browser tool, but this is the shape a server-side check should have.
 */
export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

export type VerifyStatus = 'match' | 'mismatch' | 'unreadable';

export interface VerifyResult {
  status: VerifyStatus;
  /** Encoding the received value was read as, when it could be decoded. */
  encoding: DigestEncoding | null;
}

/**
 * Compares a computed digest against one or more received values. Matches if
 * any candidate matches (Stripe sends several v1 values during secret
 * rotation).
 */
export function verifyDigest(
  computed: Uint8Array,
  candidates: string[]
): VerifyResult {
  let encoding: DigestEncoding | null = null;
  for (const candidate of candidates) {
    const decoded = decodeSignature(candidate, computed.length);
    if (!decoded) {
      continue;
    }
    encoding = decoded.encoding;
    if (bytesEqual(decoded.bytes, computed)) {
      return { status: 'match', encoding };
    }
  }
  return { status: encoding ? 'mismatch' : 'unreadable', encoding };
}
