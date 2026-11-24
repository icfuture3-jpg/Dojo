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
performs a right-hand military-style salute; Jade Wave uses an open palm and outgoing energy. Dragon Spin,
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


## One board-training session per visit

After a loss or a return to the dojo with training due, finish board-breaking once.
That session clears queued loss practice and all currently due three-match training
milestones, paying strength/XP once for the five attempts actually played. Old saved
backlogs no longer force consecutive sessions. New losses can trigger a new session;
new three-match milestones can still offer normal practice. A loss practice session
also covers a scheduled milestone, so returning to the dojo does not repeat it.


## Mythic Friends and board-only coin restriction

Fight wins keep their original coin rewards and also unlock cosmetic friends.
Ladder, Tower, Daily, rescue and Challenge Dojo fight rewards, including bonuses,
are unchanged. Board-breaking grants strength/XP but no coins, including from
training-triggered trophies. Existing balances, prices, diamonds and saves are kept.

Open **FRIENDS** on the main menu to see/equip/unequip your collection. Fourteen
friends unlock at 3, 8, 15, 25, 40, 60, 85, 110, 140, 175, 210, 250, 300 and 365
qualifying fight wins: Dragon-Gate Carp, Bixi, Suanni, Xiezhi, Qilin, Nine-Tailed Fox,
Fenghuang, Yazi, Taotie, four river dragons, and Zhulong. These are playful original
SVG adaptations inspired by Chinese folklore, not literal depictions of a single
historical text. Cultural reference: https://www.christies.com/en/stories/mythical-creatures-in-the-life-and-art-of-ancient-china-c1c2d296024540649dddefa739e53cb4 .

Friends use the existing saved `diamondWins` total, so already recorded qualifying
wins count. Wins predating that counter are not invented. No random drops, payments,
buffs or currency costs. Companions appear beside the fighter on the main menu and
in classic arenas. Equipment persists per browser; this remains local-only saving.


## Treasures collection

Shop → Upgrades → Dojo Treasures includes six illustrated display-only collectibles earned
at qualifying fight-win milestones: Dragon’s Flaming Pearl (5), Ruyi Jingu Bang
(20), Gold-Sewn Jade Burial Suit (45), Sanxingdui Protruding-Eye Mask (80), Bronze
Tiger Tally/Hufu (125), and Jade Ruyi Scepter (180). The collection uses the saved
diamondWins counter, like Friends. Already recorded wins count; wins predating
that counter are not fabricated. No currency costs, equipment, buffs, random drops
or changes to fight coins, board training, friends or diamonds. Locked cards show
the remaining wins; collected state persists with the saved win total.

Legendary objects and historical artifact types are explicitly labeled separately.
The burial suit is funerary ceremonial clothing, not combat armor. The Sanxingdui
mask’s interpretation is uncertain. These original SVG illustrations are stylized,
not reproductions or claims to possess real museum artifacts.


## Friend artwork and ability previews

Each of the fourteen friends has an individually drawn silhouette, not a shared
body recolored. The river dragons are a coiled serpent, cloud-maned guardian,
long pearl serpent and wave-riding scaled dragon. The other friends retain
species-specific fish, shell, mane, single horn, hooves, nine tails, feather fan,
leopard, horned Taotie and torch-coil details. Larger collection cards and equipped
buddies use the same character art as the preview.

Every card has **PREVIEW ABILITY**, even while locked. The large showcase animates
its signature visual effect (water leap, shield, smoke, beacon, blossoms, spirit
lights, feather glow, roar, bronze light, vortex, rain, bubbles, wave or daybreak).
These are cosmetic demonstrations only: no combat powers, purchases, currency
costs, reward changes or automatic equipping. Back to Friends or Escape closes the
preview. Reduced motion disables movement and retains the static character/effect.

Treasures live alongside Coin Purse and Scholar’s Scroll in the existing Dojo
Treasures shop section. Trophies is a separate menu/panel again, without collectibles.


Treasure artwork shares the Coin Purse/Scholar’s Scroll painted gold and jade
materials, 180×150 display scale, grounded shadows, engraved detail and wood/gold
row framing. Bronze objects retain aged patina; the pearl retains its flame motif.
Responsive rows stack on small screens. This is a visual restyle only: unlocks,
prices, coins, diamonds and saves are unchanged.


## Epic finisher acquisition

Epic finishers remain in Shop → Finishers, with unchanged previews and moves.
Cyclone Kick costs 20 diamonds, Meteor Punch 30, Crane Balance 40, Victory Salute
50, Jade Wave 60 and Starburst 70. They cost no coins and no longer drop from
mystery boxes. Existing ownership/equipment is retained; non-Epic finishers keep
their previous coin prices. Diamond earning rules are unchanged.


### Folklore-reference friend details
The supplied written references guide the character features: Bixi carries a stone
tablet on a turtle shell, Xiezhi has a single horn and dark shaggy fur, Qilin has
antlers/scales/hooves, Fenghuang has a long neck and ornamental tail feathers,
Yazi has leopard features plus dragon horns and fangs, Taotie has a goat-like body
with underarm eyes and tiger teeth, and Zhulong has a human-like face on red coils.
River dragons retain individual silhouettes but use long bodies, horns and whiskers
rather than a Western winged-dragon or seahorse design. Original game-style SVG
adaptations, not exact copies of any image; no image files accompanied these refs.
Names, IDs, unlocks, ability previews, equipment and currency rules are unchanged.


## Exact screenshot friend artwork

Friends now use direct PNG crops of the latest user-supplied full collection image,
not the SVG redraws. All fourteen characters share the same respective PNG across
cards, ability previews and equipped companions. Only creature regions are included;
browser chrome, player details and captions are excluded. `friend-image-manifest.json`
records crop bounds and SHA-256 hashes. Crops are 96×94 pixels with tighter creature-only bounds. Edge-connected dark
background and tiny edge debris are removed into transparency, excluding captured
card lines/captions while preserving retained RGB colors. No recoloring, fading,
face overlays or AI upscaling. This preserves the actual reference artwork but cannot add resolution;
large previews can appear soft. Ability effects remain separate from the character animation.
Unlock thresholds, saved progress, equipment, rewards and currencies are unchanged.


Suanni, Xiezhi and Qilin have individual crop bounds below the captured player
status overlay, removing embedded words rather than treating them as creature
detail. The fox uses a wider crop for the tail fan. These four have transparent
12-pixel safety padding on every side to prevent touching/cutting the display edge.
Screenshot-occluded details cannot be recovered from the source. Other ten images
and all collection/equipment/reward behavior are unchanged.


Friend PNGs are bundled from `assets/friends/` rather than served from stable
`public/images/friends/*.png` URLs. Vite produces content-hashed filenames so
cleaned artwork receives a new URL when its bytes change and old cached images
are not reused. The image pixels themselves are unchanged by this loading fix.


### Animated Friends collection

All fourteen Friends cards, including locked friends, and their ability showcases
now animate the original PNG artwork with individual soft-joint cycles: swimming
and coiling bodies, swishing tails, fanning wings, head movement and planted-stance
shifts rather than whole-image floating. A shared-vertex SVG mesh bends the source
image without replacing/recoloring it or drawing extra faces. Animation uses CSS,
not per-frame React updates; the covered gallery pauses during ability previews.
Reduced motion shows the exact unwarped image and still ability effect. Equipped
companions outside this section, unlocks, equipment and rewards are unchanged.
