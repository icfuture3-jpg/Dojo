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


## Consolidated Dojo itch.io release

This release uses **this Dojo repository only**. It combines Dojo updates #4 (pot motion), #5 (earned-only boxes), #6 (champion gis), #8 (shared Classic Daily ban), #10 (hidden Challenges & Events menu), #12 (no rewards for match losses), and #21 (AdSense account metadata). Existing Dojo content, saves and equal-thirds opponent odds are retained. The hidden Challenges & Events menu stays hidden as requested, so its underlying tournament/gi logic is retained but not newly exposed.

Use Node 26 and npm:

```sh
npm ci
npm test
npm run package:itch
```

Upload **artifacts/dojo-itch.zip**, not the repository or a ZIP of the enclosing folder. Its `index.html` is at the root; Vite uses relative asset paths for itch.io's subdirectory. The exporter packages each compiled file once, rejects duplicate filenames/content, checks entry-page assets, and excludes source, tests, node_modules and original-runtime exports. `artifacts/dojo-itch.zip.sha256` records its checksum. Do not extract and re-ZIP the enclosing directory.

On itch.io use the HTML game upload and mark the ZIP as playable in the browser. Preview the uploaded game in the actual embed before publishing; this repository cannot upload to your itch.io account. See https://itch.io/docs/creators/html5 . Existing HTTPS Google Tag Manager/AdSense scripts and optional support link are unchanged; external service configuration/approval is not included in this release.

Build/test success does not verify every mode, physical mobile device, browser or external service. Saves are local to each browser and origin: Vercel progress does not automatically transfer to the itch.io embed. This build does not add save import or cloud accounts. Do not advertise real-device testing until performed. Publishing a source PR does not update production automatically until merged.
