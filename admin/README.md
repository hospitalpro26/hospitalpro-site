# HospitalPro Admin Dashboard — staging foundation

**Branch:** \`feature/hospitalpro-admin-dashboard\`  
**Live website:** \`main\` on GitHub Pages / hospitalpro.online  
**Status:** Development-only dashboard prototype, NOT authenticated or connected to live publishing.

## Why this is separate
The user wants the public HospitalPro design to remain exactly as it is. This branch contains new files only:

- \`admin/index.html\` — responsive administrative interface
- \`admin/app.js\` — editing, searching, adding/deleting drafts, local saving, JSON import/export
- \`cms/site-content.json\` — approved Slashcure quotation and the existing ten homepage FAQs, used to seed the prototype

The public homepage, the Sukkur directory and their advertisements are untouched. GitHub Pages publishes \`main\`, not this feature branch.

## What currently works
- Navigate Dashboard / Doctors / Hospitals / Advertisements / Homepage Content / FAQs / Publishing Setup
- Create, edit, search, and remove draft doctor, hospital, advertisement and FAQ records
- Edit the approved Slashcure quote, tagline, and About text
- Store these drafts *only in the current browser* using localStorage
- Import/export a \`hospitalpro-admin-drafts.json\` backup (schemaVersion 1)

**No changes made in this prototype will appear on hospitalpro.online.** Do not treat localStorage as an authoritative database or as multi-device persistence.

## What deliberately does NOT work yet
- Login and authorization
- Direct edits to GitHub
- Live publication, real analytics or schedule synchronization
- Initial population of doctor/hospital drafts from the current site's legacy inline JavaScript arrays
- Uploading doctor pictures/logos
- Scheduled promotions or advertiser billing
- Access to Slashcure private data

Do **not** add a password to the HTML or put a GitHub token in browser JavaScript. Simply hiding a link to /admin on a public GitHub Pages site is not security.

## Next implementation steps

1. **Content migration with parity tests.** Extract all current public doctor/hospital data from existing \`index.html\`, plus the Sukkur directory, into structured source files. Preserve original HTML appearance and SEO-visible text. Add an automated static build step that turns the data into the existing layouts and minimizes CSS/JS changes. Avoid duplicating or inventing doctor OPD schedules; Slashcure remains the authoritative source when a verified integration becomes available.
2. **Real media management.** Save images/logos in the repository or managed storage, apply resizing and size limits, and keep previous assets.
3. **Real authentication.** Use a dedicated hosting layer (for example Cloudflare Pages + Cloudflare Access) to restrict dashboard access. Consider per-role permissions. Restrict allowed user identities.
4. **Server-side publishing.** Build a Cloudflare Worker API (or comparable protected service). It validates identity, input, allowed file paths, change size, and CSRF/session controls, then writes limited content through a GitHub App or least-privileged fine-grained credential held in server-side secrets. Never expose a GitHub token in client code.
5. **Review, preview and rollback.** First commit changes to a staging branch; run checks and visual regression tests; after approval, merge a reviewed release into \`main\`. Keep an audit trail of who changed content and provide rollback.
6. **Go-live.** Only after security and integration tests pass, deploy an admin hostname (for example \`admin.hospitalpro.online\`) behind login. Do not expose draft tooling to untrusted writers.

## Current data format
\`cms/site-content.json\` uses:
\`\`\`json
{
  "schemaVersion": 1,
  "site": {"quote": "...", "tagline": "...", "about": "..."},
  "doctors": [],
  "hospitals": [],
  "promotions": [],
  "faqs": [{"id":"homepage-faq-01","question":"...","answer":"..."}]
}
\`\`\`

Draft doctor fields: \`name\`, \`specialty\`, \`location\`, \`schedule\`, \`profileUrl\`, \`notes\`.  
Draft hospital fields: \`name\`, \`city\`, \`summary\`, \`profileUrl\`, \`notes\`.  
Draft promotion fields: \`name\`, \`placement\`, \`summary\`, \`profileUrl\`.

This is a **scaffold**, not the final production content schema. Before content migration, model clinic relationships separately so schedules for doctors at multiple locations are not conflated. Use timestamps and attribution for updates where possible.

## Important security and healthcare considerations
HospitalPro is an advertising directory. The dashboard should hold only information intended for public listings and business administration. Do not store patient records, medical consultations, passwords, secret keys or PHI in this repository or local drafts. Correct live OPD changes on Slashcure directly until synchronization is reliable. Mark advertised schedules as subject to confirmation.

## Preview
GitHub file browser: \`admin/index.html\` on this feature branch. For interactive preview, check out the branch and serve it with any local static server (the seeded FAQ JSON is loaded over HTTP). There is intentionally no production dashboard URL yet.
