# Reviews Content

This folder contains Markdown review entries for the `reviews` Astro content
collection. Each `.md` file becomes one review page and one card in the review
gallery.

## File Naming

Use a short, URL-friendly filename that matches the review slug:

```text
brand-product-type.md
```

Example:

```text
undine-7-adzika.md
```

## Frontmatter Template

```yaml
---
title: "Review title"
slug: "review-slug"
brand: "Brand"
type: "Product type"
origin: "Latvija"
date: 2026-05-25
excerpt: "Short summary shown on review cards."
coverImage: "image-key-or-url"
coverAlt: "Accessible description of the cover image"
heroImage: "optional-image-key-or-url"
tags:
  - Brand
  - Type
pros:
  - What worked well
cons:
  - What did not work well
evaluationCriteria:
  taste:
    score: 4
    note: "How tasty the herring is overall, and whether you want to keep eating it."
  salt:
    score: 3
    note: "Whether it is too salty, not salty enough, or balanced."
  texture:
    score: 4
    note: "Soft, firm, dry, falling apart, rubbery, or otherwise."
  oil:
    score: 3
    note: "Whether the oil or marinade is pleasant and does not overpower the fish."
  priceQuality:
    score: 4
    note: "Whether the product feels worth its price."
  verdict: "Would buy again / would skip / depends on mood."
---

Write the review body here.
```

## Rating Rules

Do not add a separate `rating` field. The visible review rating is calculated
automatically from the average of:

- `taste.score`
- `salt.score`
- `texture.score`
- `oil.score`
- `priceQuality.score`

Scores must be numbers from `1` to `5`. The calculated average is rounded to
one decimal place.

`verdict` is a written conclusion and is not included in the average.

## Images

`coverImage` and `heroImage` can use either:

- a key from `src/data/reviewImages.ts`
- a direct image URL

If `heroImage` is omitted, the page uses `coverImage` for the large review
image.

## Body Copy

Keep the frontmatter structured and use the Markdown body for the actual review
story: context, tasting notes, comparisons, and anything that should read like
normal prose.
