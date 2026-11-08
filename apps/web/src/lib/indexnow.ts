/**
 * IndexNow (Bing, Yandex, Seznam, Naver…; Bing's index also feeds ChatGPT
 * search and Copilot). https://www.indexnow.org/documentation
 *
 * The key is public by design: search engines verify ownership by fetching
 * `${INDEXNOW_ORIGIN}/${key}.txt`, which must contain exactly the key.
 *
 * INVARIANT: public/${INDEXNOW_DEFAULT_KEY}.txt must exist and contain exactly
 * INDEXNOW_DEFAULT_KEY (no newline). The cron route re-checks this before every
 * submission by fetching keyLocation and comparing, and refuses to submit on a
 * mismatch. If you rotate the key, rename that file in the same change.
 */
export const INDEXNOW_DEFAULT_KEY = '3908cc430c7607c8911c9e9400a96970';

/**
 * IndexNow submissions always describe the production site, regardless of
 * NEXT_PUBLIC_APP_URL in preview/dev environments.
 */
export const INDEXNOW_HOST = 'osforms.com';
export const INDEXNOW_ORIGIN = `https://${INDEXNOW_HOST}`;
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

/**
 * Key in use. INDEXNOW_KEY overrides the committed key, but only works if a
 * matching public/<key>.txt is deployed too, so normally leave it unset.
 */
export function getIndexNowKey(): string {
  return process.env.INDEXNOW_KEY || INDEXNOW_DEFAULT_KEY;
}

export function indexNowKeyLocation(key: string): string {
  return `${INDEXNOW_ORIGIN}/${key}.txt`;
}
