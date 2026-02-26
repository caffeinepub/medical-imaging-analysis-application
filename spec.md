# Specification

## Summary
**Goal:** Fix the missing API Configuration dialog in MediScan AI so admin users can input and save their AI service endpoint URL and API key.

**Planned changes:**
- Add an "API Config" button in the Header component, visible only to admin users after login
- Clicking the button opens an ApiConfigDialog modal with a semi-transparent backdrop, centered white rounded dialog (~500px wide)
- Dialog includes a bold "API Configuration" title, an "API Endpoint URL" text input, an "API Key" password input (masked), a gray outlined "Cancel" button, and a solid blue "Save" button
- Pre-fill dialog fields with existing values loaded from the backend
- Add inline validation on the endpoint URL field before saving
- Ensure the backend exposes a query to retrieve the current ExternalApiConfig (endpoint URL + API key) and an admin-only update function to save it
- Fix the migration module to correctly map old separate apiEndpoint/apiKey fields into the combined ExternalApiConfig record

**User-visible outcome:** Admin users see an "API Config" button in the header, can open the configuration dialog, enter or update their AI service endpoint URL and API key, and save them — enabling CT scan analysis reports to be generated.
