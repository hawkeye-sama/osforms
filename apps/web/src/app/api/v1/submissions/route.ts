import mongoose, { type QueryFilter } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

import { authenticateApiKey, resolveReadableFormId } from '@/lib/api-keys';
import Submission, { ISubmission } from '@/lib/models/submission';
import {
  decodeCursor,
  encodeCursor,
  parseFieldsParam,
  toPublicSubmission,
} from '@/lib/public-submissions';
import { listSubmissionsQuerySchema } from '@/lib/validations';

/**
 * GET /api/v1/submissions?formId=xxx - Pull a form's submissions (API key auth)
 *
 * formId accepts the form ID or the endpoint slug.
 * Query: limit (1-100, default 25), cursor, since (ISO 8601, inclusive),
 * order (asc|desc, default desc), fields (comma-separated field names).
 */
export async function GET(req: NextRequest) {
  const { apiKey, headers, error } = await authenticateApiKey(req);
  if (error) {
    return error;
  }

  const parsed = listSubmissionsQuerySchema.safeParse(
    Object.fromEntries(new URL(req.url).searchParams)
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400, headers }
    );
  }

  const { limit, cursor, since, order, fields } = parsed.data;

  try {
    const formId = await resolveReadableFormId(apiKey, parsed.data.formId);
    if (!formId) {
      return NextResponse.json(
        { error: 'Form not found, or this API key has no access to it' },
        { status: 404, headers }
      );
    }

    const dir = order === 'asc' ? 1 : -1;
    const filter: QueryFilter<ISubmission> = {
      formId: new mongoose.Types.ObjectId(formId),
      userId: apiKey.userId,
    };

    if (since) {
      filter.createdAt = { $gte: new Date(since) };
    }

    if (cursor) {
      const after = decodeCursor(cursor);
      if (!after) {
        return NextResponse.json(
          {
            error:
              'Invalid cursor. Pass the nextCursor value from the previous response unchanged.',
          },
          { status: 400, headers }
        );
      }
      const op = dir === 1 ? '$gt' : '$lt';
      filter.$or = [
        { createdAt: { [op]: after.createdAt } },
        { createdAt: after.createdAt, _id: { [op]: after.id } },
      ];
    }

    // Fetch one extra row to know whether another page exists
    const rows = await Submission.find(filter)
      .sort({ createdAt: dir, _id: dir })
      .limit(limit + 1)
      .select('formId data createdAt')
      .lean();

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const fieldSet = parseFieldsParam(fields);

    return NextResponse.json(
      {
        data: page.map((sub) => toPublicSubmission(sub, fieldSet)),
        nextCursor: hasMore ? encodeCursor(page[page.length - 1]) : null,
        hasMore,
      },
      { headers }
    );
  } catch (err) {
    console.error('Pull submissions error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers }
    );
  }
}
