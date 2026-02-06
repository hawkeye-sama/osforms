import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Notification from '@/lib/models/notification';

/**
 * GET /api/v1/notifications
 * Get user's notifications (unread first, then recent)
 */
export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) {
    return error;
  }

  try {
    await connectDB();

    const url = new URL(req.url);
    const limit = Math.min(
      50,
      Math.max(1, Number(url.searchParams.get('limit') || '20'))
    );
    const unreadOnly = url.searchParams.get('unread') === 'true';

    const query: Record<string, unknown> = { userId: user._id };
    if (unreadOnly) {
      query.read = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ read: 1, createdAt: -1 }) // Unread first, then most recent
        .limit(limit)
        .lean(),
      Notification.countDocuments({ userId: user._id, read: false }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    console.error('Get notifications error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/notifications
 * Mark notifications as read
 */
export async function PATCH(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) {
    return error;
  }

  try {
    await connectDB();

    const body = await req.json();
    const { notificationIds, markAllRead } = body;

    if (markAllRead) {
      // Mark all user's notifications as read
      await Notification.updateMany(
        { userId: user._id, read: false },
        { $set: { read: true } }
      );
      return NextResponse.json({ success: true, message: 'All marked as read' });
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'notificationIds must be an array' },
        { status: 400 }
      );
    }

    // Mark specific notifications as read
    await Notification.updateMany(
      { _id: { $in: notificationIds }, userId: user._id },
      { $set: { read: true } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Mark notifications read error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
