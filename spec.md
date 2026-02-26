# Specification

## Summary
**Goal:** Restore the API configuration feature from version 2 into the current codebase, while preserving the footer changes from version 3.

**Planned changes:**
- Add backend functions to save and retrieve an external AI API endpoint URL and API key, restricted to admin-role users only.
- Add an `ApiConfigDialog` modal component with fields for the API endpoint URL and a password-masked API key input, including form validation.
- Add an "API Config" button in the Header that is visible only to admin users and opens the `ApiConfigDialog`.
- Ensure the Footer displays only the medical disclaimer text with no "Made with Caffeine AI" attribution.

**User-visible outcome:** Admin users see an "API Config" button in the header that opens a dialog to view and save the external AI API endpoint and key. Non-admin users have no access to this feature. The footer shows only the medical disclaimer.
