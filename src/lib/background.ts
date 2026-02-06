import { waitUntil as VercelWaitUntil } from '@vercel/functions';

/**
 * Execute a task in the background (doesn't block response)
 *
 * - On Vercel: Uses waitUntil() to run after response is sent
 *
 * @param task - Async function to run in background
 */
export function runInBackground(task: () => Promise<void>): void {
  const promise = task().catch((err) => {
    console.error('[Background] Task failed:', err);
  });

  VercelWaitUntil(promise);
}
