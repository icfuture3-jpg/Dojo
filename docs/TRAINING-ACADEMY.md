# Training Hall expansion

An additive, device-local academy. Existing tournaments, RPS resolution, opponent AI, original XP/RP, shop prices, equipment and profile progress are not replaced. The Tree Pot motion-review checkbox and scrubber are removed; its actual animations and timing remain.

## Playable rules and completion rewards

| Mini-game | Completion condition | Coins | Academy XP |
| --- | --- | ---: | ---: |
| Dummy Destroyer | 10 correct counters in 30 seconds | 25 | 20 |
| Sensei’s Prediction | 3 correct predictions out of 5; 3 clue difficulties | 30 | 25 |
| Lightning Hands | At least 9 correct counters out of 12; accelerating timers | 50 | 35 |
| Balance of Three | Cross 8 obstacles before losing 3 lives | 45 | 30 |
| Five-Hand Frenzy | 5 consecutive matches, first to 2 points; five strategies | 75 | 50 |
| Shadow Master | First to 3; opponent reads last five submitted hands | 100 | 65 |
| Master Says | Follow 10 of 12 commands; HOLD for deceptive commands | 60 | 40 |
| Three-Hand Memory | Repeat lengths 3, 4, 5 and 6; any error ends run | 65 | 45 |
| The Master’s Trial | Defeat Bao, Mei and Oku, first to 3 per match | 150 | 90 |
| Grandmaster Survival | 9 consecutive first-to-3 match victories; continue endlessly | 250 | 120 |

Draws do not score. All hands use the existing `rps.ts` rules. Lightning Hands and Master Says advance automatically after short feedback; other games use Continue between turns. Survival difficulty rises every three victories, with a 3-second minimum choice window. Its milestone pays once per run, not on each later victory or repeated completion event. Completed new runs legitimately earn their own advertised rewards.

## Persistence and rewards

The additive `academy` profile field defaults on old saves. It stores the current run, claimed/started run IDs, academy XP, clear counts, best records, daily claims, unlocked rewards and equipped academy cosmetics. Existing safe storage and backup/error handling save the whole profile. Completion is derived from the sequence of actions, never from a submitted `won` or reward amount. Run ID and turn tokens prevent duplicate answer processing. Completion coins and claim ID commit in one immutable profile update. Midnight does not retroactively award an expired daily objective.

Three daily objectives rotate at UTC midnight using the device clock; each bonus is +25 coins/+20 academy XP once per date/objective. Shadow's daily requires no repeated hand. No network, trusted clock, online identity or global ranking is claimed. As with other local saves, manual storage/clock edits cannot be secured against a device owner.

Belts use cumulative academy XP thresholds: White 0, Yellow 80, Orange 210, Green 400, Blue 680, Brown 1050, Black 1550. This does not alter existing levels or ranks.

Unlocks are based on distinct mini-game clears:
- 1: lantern hall decoration.
- 2: golden hand reveal animation and Ocean Stripe Gi in original inventory.
- 3: bamboo hall decoration.
- 4: original Bao training avatar.
- 5: Jade Stripe Gi in original inventory.
- 6: cyan hand reveal animation.
- 8: original Mei training avatar.

Decorations, hand effects and master training avatars apply inside the academy only. Existing owned gis can be equipped in the existing shop. No existing outfit or custom appearance is overwritten.

## Controls and timers

Touch/mouse buttons and 1/2/3 or R/P/S. Space selects HOLD in Master Says. Escape toggles pause. Pause freezes all clocks, including dummy total time and memory-reveal progress. Tab hiding pauses active runs. Restart abandons the prior run and creates a new identity without a reward. Exit to Hall or Dojo abandons an unfinished attempt. Pause before closing to preserve remaining time. Browser reload retains a paused run; active timed attempts remain subject to their saved deadline.

## QA

Regression tests exercise every completion, failure and restart; draws in all duel games; rewards/save reload and duplicate ID/turn rejection; accelerating timing; memory visibility/length rules; paused reveal/reaction timing; daily rotation and bonus limits; belt thresholds; unlocked shop ownership and academy cosmetic equip gates. Additional mounted checks cover all ten start/pause/restart/exit paths, keyboard memory completion, saved reward, daily/belt/unlock navigation and shop callback. The mounted original four-master ladder verifies pause, late keyboard choice, championship rewards and access to tower/daily/rescue/pot modes.

Browser preview evidence and release commit are recorded in the PR after verification. Browser viewports are not real iPhone/Android device or audio-output/performance certification.

## Playable-menu cleanup

The Hall now has one card and one PLAY button per training game. PLAY starts the timed activity directly (memory starts its watch sequence); old saved ready runs can still Begin. Removed the redundant Mini-game tab, duplicate Grandmaster shortcut, daily-objective launches, standalone belt information tab and duplicate shop links. Daily bonuses appear on the original game cards, and belt progress stays in the Hall status. Training equipment only lists earned, equippable items. None of the reward or save rules changed.

Challenges & Events lists only activities currently enterable for this profile/date. Locked and exhausted entries and empty groups are hidden, not deleted from the save or rule engine. Returning later after unlocking content makes it available. Removed the noninteractive achievement-card wall from this play menu; automatic achievement rewards remain intact. Active trials reopen their playable run and retain return/resume/forfeit controls.

## Equal-odds opponent update

All combat opponents now choose Rock, Paper or Scissors from equal thirds of a single random draw. Removed weighted favorite hands, countering player history and Tower-floor habit reading. Classic and challenge hands are still planned before the player's current choice, and academy duel targets are fixed when the question opens. Shadow, Frenzy, Trial and Grandmaster use the same unbiased selection. Opponent blurbs now describe equal odds rather than removed strategies.

This is equal per-throw probability, not enforced alternating wins or a guaranteed match result. Against any fixed legal player hand, an unassisted on-time round has 1/3 win, 1/3 loss, 1/3 draw probabilities. Existing Peek/Guard, missing-choice losses, special challenge goals/starting scores, timers, progression and rewards are unchanged. Streaks can still happen naturally. Non-combat drills retain their existing target and sequence rules.

## Dummy Destroyer retired

Dummy Destroyer is removed from the playable Hall and cannot start new attempts. Nine games remain, numbered from Sensei’s Prediction onward. Grandmaster Survival replaces Dummy in its daily rotation group so there are still three distinct playable daily objectives. Loading an old Dummy attempt returns to the Hall; previously earned coins, academy XP, records, clear counts and equipment are preserved. The legacy ID is retained for save compatibility.

## Sensei’s Prediction retired

Training Hall now has eight playable entries, starting with Lightning Hands. Sensei’s Prediction, its difficulty selector and its daily-objective slot are removed; Dummy Destroyer remains removed. Lightning Hands fills the former Sensei daily slot. Existing earned balances, clears, records and equipment remain; saved attempts in either retired game return to the Hall.
