import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { decryptJSON } from '@/lib/encryption';
import { getHandler, type IntegrationContext } from '@/lib/integrations';
import Form from '@/lib/models/form';
import Integration from '@/lib/models/integration';

type Params = { params: Promise<{ id: string }> };

/** POST /api/v1/integrations/:id/test */
export async function POST(req: NextRequest, { params }: Params) {
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

    // Get the handler for this integration type
    const handler = getHandler(integration.type);
    if (!handler) {
      return NextResponse.json(
        { error: `No handler found for integration type: ${integration.type}` },
        { status: 400 }
      );
    }

    // Create test context with sample data
    const testContext: IntegrationContext = {
      submissionId: 'test_sub_' + Date.now(),
      formId: form._id.toString(),
      formName: form.name,
      submittedAt: new Date().toISOString(),
      data: {
        name: 'Test User',
        email: 'test@example.com',
        message:
          'This is a test submission from osforms to verify your integration is working correctly.',
        phone: '+1234567890',
        company: 'Test Company',
      },
    };

    // Decrypt config and execute
    const config = decryptJSON(integration.configEncrypted);
    const result = await handler.execute(testContext, config);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Test failed', message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message || 'Test integration executed successfully',
    });
  } catch (err) {
    console.error('[Test Integration] Error:', err);
    return NextResponse.json(
      { error: 'Failed to test integration', message: String(err) },
      { status: 500 }
    );
  }
}
