# Show HN: OSForms – The open-source, BYOK form backend

Hey HN, 

I’m Bahroze, and I got tired of the "SaaS Tax" on form backends. 

We’ve all been there: you build a simple contact form, and suddenly you’re paying $20/month just to get an email without a "Powered by" logo or to handle more than 50 submissions. For a simple POST request and an email trigger, that felt broken.

So I built **OSForms**. 

It’s a headless, MIT-licensed form backend based on a "Bring Your Own Keys" (BYOK) philosophy. Instead of being a middleman for your data and email, OSForms is the pipe that connects your form to your own infrastructure.

**How it works:**
-   **Resend Integration:** Connect your own Resend key for professional-grade notifications with $0 markup.
-   **Google Sheets:** Sync submissions directly to your spreadsheets in real-time (it even auto-updates headers as your form fields change).
-   **Data Sovereignty:** You own your submissions. No vendor lock-in.
-   **Self-hostable:** Run it on Vercel or Railway in 60 seconds.

**The Vision:**
We are building the features developers actually want—Honeypots, Webhooks, and (soon) unlimited file uploads via your own Google Drive—without the arbitrary "feature taxes" of commercial alternatives.

I’m currently in alpha and would love for you to break it, star it, or contribute to the roadmap.

**GitHub:** https://github.com/hawkeye-sama/osforms
**Live:** https://osforms.com

Happy to answer any questions about the architecture or the BYOK model!
