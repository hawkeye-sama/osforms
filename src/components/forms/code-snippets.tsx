"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeSnippetsProps {
  endpointUrl: string;
}

export function CodeSnippets({ endpointUrl }: CodeSnippetsProps) {
  const [copied, setCopied] = useState("");
  const [activeTab, setActiveTab] = useState("html");

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const htmlBasic = `<form action="${endpointUrl}" method="POST">
  <input type="email" placeholder="Email" name="email">
  <input type="text" placeholder="Subject" name="subject">
  <textarea name="message" placeholder="Type your message"></textarea>

  <!-- your other form fields go here -->

  <button type="submit">Send Message</button>
</form>`;

  const htmlFileUpload = `<form action="${endpointUrl}" method="POST" enctype="multipart/form-data">
  <input type="email" placeholder="Email" name="email">
  <input type="text" placeholder="Subject" name="subject">
  <textarea name="message" placeholder="Type your message"></textarea>

  <!-- File upload field -->
  <input type="file" name="attachment">

  <button type="submit">Send Message</button>
</form>`;

  const reactNext = `// React / Next.js example
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);

  const response = await fetch("${endpointUrl}", {
    method: "POST",
    body: formData,
  });

  if (response.ok) {
    // Handle success
    alert("Form submitted successfully!");
  }
}

// In your component:
<form onSubmit={handleSubmit}>
  <input type="email" name="email" placeholder="Email" required />
  <input type="text" name="subject" placeholder="Subject" />
  <textarea name="message" placeholder="Your message" />
  <button type="submit">Send</button>
</form>`;

  const tabs = [
    { key: "html", label: "HTML", code: htmlBasic },
    { key: "html-file", label: "HTML with file upload", code: htmlFileUpload },
    { key: "react", label: "React/NextJS", code: reactNext },
  ];

  const activeCode = tabs.find((t) => t.key === activeTab)?.code || htmlBasic;

  return (
    <div className="space-y-4">
      {/* Tab buttons */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === tab.key
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Code block */}
      <div className="relative rounded-lg border border-border bg-[#1a1a2e] overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 h-8 text-xs text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary"
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
        <pre className="p-4 pr-24 text-sm font-mono overflow-x-auto leading-relaxed">
          <code className="text-[#e0e0e0]">
            {activeCode.split("\n").map((line, i) => (
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
  // Comments
  if (line.trim().startsWith("//") || line.trim().startsWith("<!--")) {
    return <span className="text-[#6a9955]">{line}</span>;
  }

  // HTML tags and attributes
  const htmlTagRegex = /(<\/?[\w-]+)|(\s[\w-]+)(?==)|(".*?")|(\{.*?\})/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  const tempLine = line;
  while ((match = htmlTagRegex.exec(tempLine)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(tempLine.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // Tag name
      parts.push(
        <span key={match.index} className="text-[#569cd6]">
          {match[1]}
        </span>
      );
    } else if (match[2]) {
      // Attribute name
      parts.push(
        <span key={match.index} className="text-[#9cdcfe]">
          {match[2]}
        </span>
      );
    } else if (match[3]) {
      // String value
      parts.push(
        <span key={match.index} className="text-[#ce9178]">
          {match[3]}
        </span>
      );
    } else if (match[4]) {
      // JSX expression
      parts.push(
        <span key={match.index} className="text-[#dcdcaa]">
          {match[4]}
        </span>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts.length > 0 ? parts : line;
}
