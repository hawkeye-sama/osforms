import { isValidObjectId } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

import { authenticateApiKey } from '@/lib/api-keys';
import Submission from '@/lib/models/submission';
import { parseFieldsParam, toPublicSubmission } from '@/lib/public-submissions';

type Params = { params: Promise<{ id: string }> };

/** GET /api/v1/submissions/:id - Pull one submission by ID (API key auth) */
export async function GET(req: NextRequest, { params }: Params) {
  const { apiKey, headers, error } = await authenticateApiKey(req);
  if (error) {
    return error;
  }

  const { id } = await params;
  const notFound = () =>
    NextResponse.json(
      { error: 'Submission not found, or this API key has no access to it' },
      { status: 404, headers }
    );

  if (!isValidObjectId(id)) {
    return notFound();
  }

  try {
    const submission = await Submission.findOne({
      _id: id,
      userId: apiKey.userId,
      formId: { $in: apiKey.formIds },
    })
      .select('formId data createdAt')
      .lean();

    if (!submission) {
      return notFound();
    }

    const fields = parseFieldsParam(
      new URL(req.url).searchParams.get('fields')
    );
    return NextResponse.json(
      { data: toPublicSubmission(submission, fields) },
      { headers }
    );
  } catch (err) {
    console.error('Pull submission error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers }
    );
  }
}
