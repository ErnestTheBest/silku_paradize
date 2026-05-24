# Project Run Notes

- Assume the project is already running through Docker Compose.
- Run the local site with Docker Compose, not a direct `npm run dev`.
- Use `docker compose up --build web` from the repository root.
- The site is served at `http://localhost:4321/`.
- The Compose service sets `ASTRO_BASE=/` for local development and mounts the repo into `/app` for live reload.
- Do not try to start the site locally with npm. If the site needs to be restarted or rebuilt, use Docker Compose rather than a direct Node/Astro dev server.

# Review Creation Workflow

- When the user asks to add a new review, first inspect the current review schema and examples if needed:
  - `src/content/config.ts`
  - `src/content/reviews/README.md`
  - existing files in `src/content/reviews/`
  - `src/data/reviewImages.ts`
- Treat the workflow as a short questionnaire. Ask for or confirm these fields before creating the review:
  - `title`
  - `brand`
  - `type`
  - `origin`
  - `date`
  - image source and desired asset filename
  - whether the image should be resized/cropped for the site
  - `coverAlt` only if it cannot be confidently written from the product title/photo
  - `excerpt`
  - final review language
  - `tags`
  - `pros`
  - `cons`
  - `taste.score` and `taste.note`
  - `salt.score` and `salt.note`
  - `texture.score` and `texture.note`
  - `oil.score` and `oil.note`
  - `priceQuality.score` and `priceQuality.note`
  - `verdict`
  - body copy or raw impressions to turn into the final review text
- If the user provides a product photo, extract obvious visible details from it, but ask for confirmation instead of guessing uncertain fields such as origin, price, or final verdict.
- Write `coverAlt` yourself from the product title and photo. Keep it concise and descriptive. Ask the user only if the image contents are unclear or they request specific wording.
- Reviews are Markdown files under `src/content/reviews/`. Use a short URL-friendly slug and matching filename, for example `brand-product-type.md`.
- Review images live under `src/assets/reviews/`. Prefer lowercase, hyphenated filenames. If adding a local asset, import it and add a matching key in `src/data/reviewImages.ts`.
- Existing review card assets are square. When preparing a supplied square product image, resize it to match the current review asset size unless the user requests a different crop.
- The visible rating is calculated from the five scored criteria. Do not add a separate rating field.
- Unless the user requests another language, write the final public review copy in Latvian.
- After adding or changing a review, verify through Docker Compose, for example `docker compose exec -T web npm run build`. Do not run the site with direct `npm run dev`.
