import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { encryptJSON } from '@/lib/encryption';
import { getHandler } from '@/lib/integrations';
import Form from '@/lib/models/form';
import Integration from '@/lib/models/integration';
import { updateIntegrationSchema } from '@/lib/validations';

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/v1/integrations/:id */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { user, error } = await requireAuth(req);
  if (error) {
    return error;
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = updateIntegrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

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

    if (parsed.data.name !== undefined) {
      integration.name = parsed.data.name;
    }
    if (parsed.data.enabled !== undefined) {
      integration.enabled = parsed.data.enabled;
    }

    if (parsed.data.config !== undefined) {
      const handler = getHandler(integration.type);
      if (handler) {
        const validation = handler.validate(
          parsed.data.config as Record<string, unknown>
        );
        if (!validation.valid) {
          return NextResponse.json(
            { error: `Invalid config: ${validation.error}` },
            { status: 400 }
          );
        }
      }
      integration.configEncrypted = encryptJSON(
        parsed.data.config as Record<string, unknown>
      );
    }

    await integration.save();

    return NextResponse.json({
      integration: {
        id: integration._id,
        type: integration.type,
        name: integration.name,
        enabled: integration.enabled,
      },
    });
  } catch (err) {
    console.error('Update integration error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/** DELETE /api/v1/integrations/:id */
export async function DELETE(req: NextRequest, { params }: Params) {
  const { user, error } = await requireAuth(req);
  if (error) {
    return error;
  }

  const { id } = await params;
  await connectDB();

  const integration = await Integration.findById(id);
  if (!integration) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const form = await Form.findOne({
    _id: integration.formId,
    userId: user._id,
  });
  if (!form) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await Integration.deleteOne({ _id: id });

  return NextResponse.json({ success: true });
}
