# Consolidated standalone release checklist

Release candidate includes the accumulated changes from PRs #1–#8. None of those preview-only changes should be mistaken for deployed production until the release check confirms the live commit.

## Required work
- [ ] Six new playable tournaments with saved bracket progression/entry gates/results
- [ ] Additional RPS rivals with strategy/dialogue/reactions/rewards, retaining all originals
- [ ] Six rescue-dojo activities with distinct objectives
- [ ] Six scheduled local events with UTC boundaries and once-per-occurrence awards
- [ ] Additive achievements (10/25/50/100 wins, streak, complete collections) and honest device-local records
- [ ] Modestly faster levels 1–10 with non-destructive save migration; later per-level costs unchanged
- [ ] Five-win diamond milestones: default 2 at 5, 3 at 10, 4 at 15, capped at 5 per further five wins; reset streak after a loss. No retroactive invented streaks.
- [ ] Saved custom-character entrance, no YOUR FIGHTER label
- [ ] Actual attached-limb stone throw, flying dragon kick and walk-up chop; visible contact/replay checks
- [ ] Unified enhanced cutout artwork and existing shop reference styling
- [ ] Longer selection windows retained throughout classic/new content
- [ ] Save recovery/import/export and conflict warnings; original rewards/features retained
- [ ] Regression, content completion/failure/duplicate claim/reload tests, browser desktop/phone QA
- [ ] Publish only after required release checks pass; record remaining platform limits

## Excluded by standalone scope
Internet multiplayer, authenticated cloud saves and global rankings: no backend configured. No fake lobby, fake online count, or local scores labelled global. A separate backend plan exists.
