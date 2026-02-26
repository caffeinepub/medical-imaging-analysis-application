# Specification

## Summary
**Goal:** Add an API Configuration modal dialog for admins to set and persist an external AI API endpoint URL and API key.

**Planned changes:**
- Add a modal dialog with a semi-transparent black overlay and a centered white dialog box (~500px wide) titled "API Configuration" in bold
- Include a labeled text input for "API Endpoint URL" and a labeled password input for "API Key" with character masking
- Add a "Cancel" button (gray outline) and a "Save" button (solid blue) with a loading/disabled state during save
- Show inline validation errors for empty or invalid fields
- Pre-fill previously saved values when the dialog is reopened
- Restrict dialog access to admin users only
- Ensure the backend correctly persists and returns the API endpoint URL and API key for pre-filling

**User-visible outcome:** Admin users can open the API Configuration dialog, enter or update the AI API endpoint URL and API key, save the configuration, and see pre-filled values when reopening the dialog.
