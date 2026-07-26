# hF — hydra fund website

Source for [www.hydrafund.ch](https://www.hydrafund.ch), deployed via Vercel.

- `cadro-mirror/` — the production site published by Vercel.
- `site/` — original hand-built static rebuild (HTML/CSS/JS, no build step, no external dependencies). It is not currently deployed.
- `alpha/` — redirect page for alpha.hydrafund.ch.

`vercel.json` configures this repository as a static site with no install or
build step and publishes `cadro-mirror/`. Vercel's Git integration creates
preview deployments for branches and deploys `main` to production.
