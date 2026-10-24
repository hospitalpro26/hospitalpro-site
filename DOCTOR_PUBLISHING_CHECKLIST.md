# HospitalPro doctor publishing checklist

**Standing publishing rule:** When adding or changing a doctor, update all relevant HospitalPro locations together. Do not consider a profile published until all applicable links and filters are consistent.

1. **Individual profile** — Create or refresh the doctor's dedicated `dr-*.html` profile, including accurate qualifications, practice locations, clinic schedules, contact actions, professional services, original media where approved, and link to the exact Slashcure profile.
2. **Main landing page** (`index.html`) — Add/update the doctor in the **Find Doctors** data array and the featured section when appropriate. Ensure the photo, specialty category, clinic, timings, and profile links are correct.
3. **Main specialty browsing** — Add the specialty filter (e.g., `Urology`) if absent, and ensure it actually returns the doctor. Avoid duplicate or inconsistent category strings.
4. **Relevant city directory** — Add/update the full doctor card on the proper `doctors-in-<city>/` page with poster, hospital details, clinic schedule, HospitalPro page and Slashcure links.
5. **City specialty filter** — Add a filter chip and marquee label if the specialty is new. Confirm search, filtering and sorting still work.
6. **SEO and structured data** — Update descriptive copy, JSON-LD doctors array/counts, relevant FAQ answers and visible doctor/specialty counts, without making unsupported claims.
7. **Quality check** — Confirm cards, search and filters, responsive layout, original picture/QR functionality (when provided), clinic links, phone/WhatsApp actions, and that all internal pages use the correct route.
8. **Deploy** — Commit relevant files to the site's GitHub `main` branch, inspect commit results, and verify deployed site if possible. Distinguish a successful commit from confirmed live deployment.

**Special case:** Do not list out-of-city OPDs as if they operate within Sukkur City. Place those doctors in the correct city or clearly labeled nearby section.

**Doctor example (24 October 2026):** Dr. Naveed Ahmed Mahar belongs in `dr-naveed-ahmed-mahar.html`, homepage `DOCTORS` and Urology browsing, plus `doctors-in-sukkur/index.html` Urology filter and promotional listing. Slashcure reference: https://slashcure.com/urologists/sukkur/dr-naveed-ahmed-mahar
