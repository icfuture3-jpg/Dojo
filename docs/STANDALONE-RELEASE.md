# Consolidated standalone release candidate

This candidate builds on all accumulated changes from publication PRs #1–#8, not the old live build. It does not replace the RPS system or add fake internet multiplayer.

## Included
- Previous save/reward fixes, five Challenge Dojo trials, expanded responsive menus, spectator mode, audio settings, shop reference artwork, cutout visual theme, slower SHOOT selection, fighter keyframes and removal of YOUR FIGHTER cutscene text.
- Six additional sequential-bracket tournaments with level/previous-clear gates and championship outcome screens.
- Three new RPS rivals with explicit strategy tendencies, introduction and win/lose reactions; all eight original rivals preserved.
- Six rescue-dojo activities, unlocked by rescuing the corresponding original dojo: defense, three-hand rival competition, flawless training trial, consecutive victories, championship and an eight-throw timed trial.
- Six rotating special events. One real event is available per UTC day; weekends select the weekend tournaments. A run must finish before its scheduled UTC expiry. Local device clock is used, not an online event server.
- First-clear and per-event-occurrence rewards, on-device records, additive achievements for 10/25/50/100 wins, streaks and collection completion. Old trophies and their easier requirements are retained.
- Early level costs reduced 20% through reaching level 10. Old advanced saves subtract the 504-XP cost difference once so attained later level and within-level progress remain unchanged; later per-level costs are untouched. Currency, ownership and old trophies are not reset.
- Five-win diamond milestones: 2 at 5 consecutive wins, 3 at 10, 4 at 15, 5 at 20 and every later five wins. Loss resets the streak; duplicate completion identities do not advance it. No invented retroactive streak is paid.
- Pot actions driven by one motion clock: attached arm releases a visible stone; whole custom fighter flies into a dragon kick; walking legs approach before the original hand chops. Geometry tests verify foot/hand contact with the pot. Motion review scrubs the actual artwork without granting rewards.
- Saved custom-character cutscene entrance, replay/scrub controls and pause/resume. Unique SVG paint IDs avoid collisions between multiple customized fighters.
- Pause/resume for classic match selection/transitions, including hidden-tab notification. New challenge pause behavior retained. Finite transition timer cleanup.
- Automatic local saving and previous-backup storage remain. Save Tools and its import/backup-review panel have been removed from the menu. Save warnings retain emergency session export and reload after a competing tab update; automatic writes stop rather than silently merging.
- Illustrated dojo environment reused in actual classic gameplay, preserving rescue-specific scenes. Shared warm lighting and cutout presentation remain.
- Lazy-loaded Challenge Dojo and vendor splitting; bundle-size warning addressed by actual chunks rather than increasing the warning limit.

## Release validation

Repository tests and temporary mounted-component checks are recorded in the release PR. Required checks include all content win/fail paths, event boundaries, entry gates, no duplicate awards, migration and round/contact geometry; actual keyboard input through original ladder completion; new tournament completion; save persistence/conflict controls; and exact-preview desktop/phone art/input checks.

## Honest platform limits

Standalone local storage is not anti-cheat, authenticated cloud storage or global ranking. Clearing browser data can remove progress. Device-clock events are not tamper-resistant. Conflicting tabs are warned/blocked rather than automatically merged. Real hardware iPhone/Android FPS and every costume combination cannot be certified by browser emulation; no such claim is made. The full action-combat/3D engine request was superseded by preservation of the original RPS game. Internet multiplayer remains separately planned, with no connected backend or fake online lobby.

## Catalog artwork follow-up

- Creator patterns now total 33 with nine further motifs (Cherry blossoms, Koi fish, Tiger stripes, Phoenix feathers, Ocean tide, Crescent moons, Hexagon armor, Maple leaves and Dragon crest). Every pattern has distinct vector artwork and a named thumbnail; added styles are level-1 choices and old IDs remain stable.
- Hairstyle composites, hair labels/swatches and outfit style/color labels are uniqueness-tested. The 50 generated shop gis now have distinct color values and full names, retaining their IDs, prices and purchased ownership. Repeated generic shop thumbnails are replaced with framed trophy-style illustrations using the exact same Pattern artwork as the equipped fighter. Named Dragon gis now show a dragon, rather than the former generic scales/chevrons thumbnail.
- Missions is removed from the menu and panel; existing automatic mission progress/rewards remain to avoid deleting earned features or changing payout behavior.
- Coin balances and prices use original gold-disk SVG artwork, not platform-dependent coin emoji.
