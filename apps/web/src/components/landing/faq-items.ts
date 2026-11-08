// Homepage FAQ. Shared by the landing page (rendered) and app/page.tsx
// (FAQPage JSON-LD), so the visible answers and the structured data can't drift.
export const HOME_FAQ: { question: string; answer: string }[] = [
  {
    question: 'What is OSForms?',
    answer:
      'OSForms is an open-source (MIT) form backend for HTML and React forms. Point a form at your OSForms endpoint and each submission is stored, then sent to your own Resend email, Google Sheets, or webhooks using your API keys.',
  },
  {
    question: 'Is it actually free?',
    answer:
      'Yes. The hosted version includes 100 submissions per month with every integration, because the integrations run on your own keys. OSForms is open source, so you can also self-host it with Docker.',
  },
  {
    question: 'How do I use my own Resend key?',
    answer:
      'Add an Email integration to a form and paste your Resend API key. Notification and auto-reply emails are then sent through your Resend account. The key is encrypted at rest with AES-256-GCM.',
  },
  {
    question: 'Can I export my data?',
    answer:
      'Yes. Export a form’s submissions as CSV from the dashboard, or read them with the read-only pull API using an osf_live_ API key. Submissions are kept until you delete them.',
  },
  {
    question: 'Do you support file uploads?',
    answer:
      'Files are not stored. Multipart forms are accepted, but each uploaded file is replaced with a placeholder like “[File: name, size bytes]” in the submission.',
  },
  {
    question: 'Is OSForms related to OS2Forms, Open Forms, or OpnForm?',
    answer:
      'No. OSForms (osforms.com) is a separate open-source project: a form backend that stores submissions and forwards them with your own API keys. OS2Forms, Open Forms, and OpnForm are unrelated form projects.',
  },
];
