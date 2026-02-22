# Specification

## Summary
**Goal:** Add API configuration page with endpoint and API key settings to enable external AI service integration.

**Planned changes:**
- Add API key input field to ApiConfigDialog with password-style masking
- Extend backend to store and retrieve API key configuration with admin-only access control
- Update frontend hooks to handle API key in configuration queries and mutations
- Include configured API key in Authorization header when making requests to external AI service

**User-visible outcome:** Admin users can configure both the API endpoint URL and API key through the settings dialog, enabling the application to successfully analyze CT scans using the external AI service with proper authentication.
