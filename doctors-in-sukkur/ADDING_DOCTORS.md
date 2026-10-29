# Sukkur Healthcare Discovery Hub — Publishing Guide

Public URL: https://hospitalpro.online/doctors-in-sukkur/
Source: `doctors-in-sukkur/index.html`
Homepage: `index.html` (featured doctors and city links)

## Current baseline (30 October 2026)
- 16 selected Sukkur doctor entries across 12 specialties (including Dr. Riaz Hussain Hakro under Pulmonology).
- Doctor cards are **static HTML**, so Google/Bing can read names and profile links without executing JavaScript.
- Browser search and specialty filters work on the static cards using `data-specialty` and `data-search`.
- Structured data describes a `CollectionPage`, `BreadcrumbList` and `ItemList`.
- This directory is **not a rating, ranking or complete staff register**. Do not invent star ratings or use "No. 1" claims.
- **Do not list Ghotki/Gambat-only OPDs as Sukkur clinics**. Use the correct city guide instead.

- **Dr. Riaz Hussain Hakro — Pulmonology:** dedicated page `dr-riaz-hussain-hakro.html`, Hira Medical Center Sukkur; original Slashcure source: https://slashcure.com/pulmonologists/sukkur/dr-riaz-hussain-hakro

## Workflow to add a Sukkur doctor
1. Confirm the doctor's full name, qualifications, designation, specialty, hospital / clinic, city, OPD schedule and reliable contact/profile URL using an approved source. If the current schedule or clinic cannot be confirmed, explicitly say "Confirm current OPD schedule" instead of guessing.
2. For a dedicated HospitalPro page, create `dr-<slug>.html` with a clear H1, meta title/description, canonical, responsive design, schema as appropriate, and a link to the **exact** Slashcure doctor profile. A dedicated page is optional only when none exists yet.
3. In this city's HTML, add one new `<article class="doctor-card">...` within `<div class="doctors" id="cards">...` and set:
   - `data-specialty` to **exactly** the filter option value;
   - `data-search` to a lower-case string containing name, specialty, hospital, qualifications and common search terms;
   - name, role, qualifications, clinic, OPD details, a short factual specialty description, and a correct link.
4. Ensure the specialty exists in the `<select id="specialty">...` options and quick-filter chips; if it is new, add both. Do not create a second spelling/duplicate category.
5. Update static listing counts (hero stats and initial result text) and any relevant specialty tile counts/links. Check every count rather than hardcoding an unverified total.
6. Update the JSON-LD `ItemList` in the page head: append a `ListItem` using exactly the displayed professional name, truthful role and canonical doctor profile URL (if one exists). Change `numberOfItems` and ensure each `position` is sequential. **ItemList position is display order, not a quality ranking**.
7. If relevant, update FAQ examples, but avoid claiming that selected doctors are the only or best specialists in Sukkur. Do not add clinical ratings without genuine, defensible data.
8. Update homepage `index.html`: its Find Doctors data, relevant specialty tile, and the Sukkur promotional feature if appropriate. Add other internal links where meaningful.
9. Add newly created HospitalPro profile URLs to `sitemap.xml`. Update the Sukkur directory's `<lastmod>` when substantive changes are published. Keep its canonical at `https://hospitalpro.online/doctors-in-sukkur/`, including when filters use URL query parameters.
10. Commit to GitHub `main`, then verify the committed files. Independently check the public GitHub Pages deployment and mobile layout; **a GitHub commit alone does not prove the updated page is live**.

## Quality checks
- Exactly one H1; meaningful headings and a helpful intro, not keyword stuffing.
- Every doctor card visible in the original HTML before JavaScript.
- Search by name, common spelling, hospital and specialty works.
- `?specialty=Gynecology%20%26%20Obstetrics#directory` correctly filters the city directory.
- Empty results and reset work; keyboard-accessible buttons have correct `aria-pressed`.
- All internal paths resolve, Slashcure links are correct, and no blank or generic homepage links are described as direct doctor profiles.
- JSON-LD parses as JSON and reflects only visibly displayed entries.
- Do not make up clinical outcomes, ratings, review counts, hospital bed availability or medical credentials.
- Check desktop/mobile, especially names, overflow, card actions and tap targets.

## SEO positioning
Use the natural phrase **"Find doctors in Sukkur"**, provide specialty-specific, accurate local information and answer real patient questions. "Best doctor" may be explained as **best fit for a patient's needs**, but the page must not present unverified rankings. Prioritize accurate information and regular corrections over multiplying near-duplicate keyword pages.
