import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Form from '@/lib/models/form';
import IntegrationLog from '@/lib/models/integration-log';
import Submission from '@/lib/models/submission';

type Params = { params: Promise<{ id: string }> };

/** GET /api/v1/forms/:id/submissions - Paginated submissions list */
export async function GET(req: NextRequest, { params }: Params) {
  const { user, error } = await requireAuth(req);
  if (error) {
    return error;
  }

  const { id } = await params;
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  const limit = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get('limit') || '25'))
  );
  const skip = (page - 1) * limit;

  await connectDB();

  // Verify ownership
  const form = await Form.findOne({ _id: id, userId: user._id }).lean();
  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  }

  const [submissions, total] = await Promise.all([
    Submission.find({ formId: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Submission.countDocuments({ formId: id }),
  ]);

  // Get integration log stats for each submission
  const submissionIds = submissions.map((s) => s._id);
  const logs = await IntegrationLog.find({
    submissionId: { $in: submissionIds },
  })
    .select('submissionId status')
    .lean();

  // Group logs by submission
  const logsBySubmission = new Map<
    string,
    { success: number; failed: number }
  >();
  for (const log of logs) {
    const key = log.submissionId.toString();
    if (!logsBySubmission.has(key)) {
      logsBySubmission.set(key, { success: 0, failed: 0 });
    }
    const stats = logsBySubmission.get(key)!;
    if (log.status === 'success') {
      stats.success++;
    } else {
      stats.failed++;
    }
  }

  // Add integration stats to each submission
  const submissionsWithStats = submissions.map((sub) => ({
    ...sub,
    integrationStats: logsBySubmission.get(sub._id.toString()) || {
      success: 0,
      failed: 0,
    },
  }));

  return NextResponse.json({
    submissions: submissionsWithStats,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
