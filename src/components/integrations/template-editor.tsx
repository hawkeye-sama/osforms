'use client';

import Editor from '@monaco-editor/react';
import { RotateCcw } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DEFAULT_AUTO_REPLY_TEMPLATE } from '@/lib/validations';

const SAMPLE_DATA: Record<string, string> = {
  name: 'John Doe',
  email: 'john@example.com',
  message: 'Hello, I have a question about your services.',
  company: 'Acme Inc.',
  phone: '+1 234 567 8900',
};

interface TemplateEditorProps {
  template: string;
  subject: string;
  onTemplateChange: (template: string) => void;
}

export function TemplateEditor({
  template,
  subject,
  onTemplateChange,
}: TemplateEditorProps) {
  const [activeTab, setActiveTab] = useState<'html' | 'preview'>('html');

  const interpolatedHtml = interpolatePreview(template, SAMPLE_DATA);
  const interpolatedSubject = interpolatePreview(subject, SAMPLE_DATA);

  return (
    <div className="border-border flex h-full flex-col overflow-hidden rounded-lg border">
      <div className="border-border flex items-center justify-between border-b px-3 py-2">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'html' | 'preview')}
        >
          <TabsList className="h-8">
            <TabsTrigger value="html" className="px-3 text-xs">
              HTML
            </TabsTrigger>
            <TabsTrigger value="preview" className="px-3 text-xs">
              Preview
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onTemplateChange(DEFAULT_AUTO_REPLY_TEMPLATE)}
          className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
        >
          <RotateCcw className="mr-1 h-3 w-3" />
          Reset
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'html' && (
          <Editor
            height="100%"
            defaultLanguage="html"
            value={template}
            onChange={(value) => onTemplateChange(value || '')}
            theme="vs-light"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'off',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              folding: false,
              renderLineHighlight: 'none',
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              scrollbar: {
                vertical: 'auto',
                horizontal: 'hidden',
              },
              padding: { top: 16, bottom: 16 },
            }}
          />
        )}

        {activeTab === 'preview' && (
          <div className="flex h-full flex-col">
            {/* Email Header */}
            <div className="bg-card border-border space-y-1 border-b px-4 py-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground w-14">Subject:</span>
                <span className="text-foreground font-medium">
                  {interpolatedSubject}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground w-14">To:</span>
                <span className="text-foreground">{SAMPLE_DATA.email}</span>
              </div>
            </div>
            {/* Email Body */}
            <div
              className="flex-1 overflow-auto bg-white p-4"
              dangerouslySetInnerHTML={{ __html: interpolatedHtml }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-muted/30 border-border border-t px-3 py-2">
        <p className="text-muted-foreground text-center text-xs">
          {activeTab === 'preview'
            ? 'Preview uses sample data'
            : 'Use {{name}}, {{email}}, {{formName}}, {{#if field}}...{{/if}}'}
        </p>
      </div>
    </div>
  );
}

function interpolatePreview(
  template: string,
  data: Record<string, string>
): string {
  let result = template;

  // Form metadata
  result = result.replace(/\{\{formName\}\}/g, 'Contact Form');
  result = result.replace(/\{\{submittedAt\}\}/g, new Date().toISOString());
  result = result.replace(/\{\{submissionId\}\}/g, 'preview_123');

  // Data fields
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{${escapeRegex(key)}\\}\\}`, 'g');
    result = result.replace(regex, escapeHtml(value));
  }

  // Simple conditionals: {{#if fieldName}}...{{/if}}
  result = result.replace(
    /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, field, content) => {
      return data[field] ? content : '';
    }
  );

  // Clean unmatched variables
  result = result.replace(/\{\{[^}]+\}\}/g, '');

  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
