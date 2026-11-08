'use client';

import {
  CircleCheck,
  CircleX,
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
  TriangleAlert,
} from 'lucide-react';
import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { WebhookSignatureCopyButton } from './webhook-signature-copy-button';
import {
  byteLength,
  encodeDigest,
  HMAC_ALGORITHMS,
  hmacDigest,
  parseReceivedSignature,
  signedMessage,
  verifyDigest,
  type DigestEncoding,
  type HmacAlgorithm,
} from './webhook-signature-hmac';
import {
  formatHeaderValue,
  getPreset,
  PRESETS,
  type PresetId,
} from './webhook-signature-presets';

type DigestResult =
  | { key: string; bytes: Uint8Array; error: null }
  | { key: string; bytes: null; error: string };

const labelClass = 'text-foreground mb-2 block';
const groupLabelClass = 'text-foreground mb-2 text-sm leading-none font-medium';
const hintClass = 'text-muted-foreground mt-1.5 text-xs';

const ENCODINGS: { id: DigestEncoding; label: string }[] = [
  { id: 'hex', label: 'Hex' },
  { id: 'base64', label: 'Base64' },
];

export function WebhookSignatureTool() {
  const uid = useId();
  const ids = {
    payload: `${uid}-payload`,
    payloadHint: `${uid}-payload-hint`,
    secret: `${uid}-secret`,
    secretHint: `${uid}-secret-hint`,
    timestamp: `${uid}-timestamp`,
    timestampHint: `${uid}-timestamp-hint`,
    received: `${uid}-received`,
    receivedHint: `${uid}-received-hint`,
    algorithm: `${uid}-algorithm`,
    presetLabel: `${uid}-preset-label`,
    encodingLabel: `${uid}-encoding-label`,
  };

  const [presetId, setPresetId] = useState<PresetId>('osforms');
  const [payload, setPayload] = useState('');
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [timestamp, setTimestamp] = useState('');
  const [received, setReceived] = useState('');
  const [algorithm, setAlgorithm] = useState<HmacAlgorithm>('SHA-256');
  const [encoding, setEncoding] = useState<DigestEncoding>('hex');
  const [result, setResult] = useState<DigestResult | null>(null);

  const preset = getPreset(presetId);
  const parsed = useMemo(() => parseReceivedSignature(received), [received]);

  const effectiveTimestamp = preset.usesTimestamp
    ? timestamp.trim() || parsed.timestamp || null
    : null;
  const message = signedMessage(payload, effectiveTimestamp);
  const inputKey = JSON.stringify([secret, message, algorithm]);

  useEffect(() => {
    if (!secret) {
      return;
    }
    let cancelled = false;
    const key = JSON.stringify([secret, message, algorithm]);
    hmacDigest(secret, message, algorithm).then(
      (bytes) => {
        if (!cancelled) {
          setResult({ key, bytes, error: null });
        }
      },
      (err: unknown) => {
        if (!cancelled) {
          let reason = 'Could not compute the HMAC.';
          if (typeof crypto === 'undefined' || !crypto.subtle) {
            reason =
              'Web Crypto is not available. Open this page over HTTPS in a current browser.';
          } else if (err instanceof Error) {
            reason = err.message;
          }
          setResult({ key, bytes: null, error: reason });
        }
      }
    );
    return () => {
      cancelled = true;
    };
  }, [secret, message, algorithm]);

  // Ignore a result computed for older inputs (or for a since-cleared secret).
  const current = secret && result?.key === inputKey ? result : null;
  const bytes = current?.bytes ?? null;
  const digest = bytes ? encodeDigest(bytes, encoding) : '';
  const headerValue =
    preset.id !== 'custom' && bytes
      ? formatHeaderValue(
          preset,
          encodeDigest(bytes, preset.encoding),
          effectiveTimestamp
        )
      : '';
  const verification =
    bytes && parsed.signatures.length > 0
      ? verifyDigest(bytes, parsed.signatures)
      : null;

  const selectPreset = (id: PresetId) => {
    setPresetId(id);
    const next = getPreset(id);
    if (id !== 'custom') {
      setAlgorithm('SHA-256');
      setEncoding(next.encoding);
    }
  };

  const loadExample = () => {
    if (!preset.example) {
      return;
    }
    setPayload(preset.example.payload);
    setSecret(preset.example.secret);
    setReceived(preset.example.signature);
    setTimestamp('');
  };

  const clearAll = () => {
    setPayload('');
    setSecret('');
    setReceived('');
    setTimestamp('');
  };

  const stripeMissingTimestamp = preset.usesTimestamp && !effectiveTimestamp;

  let outputPlaceholder = 'Enter a secret to compute the signature.';
  if (current?.error) {
    outputPlaceholder = current.error;
  } else if (secret) {
    outputPlaceholder = 'Computing...';
  }

  return (
    <div className="border-border bg-card/40 rounded-xl border p-4 sm:p-6">
      {/* ── Sender preset ───────────────────────── */}
      <div role="group" aria-labelledby={ids.presetLabel}>
        <p id={ids.presetLabel} className={groupLabelClass}>
          Who sent the webhook?
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => {
            const active = presetId === p.id;
            return (
              <Button
                key={p.id}
                type="button"
                variant={active ? 'default' : 'outline'}
                aria-pressed={active}
                onClick={() => selectPreset(p.id)}
                className={cn(
                  'focus-visible:ring-offset-background',
                  !active && 'text-muted-foreground hover:text-foreground'
                )}
              >
                {p.name}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="border-border bg-background/60 mt-4 rounded-xl border p-4 text-sm">
        {preset.header ? (
          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[8rem_1fr]">
            <dt className="text-muted-foreground">Header</dt>
            <dd className="text-foreground font-mono break-all">
              {preset.header}: {preset.format}
            </dd>
            <dt className="text-muted-foreground">Signs</dt>
            <dd className="text-foreground">{preset.signs}</dd>
            <dt className="text-muted-foreground">Key</dt>
            <dd className="text-foreground">{preset.key}</dd>
          </dl>
        ) : null}
        <p
          className={cn(
            'text-muted-foreground leading-relaxed',
            preset.header && 'mt-3'
          )}
        >
          {preset.note}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          {preset.example ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadExample}
              className="text-foreground"
            >
              Load example
            </Button>
          ) : null}
          {preset.example ? (
            <span className="text-muted-foreground text-xs">
              {preset.example.source}
            </span>
          ) : null}
          {preset.docsUrl && preset.docsLabel ? (
            <a
              href={preset.docsUrl}
              target={preset.docsUrl.startsWith('http') ? '_blank' : undefined}
              rel={
                preset.docsUrl.startsWith('http')
                  ? 'noopener noreferrer'
                  : undefined
              }
              className="text-foreground inline-flex items-center gap-1 font-mono text-xs underline underline-offset-4 hover:opacity-75"
            >
              {preset.docsLabel}
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* ── Inputs ──────────────────────────── */}
        <div className="space-y-6">
          <div>
            <Label htmlFor={ids.payload} className={labelClass}>
              Payload (raw request body)
            </Label>
            <Textarea
              id={ids.payload}
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              rows={9}
              spellCheck={false}
              autoComplete="off"
              aria-describedby={ids.payloadHint}
              placeholder='{"event":"form.submission", ...}'
              className="border-border bg-card text-foreground focus-visible:ring-ring/20 min-h-40 resize-y font-mono focus-visible:ring-offset-0"
            />
            <p id={ids.payloadHint} className={hintClass}>
              Paste the body exactly as received. Spaces, key order and the
              final newline all change the signature.{' '}
              <span className="font-mono">
                {byteLength(payload).toLocaleString('en-US')} bytes
              </span>
            </p>
          </div>

          <div>
            <Label htmlFor={ids.secret} className={labelClass}>
              Secret
            </Label>
            <div className="flex gap-2">
              <Input
                id={ids.secret}
                type={showSecret ? 'text' : 'password'}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                aria-describedby={ids.secretHint}
                placeholder="Your signing secret"
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowSecret((s) => !s)}
                aria-pressed={showSecret}
                aria-label={showSecret ? 'Hide secret' : 'Show secret'}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-offset-background shrink-0"
              >
                {showSecret ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
              </Button>
            </div>
            <p id={ids.secretHint} className={hintClass}>
              Used as UTF-8 text, exactly as typed. Watch for stray spaces.
            </p>
          </div>

          {preset.usesTimestamp ? (
            <div>
              <Label htmlFor={ids.timestamp} className={labelClass}>
                Timestamp (t=)
              </Label>
              <Input
                id={ids.timestamp}
                type="text"
                inputMode="numeric"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                aria-describedby={ids.timestampHint}
                placeholder={parsed.timestamp ?? '1492774577'}
                className="font-mono"
              />
              <p id={ids.timestampHint} className={hintClass}>
                Leave empty to use the t= value from a pasted Stripe-Signature
                header.
              </p>
            </div>
          ) : null}

          <div>
            <Label htmlFor={ids.received} className={labelClass}>
              Received signature{' '}
              <span className="text-muted-foreground font-normal">
                (optional, to verify)
              </span>
            </Label>
            <Input
              id={ids.received}
              type="text"
              value={received}
              onChange={(e) => setReceived(e.target.value)}
              spellCheck={false}
              autoComplete="off"
              aria-describedby={ids.receivedHint}
              placeholder={preset.header ? preset.format : 'Hex or base64'}
              className="font-mono"
            />
            <p id={ids.receivedHint} className={hintClass}>
              Hex or base64. A <span className="font-mono">sha256=</span>{' '}
              prefix, a header name, or a full Stripe header are all fine.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div>
              <Label htmlFor={ids.algorithm} className={labelClass}>
                Algorithm
              </Label>
              <Select
                value={algorithm}
                onValueChange={(v) => setAlgorithm(v as HmacAlgorithm)}
              >
                <SelectTrigger
                  id={ids.algorithm}
                  className="border-border bg-card text-foreground focus:ring-ring/20 w-44 cursor-pointer focus:ring-offset-0"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-card text-foreground">
                  {HMAC_ALGORITHMS.map((a) => (
                    <SelectItem key={a} value={a}>
                      HMAC-{a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div role="group" aria-labelledby={ids.encodingLabel}>
              <p id={ids.encodingLabel} className={groupLabelClass}>
                Output
              </p>
              <div className="flex gap-2">
                {ENCODINGS.map((e) => {
                  const active = encoding === e.id;
                  return (
                    <Button
                      key={e.id}
                      type="button"
                      variant={active ? 'default' : 'outline'}
                      aria-pressed={active}
                      onClick={() => setEncoding(e.id)}
                      className={cn(
                        'focus-visible:ring-offset-background',
                        !active && 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {e.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={clearAll}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-offset-background ml-auto"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* ── Output ──────────────────────────── */}
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-foreground text-sm font-medium">
                Computed HMAC-{algorithm} ({encoding})
              </h2>
              <WebhookSignatureCopyButton
                value={digest}
                label="Copy computed signature"
              />
            </div>
            <output
              aria-live="polite"
              className="border-border bg-background text-foreground block min-h-20 rounded-md border p-3 font-mono text-sm leading-relaxed break-all"
            >
              {digest || (
                <span className="text-muted-foreground">
                  {outputPlaceholder}
                </span>
              )}
            </output>
          </div>

          {preset.header ? (
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="text-foreground text-sm font-medium">
                  {preset.name} header value
                </h2>
                <WebhookSignatureCopyButton
                  value={headerValue}
                  label={`Copy ${preset.header} value`}
                />
              </div>
              <div className="border-border bg-background block rounded-md border p-3 font-mono text-sm leading-relaxed break-all">
                <span className="text-muted-foreground">{preset.header}: </span>
                <span className="text-foreground">
                  {headerValue || preset.format}
                </span>
              </div>
            </div>
          ) : null}

          {stripeMissingTimestamp ? (
            <p className="border-border text-muted-foreground flex gap-2 rounded-md border p-3 text-sm">
              <TriangleAlert
                className="text-foreground mt-0.5 h-4 w-4 shrink-0"
                aria-hidden
              />
              Stripe signs the timestamp and the body together. Add the t=
              value, or paste the full Stripe-Signature header into Received
              signature. Until then the digest covers the body alone.
            </p>
          ) : null}

          <VerifyPanel
            hasReceived={parsed.signatures.length > 0}
            ready={Boolean(bytes)}
            status={verification?.status ?? null}
            receivedEncoding={verification?.encoding ?? null}
            outputEncoding={encoding}
            strippedPrefix={parsed.prefix}
            byteCount={bytes?.length ?? 0}
            usesTimestamp={preset.usesTimestamp}
          />

          <p className="text-muted-foreground flex items-start gap-2 text-xs leading-relaxed">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            Runs in your browser with the Web Crypto API. Nothing is uploaded or
            stored: the payload and secret never leave this page.
          </p>
        </div>
      </div>
    </div>
  );
}

interface VerifyPanelProps {
  hasReceived: boolean;
  ready: boolean;
  status: 'match' | 'mismatch' | 'unreadable' | null;
  receivedEncoding: DigestEncoding | null;
  outputEncoding: DigestEncoding;
  strippedPrefix: string | null;
  byteCount: number;
  usesTimestamp: boolean;
}

function VerifyPanel({
  hasReceived,
  ready,
  status,
  receivedEncoding,
  outputEncoding,
  strippedPrefix,
  byteCount,
  usesTimestamp,
}: VerifyPanelProps) {
  let body: ReactNode;

  if (!hasReceived) {
    body = (
      <p className="text-muted-foreground text-sm">
        Paste a received signature to check it against the computed one.
      </p>
    );
  } else if (!ready || !status) {
    body = (
      <p className="text-muted-foreground text-sm">
        Enter the payload and secret to verify.
      </p>
    );
  } else if (status === 'match') {
    body = (
      <div className="flex gap-3">
        <CircleCheck
          className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400"
          aria-hidden
        />
        <div className="text-sm">
          <p className="text-foreground font-semibold">Signature matches</p>
          <p className="text-muted-foreground mt-1 leading-relaxed">
            Read as {receivedEncoding}
            {strippedPrefix ? `, after removing ${strippedPrefix}` : ''}. This
            payload and secret produce the signature you received.
          </p>
        </div>
      </div>
    );
  } else if (status === 'mismatch') {
    body = (
      <div className="flex gap-3">
        <CircleX className="mt-0.5 h-5 w-5 shrink-0 text-red-400" aria-hidden />
        <div className="text-sm">
          <p className="text-foreground font-semibold">
            Signature does not match
          </p>
          <p className="text-muted-foreground mt-1 leading-relaxed">
            The received value is valid {receivedEncoding}
            {receivedEncoding !== outputEncoding
              ? ' (the tool compares decoded bytes, so the output setting does not matter)'
              : ''}
            , but it was made from different bytes or a different key. Usual
            causes:
          </p>
          <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 leading-relaxed">
            <li>
              The payload was re-serialized (pretty-printed, keys reordered)
              instead of copied raw.
            </li>
            <li>
              A trailing newline was added or lost. This box stores line breaks
              as \n, so a body sent with \r\n will not match.
            </li>
            <li>Wrong secret, or one from another environment.</li>
            {usesTimestamp ? (
              <li>The t= timestamp is missing or from another delivery.</li>
            ) : null}
          </ul>
        </div>
      </div>
    );
  } else {
    body = (
      <div className="flex gap-3">
        <TriangleAlert
          className="text-foreground mt-0.5 h-5 w-5 shrink-0"
          aria-hidden
        />
        <p className="text-muted-foreground text-sm leading-relaxed">
          <span className="text-foreground font-semibold">
            Could not read the received value.
          </span>{' '}
          Expected a {byteCount}-byte digest as hex ({byteCount * 2} characters)
          or base64. Check the algorithm and that you copied the whole value.
        </p>
      </div>
    );
  }

  return (
    <section
      aria-label="Verification result"
      aria-live="polite"
      className={cn(
        'rounded-md border p-4',
        status === 'match' && hasReceived && ready
          ? 'border-emerald-500/40 bg-emerald-500/5'
          : 'border-border',
        status === 'mismatch' && hasReceived && ready
          ? 'border-red-500/40 bg-red-500/5'
          : ''
      )}
    >
      {body}
      <p className="text-muted-foreground border-border mt-3 border-t pt-3 text-xs leading-relaxed">
        On your server, compare with a constant-time function such as{' '}
        <code className="text-foreground font-mono">
          crypto.timingSafeEqual
        </code>{' '}
        (Node.js) or{' '}
        <code className="text-foreground font-mono">hmac.compare_digest</code>{' '}
        (Python), never with ==.
      </p>
    </section>
  );
}
