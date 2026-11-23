# FertiClock website

One-page landing site with a waitlist. Plain HTML, CSS and JavaScript: no build step, no dependencies.

```
index.html        the page (English)
el/index.html     Greek holding page (TODO: full Greek version)
privacy.html      privacy policy (draft)
css/tokens.css    design tokens + self-hosted fonts
css/styles.css    all styles (mobile-first)
js/main.js        mobile menu + waitlist form
assets/           fonts, logo, images (WebP)
```

## Run locally

```sh
python3 -m http.server 8765
# open http://localhost:8765
```

## Deploy (GitHub Pages)

1. Push this folder as the root of a GitHub repository.
2. Repository → Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
3. The site is live at `https://<user>.github.io/<repo>/`. All links are relative, so it works under a sub-path and on a custom domain.

## Waitlist (Google Sheets)

The form posts to a Google Apps Script web app that appends a row to a Google Sheet.
Script and setup steps: `../waitlist-apps-script/Code.gs`.
Then paste the web-app URL into `js/main.js` → `CONFIG.WAITLIST_ENDPOINT`.
While it is empty, the form runs in demo mode and stores nothing.

## Copy variants

Some text is shorter on phones. Elements with class `t-lg` show from 640 px up, `t-sm` below 640 px.
Edit both when changing that copy.

## Placeholders still open

- `[TEAM EMAIL]` / `mailto:hello@example.com` (search for `data-team-email`)
- LinkedIn link (footer, commented out)
- FAQ privacy answer and `privacy.html`: to be reviewed by a data-protection advisor
- Greek copy (`el/`)
- Domain, `og:url`, OG image (1200×630)
- Higher-resolution team photos, finger-prick photo and Michelle illustration

## Content rules

See the brief and the handoff README section 10: no partner names, the test route stays open
("read at home or analysed by an accredited lab"), keep every "Example"/"Illustrative" label and the disclaimer,
no accuracy claims, no "buy"/"order now" flows.
