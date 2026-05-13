# Project Run Notes

- Run the local site with Docker Compose, not a direct `npm run dev`.
- Use `docker compose up --build web` from the repository root.
- The site is served at `http://localhost:4321/`.
- The Compose service sets `ASTRO_BASE=/` for local development and mounts the repo into `/app` for live reload.
