# Content expansion — staged delivery

This is additive RPS content, not an action-combat redesign. Preserve `rps.ts`, existing characters/looks, abilities, modes, reward amounts and level/rank curves. No real-time fighting engine or new 3D dependency is planned here. No production release without separate approval.

## Stage 1 — save and reward foundation

Implemented:
- Persist the initialized profile (including daily login) and later changes through an effect, not a side effect inside a React state updater.
- Retain the existing storage key/raw profile format; add version 2 defaults and saved completion identities. Legacy profile fields are retained.
- Repair invalid nested leaves without discarding valid siblings. Keep a previous valid snapshot and retain damaged/legacy bytes before replacing them.
- Recover a valid backup if primary JSON is damaged. Do not automatically overwrite unrecoverable or newer-version saves.
- Show storage failure/recovery status; provide functional retry (after write failure) and session JSON export. Export is not yet an import/synchronization feature.
- Route completion events through a pure validated action boundary. Each match ID pays its match reward, victory box/loss-training entitlement and scheduled-training counter once, including after reload.
- Advance the three-match training counter for accepted non-spectator completions. Keep existing loss-triggered training and training awards.
- Reject NaN/noninteger/impossible match scores and malformed actions before modifying progression.
- Display actual rank-eligible box odds without changing the item selection algorithm, costs or prizes.

Validation and preview evidence are recorded in the Stage 1 PR/report. No new challenge is marked playable in Stage 1.

Remaining audit work:
- Responsive menu reflow/readable phone controls; existing game still scales desktop controls.
- Reconnect spectator gameplay and expose the existing skin shop category.
- Separate persisted music/SFX controls, pause/background policy, timer cleanup.
- Broader visual checks of cutscene and pot-challenge contact/locomotion.
- Save import/recovery UI and multi-tab conflict handling. Saves are local, not secure or global. Completion history is retained and grows with completed matches.
- Retroactive duplicate claims predating Stage 1 cannot be identified: IDs did not exist then. No currency or ownership is removed.

## Stage 2 — remaining audit fixes and first Challenge Dojo slice

Finish the audited reachability/mobile/settings issues in small tested changes before expanding the catalog. Create **CHALLENGES & EVENTS / CHALLENGE DOJO** with only the first complete activities exposed. No empty category buttons.

First playable batch: a distinct new objective-based daily trial (without altering the existing daily mode), Survival Challenge using existing rivals, Perfect Victory (specified consecutive win goal), Comeback (start 0–2), and Three Hands Master (win objectives for all three choices). Reuse the exact throw-resolution rules and existing art; difficulty is configuration of existing timing/strategies, not altered RPS outcomes. Give activities start/objective/attempt-limit/result/retry-or-locked/exit paths. Persist run state and completion IDs. Daily UTC seeds/objectives, explicit attempts, once-per-date rewards, and streak accounting must be tested.

Gate: each activity playable to win and lose; exits work; reload does not restore spent attempts or pay again; original modes retain their tests and behavior. Do not expose a category until it contains a finished playable activity.

## Stage 3 — six additional tournaments

Beginner, Intermediate, Advanced, Grandmaster, Elite Invitational, and Three Hands World Championship. Define explicit brackets, entry requirements, opponent order, difficulty, advance/retry rules and fixed completion rewards. Preserve the original four-master ladder unchanged. Use existing rivals initially. Add a championship result screen with a real return path and one-time claim identity per eligible run/milestone.

Gate: all brackets can complete; locked entry cannot start; byes/advancement/reload/exit and payout tests; no match treated as a tournament clear prematurely.

## Stage 4 — rivals and rescue-dojo activities

Add rivals as catalog entries, without replacing Bao/Mei/Ren/Oku/Jun/Kai/Rin/Void Sage. Give each real dialogue, introduction, RPS tendencies, win/loss reactions and rewards. Add data-defined defense, dojo competition, training, consecutive-victory, championship and timed activities across the six existing dojo settings. Each has concrete goals and reward rules.

Gate: every added opponent produces legal throws and follows documented tendencies; every dojo activity has tested win/loss/timeout/exit and persisted completion. No cosmetic-only activity is called playable.

## Stage 5 — rotating events

Weekend Tournament, Double Reward Challenge, Rival Revenge, Three Hands Festival, Grandmaster Challenge and Championship Weekend. Deterministic UTC schedule with visible start/end times; snapshot event identity at entry and define whether a started run may finish after closing. Rewards keyed by event occurrence, not display title. Existing base rewards are not silently doubled everywhere.

Local-device clock scheduling is the supported baseline. It is not tamper-resistant or a server-authoritative global event service. Show this accurately. Gate: UTC/day/weekend boundaries, timezone/DST independence, spent attempts, reload, event end and duplicate payouts tested.

## Stage 6 — additive achievements and honest local records

Add new distinct achievement IDs for 10/25/50/100 wins, consecutive wins, all challenges/tournaments/rivals/dojo activities and Three Hands Grandmaster. Keep old trophy IDs, awards and ownership; do not reinterpret existing easy trophies as the new harder requirements. Use the same coin/gem/XP economy and a once-only claim ledger.

Daily trial records, survival records, tournament clears, win-streak records and overall local profile statistics must say **On this device**. No fabricated opponents, scores or claims of global rankings. Global leaderboards require an authenticated authoritative backend, not a relabelled local array.

Gate: threshold boundaries, exactly-once rewards, load migrations, old trophy preservation, and local record ordering tested.

## Stage 7 — release QA

Run all original and expansion tests. Exercise every new activity and all old modes end-to-end; save/reload/invalid data/duplicate completion; attempt lockouts; character/ability invariance; entry/exit; desktop keyboard and phone-sized layouts. Test real iOS/Android before claiming device certification. State untested paths instead of calling them complete.

After each stage: report implemented changes, exact test totals, preview commit/link, browser interactions/viewports, remaining work and known limitations. Release only the verified candidate after user approval.

## Stage 2 implementation

Implemented on the Stage 2 branch (not production):
- CHALLENGES & EVENTS / CHALLENGE DOJO exposes only three populated categories: Daily Challenges, Survival Challenges, and Special Trials. Five activities are playable: Daily Discipline, Survival, Perfect Victory, Comeback, and Three Hands Master. Later empty categories are not displayed.
- Every trial uses existing RPS resolution and rival strategy functions; the existing classic resolver is unchanged. Real opponent introductions/tendencies, countdown selection, simultaneous reveal, round results, retry, save/return, resume, forfeit and exit are present. The saved fighter and original master appearances are reused.
- Existing one-free-Peek-per-match, paid additional Peeks, level/training Guard unlock and once-per-match Guard behavior are available in the new trials. No opponent uses a live selected player hand.
- Daily Discipline rotates focus hand/opponent by UTC date, consumes one of three entries on start, locks after success, and pays once per day with a capped 10–50-coin streak bonus. Yesterday's unfinished daily trial expires. It is separate from the unchanged classic daily activity.
- Survival continues until defeat or voluntary finish. Opponent adaptation/timing scale using existing rivals, with a 1.6-second choice-window floor. Rewards (15 coins + 8 XP, before existing upgrade/level bonuses) are paid only for wins beyond the previously rewarded personal best, not repeated farming of the same record.
- Perfect Victory requires three consecutive match wins; Comeback starts 0–2 against Oku; Master requires one winning point with each hand in a match. Non-daily trial completion rewards are first-clear only, with later practice explicitly labelled. No original trophy or reward is removed.
- Runs, scoring hands, deadlines, pause time, attempts, first-clear claims, clear counts, daily streaks, survival and challenge-streak records persist in the existing profile. New fields default for old saves. Saves migrate to version 3, protecting new fields from automatic overwrite by the version-2 Stage 1 loader. Displayed records are on-device, never global.
- New trials pause on manual request, save-and-return, or hidden-tab notification. A reload during an unpaused expired round resolves a missed selection rather than granting fresh time. Paused trials preserve remaining time. Classic match/cutscene background timing remains unchanged pending separate policy work.
- Responsive viewport-native main menu, Challenge Dojo, audio settings and legacy panels/creator/reward notices replace shrinking desktop menus. Existing combat/training/pot layouts are not redesigned.
- Restored spectator-bout entry, prediction/result/exit and once-only existing rewards. Added spectator pause/hidden-tab pause. Restored the skin shop category with original locks/costs/equip behavior.
- Saved separate music/SFX volume sliders, sound-effect test, music teardown, startup-listener cleanup and removal of fired classic HUD timeout handles. The original music-only toggle remains temporary.

Not implemented by this stage: new tournaments, new rival catalog entries, expanded rescue activities, rotating event catalog, expansion achievements/global leaderboards, cloud synchronization, real-device certification, save import UI, multi-tab save conflict protection, full classic pause/background policy, or a visual contact/locomotion overhaul. No disabled placeholder screens are labelled playable.
