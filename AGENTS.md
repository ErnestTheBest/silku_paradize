# Project Run Notes

- Assume the project is already running through Docker Compose.
- Run the local site with Docker Compose, not a direct `npm run dev`.
- Use `docker compose up --build web` from the repository root.
- Use `docker compose up --build -d web` when the site should remain available
  for the user to review after the agent finishes.
- The site is served at `http://localhost:4321/`.
- The Compose service sets `ASTRO_BASE=/` for local development and mounts the repo into `/app` for live reload.
- Do not try to start the site locally with npm. If the site needs to be restarted or rebuilt, use Docker Compose rather than a direct Node/Astro dev server.
- If Docker Compose cannot connect to the daemon on macOS, start Docker Desktop
  with `open -a Docker`, wait until `docker info` succeeds, and retry the
  Compose command.

# Repository Layout

- This is an Astro site.
- Pages live in `src/pages/`.
- Shared layouts live in `src/layouts/`.
- Reusable Astro components live in `src/components/`.
- Global styling lives in `src/styles/global.css`.
- Content collections and review markdown live under `src/content/`.
- Review images and other site assets live under `src/assets/`.
- Review image imports and rating helpers live under `src/data/`.

# Engineering Notes

- Keep changes scoped to the requested page, component, content entry, or asset.
- Follow the existing Astro component patterns before introducing new abstractions.
- Prefer existing helpers in `src/data/` for review ratings and image mapping.
- Keep public-facing copy in Latvian unless the user asks for another language.
- Review the final diff before handing work back, and mention any notable risk or follow-up.
- When updating this file, check it against the Codex best practices: https://developers.openai.com/codex/learn/best-practices

# Verification

- After code or content changes, verify through Docker Compose from the repository root.
- Prefer `docker compose exec -T web npm run build` for build, type, and Astro checks.
- If the web service is not running or a check cannot be run, say so clearly and include the command that should be run next.
- When the change is intended for visual review, verify that the relevant local
  URL responds successfully. If the in-app browser is available, open the
  changed page there and leave it visible for the user.

# Publishing Changes

- When the user asks to push review changes, review the final diff and commit
  only the intended files.
- Use exactly `review` as the commit message: `git commit -m "review"`.
- Do not add a commit body, comments, `Co-authored-by` trailers, or any mention
  that the changes were made by an agent.
- Push the current branch after the commit succeeds.

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
- After adding or changing a review:
  1. Run `docker compose up --build -d web` from the repository root so the
     local site remains available for the user.
  2. Run `docker compose exec -T web npm run build`.
  3. Verify `http://localhost:4321/` and the new or changed review URL.
  4. If the in-app browser is available, open the review URL in it.
  5. Leave the Compose service running and include the exact local review URL
     in the final response.
- Do not run the site with direct `npm run dev`.
