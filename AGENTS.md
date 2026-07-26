# Project Run Notes

- Docker Compose is optional for content-only work such as adding a review.
- Do not start, rebuild, or assume Docker is running unless the user explicitly
  asks for a local preview or runtime verification.
- When a local site is requested, run it with Docker Compose, not a direct
  `npm run dev`.
- Use `docker compose up --build web` from the repository root for an
  interactive preview.
- Use `docker compose up --build -d web` only when the user wants the site to
  remain available after the agent finishes.
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

- For content-only review changes, do not run Docker unless the user asks for a
  local preview or runtime verification.
- For code, layout, or styling changes, prefer verification through Docker
  Compose from the repository root.
- When runtime verification is requested, prefer
  `docker compose exec -T web npm run build` for build, type, and Astro checks.
- When Docker verification is skipped or unavailable, perform the applicable
  static checks, say clearly that runtime verification was not run, and include
  the optional Docker command.
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

# Review Workflow

- For every new review, use the repository skill
  `.agents/skills/create-herring-review/SKILL.md` (`$create-herring-review`).
- Let the skill own intake, editorial structure, image preparation, content
  creation, and verification. Keep the root instructions focused on repository
  conventions rather than duplicating the full questionnaire here.
- For a narrow edit to an existing review, follow the current content schema and
  the general Docker verification rules above.
