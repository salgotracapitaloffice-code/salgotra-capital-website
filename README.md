# Salgotra Capital website

The public website for Salgotra Capital: permanent capital for enduring businesses.

It's a static site built with [Astro](https://astro.build) and plain CSS. It has no backend. The contact form uses Netlify Forms.

## Pages

| Path | Page |
| --- | --- |
| `/` | Home |
| `/for-business-owners/` | For business owners |
| `/what-we-look-for/` | What we look for |
| `/about/` | About |
| `/contact/` | Contact (form) |
| `/contact/sent/` | Form confirmation, used only when the visitor has JavaScript turned off (not indexed) |
| `/privacy/` | Privacy policy |
| `/404` | Page not found |

`sitemap-index.xml` and `robots.txt` are generated at build time from the domain in the config file.

## Run locally

You need Node.js 22 or newer.

```bash
npm install
npm run dev        # http://localhost:4321, reloads as you edit
npm run build      # builds the static site into dist/
npm run preview    # serves dist/ at http://localhost:4321
```

The contact form only sends from the live Netlify site. Locally, pressing Send shows the "Sorry, that did not send" message. That's expected.

## Change the phone number, emails or domain

Everything lives in **`src/site.config.mjs`**:

```js
domain: 'https://salgotracapital.com',   // canonical URLs, sitemap, social previews
contacts: [ { name: 'Harman Salgotra', email: 'harman@salgotracapital.com' }, ... ],
privacyEmail: 'privacy@salgotracapital.com',
enquiryEmail: 'harman@salgotracapital.com',
PHONE: '',                                // leave empty to hide the phone line
form: { name: 'contact', endpoint: '/contact/', provider: 'netlify' },
```

- **Phone:** put the number in `PHONE`, for example `'+91 98765 43210'`. While it is empty, the phone line doesn't appear anywhere.
- **Emails:** edit `contacts` (shown on the Contact page), `privacyEmail` (used in the privacy policy) and `enquiryEmail` (used in the form's error message).
- **Privacy policy date:** change `LAST_UPDATED` at the top of `src/pages/privacy.astro`.

## Deploy to Netlify

1. Push this repository to GitHub.
2. In Netlify, choose **Add new site → Import an existing project → GitHub**, then pick `salgotra-capital-website`.
3. Netlify reads the build settings from `netlify.toml` (`npm run build`, publish folder `dist`). Click **Deploy**.
4. **Turn on the form:** go to **Site configuration → Forms** and click **Enable form detection**. Then trigger a new deploy (**Deploys → Trigger deploy**). Netlify will find the form called `contact`.
5. **Get email notifications:** go to **Forms → Form notifications → Add notification → Email notification**. Choose the `contact` form and enter `contact@salgotracapital.com`, then click the confirmation link Netlify sends to that inbox.
6. Send a test enquiry from the live site and check that it shows up under **Forms**.

Every push to `main` redeploys the site automatically.

The privacy policy is part of the same deploy as the form, so it's live before the form can receive anything. It's marked in the source as a draft for legal review. Have it reviewed before you announce the site.

### Spam protection

The form includes a hidden honeypot field (`bot-field`) that Netlify uses to discard bot submissions. Netlify's own spam filtering is on by default as well.

### Hosting somewhere other than Netlify

Create a form on [Formspree](https://formspree.io), then set `form.provider` to `'formspree'` and `form.endpoint` to its URL (`https://formspree.io/f/...`) in `src/site.config.mjs`. Deploy the `dist/` folder to any static host. Vercel, for example, detects Astro automatically.

## Connect salgotracapital.com

1. In Netlify, open **Domain management → Add a domain** and enter `salgotracapital.com`.
2. At your domain registrar, do one of the following:
   - **Simplest:** change the domain's nameservers to the four Netlify nameservers shown in Netlify (Netlify DNS).
   - **Or keep your current DNS:** add an `A` record for `@` pointing to `75.2.60.5`, and a `CNAME` record for `www` pointing to `<your-site-name>.netlify.app`.
3. Wait for DNS to update (anywhere from minutes to a few hours). Netlify then issues the free HTTPS certificate on its own.
4. In **Domain management**, set `salgotracapital.com` as the primary domain, so `www` and the `.netlify.app` address redirect to it.

If the domain ever changes, update `domain` in `src/site.config.mjs` and redeploy.

## Images

The originals are in `assets/source/` and are never changed:

| File | What it is |
| --- | --- |
| `logo.png` | Wordmark with the boxed "S" monogram |
| `palette.png` | Colour palette reference (it's actually a JPEG file, despite the `.png` name) |
| `elephant.jpg` | Sepia elephant close-up |
| `grain.jpg` | Hand-drawn growth-ring lines |

`npm run images` runs `scripts/build-images.mjs` (using sharp), which writes every derivative into `public/images/` and the icons into `public/`:

- `hero-*.{avif,webp,jpg}` and `hero-mobile-*`: the toned elephant for the Home hero, in desktop (landscape) and mobile (portrait) crops, at three widths each.
- `ear-texture.webp`: a faded detail of the ear for the About page header.
- `grain-lines.webp`: the growth-ring lines, cleaned and tinted Umber on a transparent background.
- `logo-ivory-520.{webp,png}`: the wordmark recoloured Ivory for the dark header.
- `og-image.jpg`: the 1200×630 social sharing image.
- `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`.

The generated files are committed. Only run `npm run images` again if you replace a source image.

## Palette

Sampled from the colour fields of `palette.png`, not from its printed labels (most of the labels are wrong). Cream is sampled from `grain.jpg`.

| Name | Hex | Use |
| --- | --- | --- |
| Midnight Blue | `#19212C` | Header, footer, page headers, closing bands |
| Onyx | `#050505` | Hero base, fog |
| Moss Green | `#263123` | Key-statement sections |
| Umber | `#2C1F16` | Grain texture, hairlines on Cream, sepia tone in the hero |
| Burgundy | `#541718` | Rare accent: one short rule, hover on light buttons and links, error text |
| Champagne | `#AE906B` | Buttons, links and labels on dark backgrounds, hairlines |
| Ivory | `#D6CCA8` | Text on dark backgrounds |
| Cream | `#E8E2D4` | Light section backgrounds |
| Ink | `#1B1B18` | Text on Cream |
| Bronze (added) | `#6B573E` | Labels and links on Cream. Champagne on Cream is only 2:1, so this darker shade of it is used instead |

Contrast (WCAG): Ivory on Midnight 10.1:1, Ivory on Moss 8.4:1, Champagne on Midnight 5.4:1, Champagne on Moss 4.5:1, Ink on Cream 13.4:1, Bronze on Cream 5.3:1, Ink on Champagne (buttons) 5.8:1.

## Project layout

```
assets/source/          original images (untouched)
scripts/build-images.mjs  image pipeline
public/                 static files, including generated images
src/site.config.mjs     company name, emails, phone, domain, form settings
src/styles/global.css   design tokens and shared styles
src/layouts/Base.astro  <head>, header, footer, scroll-reveal script
src/components/         Header, Footer, PageHead
src/pages/              one file per page
netlify.toml            build and header settings for Netlify
```
