# Project Run Notes

- Assume the project is already running through Docker Compose.
- Run the local site with Docker Compose, not a direct `npm run dev`.
- Use `docker compose up --build web` from the repository root.
- The site is served at `http://localhost:4321/`.
- The Compose service sets `ASTRO_BASE=/` for local development and mounts the repo into `/app` for live reload.
- Do not try to start the site locally with npm. If the site needs to be restarted or rebuilt, use Docker Compose rather than a direct Node/Astro dev server.
