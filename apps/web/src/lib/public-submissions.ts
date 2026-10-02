import mongoose from 'mongoose';

import type { ISubmission } from './models/submission';

/**
 * Shape of a submission in the pull API. Deliberately excludes metadata
 * (IP, user agent, origin) so that PII never leaves OSForms.
 */
export interface PublicSubmission {
  id: string;
  formId: string;
  submittedAt: string;
  fields: Record<string, unknown>;
}

type SubmissionRow = Pick<ISubmission, '_id' | 'formId' | 'data' | 'createdAt'>;

/** Parse `fields=a,b,c` into a set. Undefined means "all fields". */
export function parseFieldsParam(raw?: string | null): Set<string> | undefined {
  const names = (raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return names.length > 0 ? new Set(names) : undefined;
}

export function toPublicSubmission(
  sub: SubmissionRow,
  fields?: Set<string>
): PublicSubmission {
  const data = sub.data || {};
  return {
    id: sub._id.toString(),
    formId: sub.formId.toString(),
    submittedAt: new Date(sub.createdAt).toISOString(),
    // Filtered in app code, not via a Mongo projection: field names are
    // user-supplied and may contain "." or "$".
    fields: fields
      ? Object.fromEntries(
          Object.entries(data).filter(([key]) => fields.has(key))
        )
      : data,
  };
}

// ── Cursor ──────────────────────────────────────────────────
// Opaque to clients. Encodes the (createdAt, _id) of the last row returned,
// which is a total order, so pages stay stable while new submissions arrive.

export interface SubmissionCursor {
  createdAt: Date;
  id: mongoose.Types.ObjectId;
}

export function encodeCursor(sub: SubmissionRow): string {
  return Buffer.from(
    JSON.stringify({
      t: new Date(sub.createdAt).toISOString(),
      id: sub._id.toString(),
    })
  ).toString('base64url');
}

export function decodeCursor(raw: string): SubmissionCursor | null {
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    const createdAt = new Date(parsed?.t);
    if (
      typeof parsed?.id !== 'string' ||
      !/^[a-f0-9]{24}$/i.test(parsed.id) ||
      Number.isNaN(createdAt.getTime())
    ) {
      return null;
    }
    return { createdAt, id: new mongoose.Types.ObjectId(parsed.id) };
  } catch {
    return null;
  }
}
