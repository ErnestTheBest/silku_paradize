---
name: create-herring-review
description: Create and verify a new Silku Paradize herring product review from a local photo, a public iCloud Photos share link, and tasting notes. Use when the user asks to add, create, draft, or publish a new review in this repository, including when they provide an iCloud photo link as review input. Do not use for unrelated site changes or a narrow edit to an existing review.
---

# Create Herring Review

Create one complete, publishable review without making the user fill in YAML by
hand. Separate confirmed product facts from editorial text derived from those
facts, and never invent uncertain details.

## 1. Read the current contract

Before asking questions or changing files, inspect:

- `src/content/config.ts`
- `src/content/reviews/README.md`
- `src/data/reviewImages.ts`
- the two most recent reviews in `src/content/reviews/`

Treat the schema as the technical source of truth and the recent reviews as the
voice and formatting reference. If this skill conflicts with the current
schema, follow the schema and update this skill in the same change.

## 2. Build the review brief

Use the user's photo and notes to assemble three groups.

### Confirmed facts

Confirm or obtain:

- brand and product name/type
- origin as printed on the package or supplied by the user
- tasting/publication date
- image source
- desired image filename only when the user has a preference
- whether the supplied image may be square-cropped
- price paid when it should appear in the review
- final review language; default to Latvian

Read obvious package text from a clear photo. Do not infer origin, price,
ingredients, manufacturer claims, or other uncertain facts from appearance.

### Tasting judgment

Obtain raw impressions or confirm a proposed interpretation for:

- overall taste
- salt balance
- texture
- oil or marinade
- price-to-quality value
- whether the user would buy it again
- notable context such as what it was served with

Set `taste`, `salt`, `texture`, `oil`, and `priceQuality` scores from 1 to 5.
Prefer whole or half points. If the user gives impressions but no numbers,
propose all five scores together and ask for confirmation only when the mapping
is materially uncertain.

### Editorial fields

Derive these unless the user supplies exact wording:

- `title`
- `slug`
- `excerpt`
- `coverAlt`
- `tags`
- `pros`
- `cons`
- criterion notes
- `verdict`
- body copy

Do not make the user approve every derived string. Ask one compact batch of
questions containing only missing or genuinely uncertain items. If the supplied
information is already complete, state any harmless assumptions and proceed.
Never create a review containing placeholders.

## 3. Apply the editorial standard

Write public copy in Latvian unless the user asks for another language.

- Use a short ASCII lowercase slug with hyphens. Make the Markdown filename and
  `slug` identical.
- Write an excerpt as one concrete summary sentence.
- Use three to six useful tags and follow existing capitalization.
- Keep pros and cons specific, non-duplicative, and written as complete
  sentences. Use `[]` when there is no honest item for a list.
- Make every criterion note explain its score in one sentence.
- Make the verdict explicitly state whether the product is worth buying again.
- Write the body as three short paragraphs without headings:
  1. overall impression;
  2. taste, salt, texture, and oil/marinade details;
  3. value, serving context when relevant, and repurchase conclusion.
- Keep the excerpt, lists, scores, notes, verdict, and body mutually consistent.
- Describe subjective impressions as subjective. Do not turn a perceived flavor
  into an unsupported claim about ingredients or product safety.
- Do not add a separate `rating`; the site calculates it from the five scores.
- Omit `heroImage` unless a separate hero asset is intentionally supplied.

## 4. Prepare the image

### Import from iCloud Photos

When the user supplies a public `share.icloud.com/photos/...` link, treat the
link as authorization to retrieve the shared photo for this review. Run the
bundled downloader instead of manually reverse-engineering the page:

```text
node .agents/skills/create-herring-review/scripts/download-icloud-photo.cjs '<icloud-share-url>'
```

The script opens the JavaScript-only gallery in headless Chromium, completes
both Download actions, waits for the archive, extracts it to a unique temporary
directory, and prints JSON containing the original image paths and metadata.

- If sandbox policy requires escalation, make one scoped request for the whole
  script invocation. Prefer the reusable prefix
  `node .agents/skills/create-herring-review/scripts/download-icloud-photo.cjs`
  so later iCloud imports do not require repeated approvals.
- Do not probe the link through several separate network or browser commands
  before running the script.
- Never put the expiring iCloud share URL or its signed asset URL in
  `coverImage`; import the downloaded original as a local review asset.
- If the script reports an expired/private link or no supported image, state
  that exact blocker and ask for a fresh public link.

For a local product photo:

1. Preserve the package, label text, colors, and product details.
2. Produce an RGB 1200 × 1200 square image unless the user requests another
   treatment.
3. Strip EXIF, GPS, and other source metadata from the published asset.
4. Prefer `{slug}-square.jpg` and use `{slug}-square` as the image-map key.
5. Save the asset under `src/assets/reviews/`.
6. Add the import and key to `src/data/reviewImages.ts`.

Use a concise `coverAlt` that identifies the product and visible package. Do not
repeat "image of" or add details that are not visible.

For a direct image URL, keep the URL in `coverImage` and do not add an image-map
entry.

## 5. Create and review the entry

Create `src/content/reviews/{slug}.md` using the current template in
`src/content/reviews/README.md`.

Before running checks, review the entry for:

- required schema fields
- filename/slug equality
- a valid date and five scores in range
- a resolvable image key or URL
- natural Latvian and consistent terminology
- agreement between scores and prose
- no invented facts or unconfirmed price

Review the final diff and keep unrelated user changes untouched.

## 6. Choose the verification level

Do not start or rebuild Docker by default for a new review.

### Default: content-only verification

- Recheck the schema fields, filename/slug match, scores, image key, image
  dimensions, Latvian copy, and final diff.
- Run lightweight static checks that do not require starting the site.
- State clearly that Docker and Astro runtime verification were not run.
- Include the optional command the user can run later:

```text
docker compose up --build -d web
```

### On request: full local verification

Only when the user explicitly asks for a local preview, Docker build, or runtime
verification, run from the repository root:

```text
docker compose up --build -d web
docker compose exec -T web npm run build
```

Then verify successful responses for:

- `http://localhost:4321/`
- `http://localhost:4321/reviews/`
- `http://localhost:4321/reviews/{slug}/`

When the in-app browser is available, open the new review and visually inspect
the image, title wrapping, rating block, lists, and body. Leave the review URL
visible only when the user asked to keep the site running.

In the final response, summarize the files changed, the verification level, and
any unresolved assumption. Provide the exact local review URL only when the site
was actually started. Commit or push only when the user explicitly asks.
