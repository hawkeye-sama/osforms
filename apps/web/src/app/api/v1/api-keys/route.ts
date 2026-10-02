import { NextRequest, NextResponse } from 'next/server';

import { generateApiKey, MAX_API_KEYS_PER_USER } from '@/lib/api-keys';
import { requireAuth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import ApiKey from '@/lib/models/api-key';
import Form from '@/lib/models/form';
import { createApiKeySchema } from '@/lib/validations';

/** GET /api/v1/api-keys - List the user's API keys (never the key itself) */
export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) {
    return error;
  }

  await connectDB();

  const keys = await ApiKey.find({ userId: user._id })
    .select('name prefix formIds lastUsedAt createdAt')
    .sort({ createdAt: -1 })
    .lean();

  const formIds = keys.flatMap((k) => k.formIds);
  const forms = await Form.find({ _id: { $in: formIds }, userId: user._id })
    .select('name slug')
    .lean();
  const formsById = new Map(forms.map((f) => [f._id.toString(), f]));

  return NextResponse.json({
    apiKeys: keys.map((k) => ({
      id: k._id,
      name: k.name,
      prefix: k.prefix,
      forms: k.formIds
        .map((id) => formsById.get(id.toString()))
        .filter((f) => f !== undefined)
        .map((f) => ({ id: f._id, name: f.name, slug: f.slug })),
      lastUsedAt: k.lastUsedAt,
      createdAt: k.createdAt,
    })),
  });
}

/** POST /api/v1/api-keys - Create a read-only key scoped to selected forms */
export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) {
    return error;
  }

  try {
    const body = await req.json();
    const parsed = createApiKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await ApiKey.countDocuments({ userId: user._id });
    if (existing >= MAX_API_KEYS_PER_USER) {
      return NextResponse.json(
        {
          error: `You can have up to ${MAX_API_KEYS_PER_USER} API keys. Revoke one you no longer use, then try again.`,
        },
        { status: 400 }
      );
    }

    // Every selected form must belong to this user
    const formIds = [
      ...new Set(parsed.data.formIds.map((id) => id.toLowerCase())),
    ];
    const ownedCount = await Form.countDocuments({
      _id: { $in: formIds },
      userId: user._id,
    });
    if (ownedCount !== formIds.length) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const { key, prefix, keyHash } = generateApiKey();
    const apiKey = await ApiKey.create({
      userId: user._id,
      name: parsed.data.name,
      prefix,
      keyHash,
      formIds,
    });

    // The only response that ever contains the plaintext key
    return NextResponse.json(
      {
        apiKey: {
          id: apiKey._id,
          name: apiKey.name,
          prefix: apiKey.prefix,
          createdAt: apiKey.createdAt,
          key,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Create API key error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
