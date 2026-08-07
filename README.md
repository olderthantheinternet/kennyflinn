# KennyFlynn.com Tribute Site

A responsive memorial website for Kenny Flynn, hosted on [GitHub Pages](https://github.com/olderthantheinternet/kennyflinn) and intended to resolve at [kennyflynn.com](https://kennyflynn.com) through Cloudflare DNS.

The visual system uses black, charcoal grey, midnight blue, medium blue, ivory, and warm tan.

## What is included

- Full-screen memorial hero
- Sticky desktop navigation and accessible mobile menu
- His Story, Legacy, Memories, Gallery, and Celebration sections
- Celebration of Life event card with directions, official event link, and downloadable calendar file
- Curated photo gallery loaded from `assets/gallery/manifest.json`
- Memory submission form via [Web3Forms](https://web3forms.com)
- Local draft recovery when the form endpoint is not connected
- Persistent “Light a Candle” interaction on each visitor’s device
- Open Graph social image, favicon, web app manifest, sitemap, robots file, privacy note, thank-you page, and custom 404 page
- Responsive layouts for desktop, tablet, and mobile
- Reduced-motion support and keyboard-visible focus states

## Deploy to GitHub Pages

This repo is a static site. No local build step is required. Pushes to `main` deploy through [GitHub Actions](.github/workflows/deploy-pages.yml).

1. Push to the `main` branch of `olderthantheinternet/kennyflinn`.
2. In GitHub: **Settings → Pages**, confirm **Source** is **GitHub Actions**.
3. Interim URL: `https://olderthantheinternet.github.io/kennyflinn/`
4. Under **Custom domain**, enter `kennyflynn.com` and save (the root [`CNAME`](CNAME) file already contains this).
5. After DNS validates and the certificate is issued, enable **Enforce HTTPS**.
6. Optionally set the repository homepage to `https://kennyflynn.com`.

## Connect Web3Forms

1. Create a free access key at [web3forms.com](https://web3forms.com) using the inbox that should receive memories.
2. Open [`content.js`](content.js) and replace `YOUR_WEB3FORMS_ACCESS_KEY` with your key.
3. Commit and push. Submit one test memory and confirm it arrives by email.
4. Privacy / correction requests on [`privacy.html`](privacy.html) use the same key.

Until a real key is present, the form keeps a local draft on the visitor’s device instead of sending email.

## Cloudflare DNS (when kennyflynn.com is added)

Add the domain to Cloudflare, then create these records. Keep proxy status **DNS only** (grey cloud) until GitHub finishes domain verification and HTTPS works.

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | `185.199.108.153` | DNS only |
| A | `@` | `185.199.109.153` | DNS only |
| A | `@` | `185.199.110.153` | DNS only |
| A | `@` | `185.199.111.153` | DNS only |
| AAAA | `@` | `2606:50c0:8000::153` | DNS only |
| AAAA | `@` | `2606:50c0:8001::153` | DNS only |
| AAAA | `@` | `2606:50c0:8002::153` | DNS only |
| AAAA | `@` | `2606:50c0:8003::153` | DNS only |
| CNAME | `www` | `olderthantheinternet.github.io` | DNS only |

Then:

1. In GitHub Pages, confirm `kennyflynn.com` shows as verified and a TLS certificate is issued.
2. Enable **Enforce HTTPS** in GitHub Pages.
3. In Cloudflare, add a **Redirect Rule**: `www.kennyflynn.com/*` → `https://kennyflynn.com/$1` (apex is canonical).
4. After HTTPS is stable, you may optionally enable Cloudflare proxy (orange cloud) with SSL/TLS mode **Full**. Prefer DNS only if you see certificate or redirect loops.

Point the domain’s nameservers to Cloudflare at your registrar if Cloudflare asks you to do so during onboarding.

## Editing the event details

Open [`content.js`](content.js) and edit:

- event date, time, venue, and address
- official Facebook event link
- map link
- calendar file link

The current prototype uses:

- Saturday, August 22, 2026
- 6:00 PM to 11:00 PM EDT
- Rose & Crown
- 1935 Powers Ferry Road SE, Atlanta, GA 30339

Confirm all event details on the official event page immediately before launch.

## Editing the copy

Most visible copy is in [`index.html`](index.html). Search for these section IDs:

- `story`
- `legacy`
- `memories`
- `celebration`

Biographical language was intentionally kept broad and respectful because a complete family-approved biography was not provided. Review every statement with Kenny’s family or memorial organizers before publishing.

## Replacing the hero photography

The current hero asset was cropped from the supplied design reference:

- `assets/hero-kenny.webp`
- `assets/hero-kenny.jpg`

For the final public site, replace those files with a high-resolution, family-approved photograph using the same filenames. Recommended source dimensions are at least 1600 × 2000 pixels in portrait orientation. Keep Kenny on the right side of the frame with negative space or a clean edge on the left.

Also replace `assets/og-kenny-flynn.jpg` with a family-approved 1200 × 630 social share image if needed.

## Memory moderation workflow

1. Receive submissions by email via Web3Forms.
2. Review each submission for permission, factual accuracy, privacy, and respectful language.
3. Contact the sender when clarification or photo rights are needed.
4. Publish approved memories manually in a future “Memory Wall” collection.
5. Honor correction or removal requests promptly.

The form does not publish entries automatically. That is intentional.

## Photo gallery workflow (email → assets)

Visitors do **not** upload files directly to GitHub. They email photos to the address in [`content.js`](content.js) (`galleryEmail`), or share a media link through the memory form. You review and publish approved images into the repo.

1. Receive the photo by email (or follow a media link from Web3Forms).
2. Confirm the sender grants permission to publish on KennyFlynn.com.
3. Compress/export the image (prefer JPEG or WebP, typically under **5 MB**; hard GitHub limit is **100 MB** per file).
4. Save it under [`assets/gallery/`](assets/gallery/) with a clear filename, e.g. `2024-club-esso-01.webp`.
5. Add an entry to [`assets/gallery/manifest.json`](assets/gallery/manifest.json):

```json
{
  "items": [
    {
      "src": "assets/gallery/2024-club-esso-01.webp",
      "alt": "Kenny with friends at Club Esso",
      "caption": "A night at Club Esso",
      "credit": "Photo courtesy of…"
    }
  ]
}
```

6. Commit and push to `main`. GitHub Pages redeploys automatically.

Guidance:

- Photos-first for v1. Prefer hosting longer videos on YouTube/Vimeo and linking them from a memory instead of storing large video files in git.
- Keep the gallery lean so Pages stays fast.
- Update `galleryEmail` in `content.js` if the public contribution inbox changes.
- Empty `items` shows an on-page empty state with the email CTA.

## Image and content rights

Use only photographs, video, music, quotes, and archival material that the site owner has permission to publish. Social media availability does not automatically grant website reuse rights.

## Local preview

Open `index.html` in a browser, or from this directory run:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.
