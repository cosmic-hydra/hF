# hF — hydra fund website

Source for [www.hydrafund.ch](https://www.hydrafund.ch), deployed via GitHub Pages.

- `cadro-mirror/` — the live site. This is what the Pages workflow deploys.
- `site/` — original hand-built static rebuild (HTML/CSS/JS, no build step, no external dependencies). Not currently deployed; switch the path in `.github/workflows/deploy.yml` to `./site` to use it.
- `alpha/` — redirect page for alpha.hydrafund.ch.
