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

This release uses **this Dojo repository only**. It combines Dojo updates #4 (pot motion), #5 (earned-only boxes), #6 (champion gis), #8 (shared Classic Daily ban), #10 (hidden Challenges & Events menu), #12 (no rewards for match losses), and #21 (AdSense account metadata). Existing Dojo content and saves are retained. Classic matches now use first-choice assistance and CPU-hand locking; see below. The hidden Challenges & Events menu stays hidden as requested, so its underlying tournament/gi logic is retained but not newly exposed.

Use Node 26 and npm:

```sh
npm ci
npm test
npm run package:itch
```

Upload **artifacts/dojo-itch.zip**, not the repository or a ZIP of the enclosing folder. Its `index.html` is at the root; Vite uses relative asset paths for itch.io's subdirectory. The exporter packages each compiled file once, rejects duplicate filenames/content, checks entry-page assets, and excludes source, tests, node_modules and original-runtime exports. `artifacts/dojo-itch.zip.sha256` records its checksum. Do not extract and re-ZIP the enclosing directory.

On itch.io use the HTML game upload and mark the ZIP as playable in the browser. Preview the uploaded game in the actual embed before publishing; this repository cannot upload to your itch.io account. See https://itch.io/docs/creators/html5 . Existing HTTPS Google Tag Manager/AdSense scripts and optional support link are unchanged; external service configuration/approval is not included in this release.

Build/test success does not verify every mode, physical mobile device, browser or external service. Saves are local to each browser and origin: Vercel progress does not automatically transfer to the itch.io embed. This build does not add save import or cloud accounts. Do not advertise real-device testing until performed. Publishing a source PR does not update production automatically until merged.


## One maintained game

This repository is the canonical source for both Vercel projects and the itch.io ZIP. Retain the expanded modes, creator, cosmetics, rewards and slower accessible countdowns. Classic matches now give an unchanged first choice 55% win / 20% draw / 25% loss, with the CPU locked on the first legal selection or Peek. Changing your choice never rerolls the CPU. A no-choice timeout still loses; pause/resume keeps the plan. Classic Daily keeps the same ban for both players and renormalizes only legal outcomes, so its odds differ. Challenge/academy/spectator activities keep their own rules. Small embeds have unscaled hand buttons; keyboard shortcuts ignore typing fields.

Existing versionless browser saves are repaired into the expanded schema without deleting the original recovery snapshot. Each origin keeps separate local progress; this is not cloud save or synchronization. Keep the retired source repository as a backup until the unified release is merged and deployed successfully on both projects. Do not make new changes in that old source.

## Clash tie-breaks and impact feedback

In **Enter the Dojo** (classic ladder), ties award no point and restart the full
normal countdown. There is no rapid Clash rematch in these fights.

In Endless Tower, Classic Daily and rescue duels, tied hands
open a **Clash**. After a 1.2-second warning, choose a fresh hand within one second
using the same touch/click buttons or R/P/S (1/2/3). Your old choice is cleared.
The rival commits a fresh hidden hand uniformly among legal hands before input;
changing your hand cannot reroll it. Daily's shared ban still applies. Another tie
repeats the Clash; failing to choose loses. Only the resolved duel awards a single point.
Peek and Guard cannot be activated during Clashes. A Guard already armed stays
reserved for the next normal round; a Guard-blocked loss remains a no-point draw,
not a Clash. Optional academy, challenge and spectator activities are unchanged.

Scoring hits have a 100ms visual hit-stop, short mild arena shake, comic ink burst
and a layered percussion strike using the existing sound-effects volume control.
Reduced-motion preferences suppress impact animation/particles; no full-screen
white flash is used. Pause, hidden-tab pause and forfeit cover Clash transitions.

## Literal finisher choreography

All twelve shop previews and equipped finishing scenes now animate the saved
fighter's waist, arms and legs, not just the outer avatar. Respectful Bow folds
at the waist with planted feet; Lotus Pose sits cross-legged; Crane Balance lifts
one leg; Cyclone Kick extends a leg; Meteor Punch extends a fist; Victory Salute
raises both arms; Jade Wave uses an open palm and outgoing energy. Dragon Spin,
Thunder Stomp, Phoenix Leap, Shadow Dash and Starburst each have their own windup,
action, held pose and recovery, with matching vector trails or impact motifs.

Scenes last 5.2 seconds and CONTINUE still skips immediately. Switching preview
moves resets the timeline. Reduced motion shows the held action pose and static
effects instead of movement. Post-match scenes render outside the scaled arena
so the presentation and Continue button retain native viewport sizing. No changes
to prices, ownership, equip rules, rewards or the save schema. These remain 2D
cutout animations; rendered motion quality requires a browser/device check.

Thunder Stomp adds a localized cloud/lightning strike and ground sparks at the
footfall (44% of the scene, 2.288 seconds), with synthesized thunder through the
sound-effects volume control. It uses one fading strike, not a strobe. Reduced
motion keeps a static lightning illustration. Skipping or leaving the scene
cancels pending thunder and releases its audio context; unavailable/blocked audio
does not interrupt the finisher.

## Name-matched aura shop previews

Every named aura now has a themed vector effect in its shop preview: Inferno has
flames and hot cores, Ocean Mist has fog, Tidal Flow has foam-topped waves, Rose
Petals/Sakura/Cherry Bloom have petals or flowers, Storm/Steel Storm have clouds
and lightning/shards, and the celestial/plant/gem auras have matching motifs.
No Aura remains clear. A short description names the visible effect. Artwork is
bounded SVG/CSS, without external assets or animation frame loops; reduced motion
shows static artwork. The equipped aura also shows its themed effect on match-winning hits and
winning result/champion screens in classic duels. Regular-round glows remain unchanged. Previewing still never purchases or equips.


## Diamond skins and fight milestones

Seven new diamond-exclusive armor skins have tier prices of **20 / 50 / 100 / 200 /
350 / 500 / 650 diamonds**: Ember Knight, Frost Warden, Thunder Ronin, Jade Dragon,
Solar Phoenix, Void Emperor and Celestial Sovereign. Each has a different vector
helmet/mask and chest crest visible on the equipped fighter. Tiers 1–4 are Epic,
5–7 Legendary. They cannot drop from mystery boxes. Legacy skins/prices,
ownership, equipped cosmetics and existing diamond balances are kept.

Starting with this update, earn **1 diamond for every 10 new fight wins** across
classic ladder, Tower, Daily, rescue and Challenge Dojo matches. These are match
wins, not individual throws. Losses reset the existing win streak but do not erase
diamond progress. Progress persists across reloads and duplicate results cannot
pay twice. Past win totals are not cashed in retroactively. A new player starts
with zero diamonds; login, season, level-up, trophy, mission and activity completion
bonuses now pay coins/XP only. Academy drills, pots and spectating do not count.
Shop → Skins shows progress to the next diamond. From zero, the 20-diamond tier
takes 200 wins and the 650-diamond tier takes 6,500 wins (before other purchases).
Saves remain device-local, not server-verified or cheat-proof.
