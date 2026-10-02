import { isValidObjectId } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import ApiKey from '@/lib/models/api-key';

type Params = { params: Promise<{ id: string }> };

/** DELETE /api/v1/api-keys/:id - Revoke a key (takes effect immediately) */
export async function DELETE(req: NextRequest, { params }: Params) {
  const { user, error } = await requireAuth(req);
  if (error) {
    return error;
  }

  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: 'API key not found' }, { status: 404 });
  }

  await connectDB();

  const result = await ApiKey.deleteOne({ _id: id, userId: user._id });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: 'API key not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
