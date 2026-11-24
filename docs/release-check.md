# Browser release check — November 13, 2026

This is a scoped release review, not a guarantee of zero defects or all-device support.

## Reproduced and corrected

- Pot challenge timing track collapsed in short windows: non-shrinking minimum-height track and top-aligned scroll panel (initial Jump Strike fix).
- Board-breaking training remained inside scaled artwork and used the same shrinkable flex-meter layout: render the training panel at the viewport, with unscaled scrollable content and a non-shrinking meter.
- Switching unfinished pot modes retained the old marker/sample: reset both state and ref positions, action lock and animation on each fresh run.
- Pot/training Space handlers swallowed focused-button and text input: preserve native button activation and typing; global Space still operates from the game background.
- Winning Tower/ladder results and championship screens lacked a menu exit: add Back to Dojo without replaying/claiming results.
- Paused unfinished matches had no exit: explicitly forfeit through the validated loss boundary, clear pending combat timers and restore title state. Daily forfeit consumes the attempt; it never grants a win or a box. Completed final-round scores must resume their result rather than submit a contradictory forfeit.

## Automated review

Run `npm test` and `npm run build` before packaging. Coverage includes:
- All three pots: moving marker, hit boundaries, speed, five successful attempts, exactly one result, replay, mode switching, saved separate bests, focused keyboard targets and responsive fighter rendering.
- Board training: five attempts and single result submission, shrinking target, speed, saved strength/XP rules and non-collapsing viewport meter.
- Classic matches: assisted odds, locked CPU, Peek, Daily legality, pause/resume, timeout, typing and resize. Tower victory can return; forfeit paths for ladder/Tower/Daily/rescue submit valid idempotent losses with no victory currency/XP/boxes.
- Existing creator/catalog/shop, earned-only boxes, trophy/reward rules, Academy/challenge rules, saves/backup/recovery/blocked storage, notices, art and package-integrity suites remain enabled.
- Dependency audit reports zero known vulnerabilities at review time; it is not a complete security audit.

## Packaging gate

Only after tests/build and the release-preview checks: run `npm run package:itch`. Check ZIP CRCs, root `index.html`, relative entry and bundled imports, byte equality with `dist`, and unique paths/content. Deliver only the final ZIP, not source, node_modules or old runtime exports.

## Remaining verification

Use the actual itch.io preview iframe before publishing. Physical Android/iOS touch, Safari audio policies, listening quality, lengthy sessions, every authored cutscene, every earned cosmetic and every Academy activity require further human/device testing. Browser-simulated tests do not establish those outcomes. External analytics/AdSense/support services are unchanged and not verified. Saves remain local to each browser/origin; do not clear player storage during testing. GitHub PR verification notes record the exact preview commit, viewports and flows actually checked.
