# hF — hydra fund website

Source for [www.hydrafund.ch](https://www.hydrafund.ch), deployed via GitHub Pages.

- `site/` — the live site (original, hand-built static HTML/CSS/JS, no build step, no external dependencies). This is what the Pages workflow deploys.
- `alpha/` — redirect page for alpha.hydrafund.ch.
- `cadro-mirror/` — previous site (kept for rollback; no longer deployed).

## Editing

Every page in `site/` is plain HTML sharing `css/main.css` and `js/main.js`. Edit and push to `main` — the GitHub Actions workflow deploys automatically.
