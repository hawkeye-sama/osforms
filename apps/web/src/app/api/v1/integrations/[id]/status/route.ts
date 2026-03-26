import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { decryptJSON } from '@/lib/encryption';
import Form from '@/lib/models/form';
import Integration from '@/lib/models/integration';

type Params = { params: Promise<{ id: string }> };

/** GET /api/v1/integrations/:id/status - Get non-sensitive integration status */
export async function GET(req: NextRequest, { params }: Params) {
  const { user, error } = await requireAuth(req);
  if (error) {
    return error;
  }

  const { id } = await params;

  try {
    await connectDB();

    const integration = await Integration.findById(id);
    if (!integration) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Verify ownership through form
    const form = await Form.findOne({
      _id: integration.formId,
      userId: user._id,
    });
    if (!form) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Decrypt config to extract non-sensitive fields
    const config = decryptJSON<Record<string, unknown>>(
      integration.configEncrypted
    );

    // Return only non-sensitive data based on integration type
    if (integration.type === 'GOOGLE_SHEETS') {
      const spreadsheetId = config.spreadsheetId as string;
      return NextResponse.json({
        type: integration.type,
        name: integration.name,
        enabled: integration.enabled,
        connectedEmail: config.email as string,
        spreadsheetId,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
        sheetName: (config.sheetName as string) || 'Sheet1',
      });
    }

    // For other types, return basic info only
    return NextResponse.json({
      type: integration.type,
      name: integration.name,
      enabled: integration.enabled,
    });
  } catch (err) {
    console.error('Get integration status error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
