import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Integration from '@/lib/models/integration';
import IntegrationLog from '@/lib/models/integration-log';
import Submission from '@/lib/models/submission';

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/v1/submissions/:id/logs
 * Get integration logs for a specific submission
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { user, error } = await requireAuth(req);
  if (error) {
    return error;
  }

  const { id } = await params;

  try {
    await connectDB();

    // Verify submission belongs to user
    const submission = await Submission.findOne({
      _id: id,
      userId: user._id,
    }).lean();

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Get all integration logs for this submission
    const logs = await IntegrationLog.find({ submissionId: id })
      .sort({ createdAt: 1 })
      .lean();

    // Populate integration names
    const integrationIds = logs.map((log) => log.integrationId);
    const integrations = await Integration.find({
      _id: { $in: integrationIds },
    })
      .select('_id name type')
      .lean();

    const integrationMap = new Map(
      integrations.map((i) => [i._id.toString(), i])
    );

    // Combine logs with integration info
    const logsWithNames = logs.map((log) => {
      const integration = integrationMap.get(log.integrationId.toString());
      return {
        _id: log._id,
        status: log.status,
        message: log.message,
        createdAt: log.createdAt,
        integration: integration
          ? {
              id: integration._id,
              name: integration.name,
              type: integration.type,
            }
          : null,
      };
    });

    return NextResponse.json({ logs: logsWithNames });
  } catch (err) {
    console.error('Get integration logs error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
