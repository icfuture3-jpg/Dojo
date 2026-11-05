# Dojo of the Three Hands

The standalone React/Vite version of the live single-player game.

## Run locally

```sh
npm ci
npm run dev
```

## Checks and production build

```sh
npm test
npm run build
```

Vite writes the production site to `dist/`. The Vercel project uses the Vite
framework preset with this repository root as its application directory.

Includes the tournament, tower, daily challenge, rescue missions, spectator bouts,
character creator, shop, trophies, missions, ranks, and three tree-pot challenges.
The current layout fills the browser viewport on phones and laptops. Pot challenges
include the stone throw, flying dragon kick, and walk-up chop animations.

Progress is saved locally in the browser, not in a cloud account. Rankings show
only the local record. Clearing browser storage deletes progress.

## Original exports

`original-runtime/` preserves the repository's previous file contents unchanged, with
`.rtf` extensions identifying their actual format. They are
rich-text exports of an older Wildwood version, not executable source, and are not
included in the standalone build. The runnable app source is at the repository root.
