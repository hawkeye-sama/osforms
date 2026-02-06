# osforms Project Memory

## Project Directory Rule

**CRITICAL**: Always work within the project directory (`w:\Personal\free-form\`).

**Never create project files in**:
- ❌ Global Claude directory (`C:\Users\Pc\.claude\...`)
- ❌ User home directory
- ❌ Any directory outside the project root

**Always create project files in**:
- ✅ Project root: `w:\Personal\free-form\`
- ✅ Documentation: `w:\Personal\free-form\.claude\`
- ✅ Source code: `w:\Personal\free-form\src\`
- ✅ Components: `w:\Personal\free-form\src\components\`

**Why**: Project files must be version-controlled and accessible to the team.

---

## CLAUDE.md Sync Rule

**CRITICAL**: Keep `CLAUDE.md` synchronized with actual implementation.

### When to Update CLAUDE.md

Update CLAUDE.md whenever:

1. **Architecture changes**:
   - Switching from sync to async execution
   - Adding background job processing
   - Changing auth flow or JWT handling
   - Modifying submission flow

2. **New features added**:
   - New integration types (EMAIL, WEBHOOK, GOOGLE_SHEETS, etc.)
   - New database models (Notification, EmailVerification, etc.)
   - New API endpoints
   - New environment variables

3. **Tech stack changes**:
   - Adding new dependencies (@vercel/functions, googleapis, etc.)
   - Removing libraries
   - Changing frameworks or core technologies

4. **Security or data handling changes**:
   - Encryption methods
   - Rate limiting logic
   - CORS handling
   - Monthly submission limits

### How to Sync CLAUDE.md

**Process**:
1. When adding significant features, immediately update CLAUDE.md
2. Use the Explore agent periodically to scan for drift:
   ```
   "Scan codebase for implementation details that differ from CLAUDE.md"
   ```
3. Update outdated sections with actual implementation
4. Keep examples and code snippets accurate

### Current State (Last Synced: 2026-02-07)

**Recent Updates Made**:
- ✅ Updated submission flow to show async `waitUntil()` execution
- ✅ Added background execution section with Vercel limits
- ✅ Documented email verification flow with OTP
- ✅ Added new models: Notification, EmailVerification
- ✅ Expanded API endpoints (20+ new endpoints)
- ✅ Added OAuth environment variables
- ✅ Documented Google Sheets auto-column detection
- ✅ Added webhook HMAC signing details
- ✅ Documented monthly submission limits
- ✅ Updated "Adding a New Integration" with test endpoint pattern

**Known Gaps** (not yet documented):
- User API key system (`ff_live_xxxx`) mentioned but not implemented in code
- Export submissions endpoint exists but format unclear
- Billing/payment integration not implemented (only submission counting)

### Quick Reference

**Key Implementation Patterns**:
- Integrations: Async via `waitUntil()`, parallel with `Promise.allSettled()`
- Failures: Dual-channel notifications (in-app + email)
- Timeouts: 30s webhooks, 10s waitUntil limit (Hobby), 60s (Pro)
- Monthly limits: Lazy reset, UTC-based month detection
- Auth: OTP verification → JWT (7-day expiry) → httpOnly cookie
