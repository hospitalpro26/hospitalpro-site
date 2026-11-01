# HospitalPro Studio — administrator guide

**Admin URL:** https://hospitalpro.online/admin/  
**Source:** `hospitalpro26/hospitalpro-site`, branch `main`  
**Type:** GitHub Pages static administration application, no server or paid hosting required.

## Sign in

1. Open GitHub [fine-grained personal access tokens](https://github.com/settings/personal-access-tokens/new) while signed in to the **GitHub account with write permission** for the HospitalPro repository.
2. Give the token a short expiration date and select **Only select repositories → hospitalpro26/hospitalpro-site**.
3. Under Repository permissions select **Contents → Read and write**. Leave unrelated permissions as **No access**.
4. Generate the token and paste it into the HospitalPro Studio sign-in form. **Never paste this token into email, chat, or a public website discussion**. Do not share screenshots showing the token.
5. Use the **Lock dashboard** button when finished. A page refresh also clears the token.

The token is sent **directly from your browser to api.github.com** over HTTPS for API requests. It is only held in running JavaScript memory; it is not written to browser local storage, cookies, GitHub source files, or URLs. The login page itself is publicly reachable, but publishing is only available to GitHub users authorized to modify the repository. This is a first-stage editor, **not a full role-based authentication backend**. For multi-user administration, move authentication to a trusted OAuth server/Cloudflare Worker or use a supported managed CMS.

## Available features

- **Overview:** current numbers of doctors, hospitals, and HTML pages.
- **Doctors:** add or edit `assets/doctors-registry.json` listings: name, city, specialty, clinic, qualifications, HospitalPro URL and Slashcure URL.
- **Hospitals:** add or edit `assets/hospitals-registry.json`: public description, city, category, website and related page paths.
- **Pages & SEO:** open a live repository HTML file, edit SEO title, descriptions, and simple H1 headings; advanced mode can edit full HTML source with a scripts-disabled preview.
- **Media:** upload consented public JPG, PNG, WebP, or GIF images up to 1.5 MB to `assets/uploads/`.

Every save creates a GitHub commit on `main`, preserving version history for rollbacks. The existing `.github/workflows/sync-discovery.yml` automatically rebuilds **Find Doctors** and **Hospitals** from their JSON registries. GitHub Pages independently deploys the current branch. Check [GitHub Actions](https://github.com/hospitalpro26/hospitalpro-site/actions) for build results and verify the live website.

## Important editorial limitations

- Adding/updating the doctor **registry** does not automatically create or update a `dr-*.html` standalone doctor page, homepage featured section, individual city page, specialty chip, or FAQ. These other pages must be edited separately in the Pages & SEO editor, or through a future full publishing pipeline.
- A doctor registered in the HospitalPro registry is **not** automatically registered in Slashcure. Slashcure is a different application with its own backend and permissions.
- The dashboard is not a doctor-facing clinical system; it does not manage payments, video calls, verified appointments, patient messages, or private medical records.
- **Do not store patient information in this repository.** GitHub Pages and the registry files are public.
- Validate names, qualifications, hospital affiliation, OPD timing and third-party links before publishing. Do not describe published schedules as live unless independently confirmed.
- If GitHub returns a 409 conflict, reload after keeping a copy of your draft and repeat the changes rather than forcing an overwrite.
- Full HTML editing can break scripts or structured data; check the affected page and GitHub Actions after changes.

## Security maintenance

The studio deliberately has `noindex,nofollow`, a restrictive Content Security Policy, no third-party JavaScript, and only connects to `api.github.com` for authenticated operations. Tokens should be **short-lived, least-privileged, and revoked when unused**. The admin route is not a secret: its security depends on GitHub authorization, not obscurity. Once an OAuth-backed admin service is deployed, remove direct-token sign-in.
