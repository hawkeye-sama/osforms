import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Form from '@/lib/models/form';
import Integration from '@/lib/models/integration';
import { createOrUpdateIntegration } from '@/lib/services/integration';
import { createIntegrationSchema } from '@/lib/validations';

/** GET /api/v1/integrations?formId=xxx */
export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) {
    return error;
  }

  const formId = new URL(req.url).searchParams.get('formId');
  if (!formId) {
    return NextResponse.json({ error: 'formId required' }, { status: 400 });
  }

  await connectDB();

  const form = await Form.findOne({ _id: formId, userId: user._id });
  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  }

  const integrations = await Integration.find({ formId })
    .select('type name enabled createdAt updatedAt')
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ integrations });
}

/** POST /api/v1/integrations */
export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) {
    return error;
  }

  try {
    const body = await req.json();
    const parsed = createIntegrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const { formId, type, name, config, enabled } = parsed.data;

    // Verify form ownership
    const form = await Form.findOne({ _id: formId, userId: user._id });
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Validate integration config
    const integration = await createOrUpdateIntegration({
      formId,
      type,
      name,
      config,
      enabled,
    });

    return NextResponse.json(
      {
        integration: {
          id: integration._id,
          type: integration.type,
          name: integration.name,
          enabled: integration.enabled,
          createdAt: integration.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Create integration error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
