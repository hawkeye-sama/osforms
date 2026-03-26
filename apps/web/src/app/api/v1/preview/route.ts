/**
 * No-op preview endpoint used by the form builder's Preview mode.
 * Accepts any POST, returns a fake success response — nothing is stored.
 */
export async function POST() {
  return Response.json({ success: true, submissionId: 'preview' });
}
