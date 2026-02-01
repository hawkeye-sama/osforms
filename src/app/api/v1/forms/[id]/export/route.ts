import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Form from '@/lib/models/form';
import Submission from '@/lib/models/submission';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { user, error } = await requireAuth(req);
  if (error) {
    return error;
  }

  const { id } = await params;

  await connectDB();

  // Verify ownership
  const form = await Form.findOne({ _id: id, userId: user._id }).lean();
  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  }

  // Fetch ALL submissions for this form
  const submissions = await Submission.find({ formId: id })
    .sort({ createdAt: -1 })
    .lean();

  if (submissions.length === 0) {
    return new NextResponse('No submissions to export', { status: 200 });
  }

  // Get all unique keys from submission data
  const keysSet = new Set<string>();
  submissions.forEach((sub: any) => {
    Object.keys(sub.data || {}).forEach((key) => keysSet.add(key));
  });
  const dataKeys = Array.from(keysSet);
  const headers = ['ID', 'Date', ...dataKeys];

  // Helper to escape CSV values
  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = submissions.map((sub: any) => {
    const row = [
      sub._id,
      new Date(sub.createdAt).toISOString(),
      ...dataKeys.map((key) => sub.data?.[key] ?? ''),
    ];
    return row.map(escapeCSV).join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="submissions-${id}.csv"`,
    },
  });
}
