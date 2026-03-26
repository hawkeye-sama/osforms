'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

interface CodeSnippetsProps {
  endpointUrl: string;
  slug: string;
}

export function CodeSnippets({ endpointUrl, slug }: CodeSnippetsProps) {
  const [copied, setCopied] = useState('');
  const [activeTab, setActiveTab] = useState('@osforms/react');

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  // ── Snippets ──────────────────────────────────────────────────────────────

  const osformsReact = `// 1. Install
npm install @osforms/react

// 2. Drop into your app — that's it
import { OSForm } from '@osforms/react'

export default function ContactPage() {
  return <OSForm formId="${slug}" />
}

// Optional: override mode or theme
<OSForm
  formId="${slug}"
  mode="classic"
  theme={{ colors: { primary: '#6366f1' } }}
  onComplete={() => router.push('/thanks')}
/>

// Optional: define schema in code (no Builder needed)
<OSForm
  schema={mySchema}
  endpoint="${endpointUrl}"
/>`;

  const embedScript = `<!-- Webflow / WordPress / any HTML site -->

<!-- 1. Paste where you want the form to appear -->
<div id="osform-root"></div>

<!-- 2. Add before </body> — set data-source to track the platform -->
<script
  src="https://cdn.osforms.dev/embed.js"
  data-form="${slug}"
  data-source="webflow"
></script>

<!-- WordPress shortcode (coming soon) -->
[osforms id="${slug}"]`;

  const htmlBasic = `<form action="${endpointUrl}" method="POST">
  <input type="email" placeholder="Email" name="email" />
  <input type="text" placeholder="Subject" name="subject" />
  <textarea name="message" placeholder="Message"></textarea>

  <!-- honeypot — keep hidden -->
  <input type="text" name="_gotcha" style="display:none" />

  <button type="submit">Send Message</button>
</form>`;

  const reactNext = `// Headless — build your own UI, submit to osforms
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()
  const formData = new FormData(e.currentTarget)

  const res = await fetch("${endpointUrl}", {
    method: "POST",
    body: formData,
  })

  if (res.ok) {
    // handle success
  }
}

return (
  <form onSubmit={handleSubmit}>
    <input type="email" name="email" placeholder="Email" required />
    <input type="text" name="subject" placeholder="Subject" />
    <textarea name="message" placeholder="Your message" />
    <button type="submit">Send</button>
  </form>
)`;

  const curlExample = `curl -X POST ${endpointUrl} \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "name": "Jane Smith",
    "message": "Hello from cURL"
  }'`;

  const tabs = [
    { key: '@osforms/react', label: '@osforms/react', code: osformsReact, badge: 'Recommended' },
    { key: 'embed', label: 'Embed', code: embedScript },
    { key: 'html', label: 'HTML', code: htmlBasic },
    { key: 'react', label: 'React (headless)', code: reactNext },
    { key: 'curl', label: 'cURL', code: curlExample },
  ];

  const activeCode = tabs.find((t) => t.key === activeTab)?.code ?? htmlBasic;

  return (
    <div className="space-y-4">
      {/* Tab buttons */}
      <div className="border-border flex flex-wrap gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.badge && (
              <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                {tab.badge}
              </span>
            )}
            {activeTab === tab.key && (
              <span className="bg-foreground absolute right-0 bottom-0 left-0 h-0.5" />
            )}
          </button>
        ))}
      </div>

      {/* Contextual description */}
      {activeTab === '@osforms/react' && (
        <p className="text-muted-foreground text-sm">
          Install the React package and drop in one component. It fetches your form schema
          from the Builder tab and renders a beautiful conversational or classic form UI.
        </p>
      )}
      {activeTab === 'embed' && (
        <p className="text-muted-foreground text-sm">
          Paste two lines of HTML into any site — Webflow, WordPress, or plain HTML.
          The embed script renders your Builder schema and submits to your endpoint.
        </p>
      )}
      {activeTab === 'html' && (
        <p className="text-muted-foreground text-sm">
          Point a standard HTML form at your endpoint. Works with any HTML site — no JavaScript required.
        </p>
      )}
      {activeTab === 'react' && (
        <p className="text-muted-foreground text-sm">
          Build your own form UI and submit to your osforms endpoint. Full control over every input and style.
        </p>
      )}

      {/* Code block */}
      <div className="border-border relative overflow-hidden rounded-lg border bg-[#1a1a2e]">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary absolute top-3 right-3 z-10 h-8 text-xs"
          onClick={() => copyText(activeCode, activeTab)}
        >
          {copied === activeTab ? (
            <>
              <Check className="mr-1.5 h-3.5 w-3.5" /> Copied
            </>
          ) : (
            <>
              <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
            </>
          )}
        </Button>
        <pre className="overflow-x-auto p-4 pr-24 font-mono text-sm leading-relaxed">
          <code className="text-[#e0e0e0]">
            {activeCode.split('\n').map((line, i) => (
              <span key={i} className="block">
                {highlightSyntax(line)}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

// Simple syntax highlighting
function highlightSyntax(line: string): React.ReactNode {
  // Comments (// and <!-- and #)
  if (
    line.trim().startsWith('//') ||
    line.trim().startsWith('<!--') ||
    line.trim().startsWith('#')
  ) {
    return <span className="text-[#6a9955]">{line}</span>;
  }

  const htmlTagRegex = /(<\/?[\w-]+)|(\s[\w-]+)(?==)|(".*?")|(\{.*?\})/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  const tempLine = line;
  while ((match = htmlTagRegex.exec(tempLine)) !== null) {
    if (match.index > lastIndex) {
      parts.push(tempLine.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push(<span key={match.index} className="text-[#569cd6]">{match[1]}</span>);
    } else if (match[2]) {
      parts.push(<span key={match.index} className="text-[#9cdcfe]">{match[2]}</span>);
    } else if (match[3]) {
      parts.push(<span key={match.index} className="text-[#ce9178]">{match[3]}</span>);
    } else if (match[4]) {
      parts.push(<span key={match.index} className="text-[#dcdcaa]">{match[4]}</span>);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts.length > 0 ? parts : line;
}
