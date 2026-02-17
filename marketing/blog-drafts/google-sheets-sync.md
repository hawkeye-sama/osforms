# OSForms Deep-Dive: Real-time Google Sheets Sync (The No-DB Lead Collector)

Sometimes, you don't want a dashboard. You just want a spreadsheet where you can filter leads, share them with a team, or run a quick pivot table.

**OSForms allows you to sync form submissions to Google Sheets in real-time, automatically creating headers for you as your form evolves.**

### The Magic: Automatic Schema Mapping
One of the most powerful things about the OSForms Google Sheets integration is that **it doesn't care if you change your form fields.** 

If you add a "Phone Number" field to your form tomorrow, OSForms will:
1.  Detect that "Phone Number" is missing from your sheet.
2.  Update the header row to include it.
3.  Append the data in the correct column.

No manual sheet editing required.

---

### Setup Guide

#### 1. The Google Integration
In the OSForms dashboard, click **Connect Google**. This uses OAuth to securely link your account so OSForms can write to your sheets.

#### 2. Create your Integration
*   **Spreadsheet ID:** The long string in your Google Sheet URL (between `/d/` and `/edit`).
*   **Sheet Name:** Usually `Sheet1`.

#### 3. Active Mapping
Link this integration to your form in the **Form Settings**.

### Behind the Scenes: How it Works
When a submission hits the OSForms API:
1.  We fetch the current OAuth2 credentials.
2.  We check the existing headers in your sheet.
3.  We map your incoming `JSON` data to the column positions.
4.  We append a new row with a **Submission ID** and **Timestamp** for easy tracking.

### Use Cases:
-   **Waitlists:** Collect emails and interest levels without building a backend.
-   **Surveys:** Real-time data collection that your non-technical team members can view.
-   **Inventory Tracking:** Use a simple form to update a central sheet.

**Own your data. No proprietary dashboards. Just you and your Sheets.**
