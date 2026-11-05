# Shoulder-lift preview verification

Vercel preview builds (VERCEL_ENV=preview) also emit `/victory-preview.html`, a visual-only fixture using the real movie, Fighter, and a distinctive custom look. It starts paused on victory scene 1; press NEXT SCENE to inspect the shoulder lift, then resume to inspect its motion. No profile writes or rewards. Production builds retain only the main index entry and do not emit this fixture.

Regression coverage: duplicate paths removed; six students retain their normal hands; lift shot uses saved HTML avatar; frame/shoulder coordinates scale with SVG viewBox and letterbox offsets. Verify at desktop and phone dimensions. Actual user's wardrobe is not copied into this fixture; gameplay uses the saved avatar unchanged.

Add `?defeat` to inspect the opening defeat spotlight. Its name plaque is intentionally hidden; the saved avatar, caption, and other scene plaques remain.

The `?defeat` fixture uses the actual remaining defeat story shots. It now has three scenes: opening setback spotlight, Study the tells, closing recovery spotlight. The kneeling/master shot is deleted.

Add `?training` to check the actual Board-breaking Training component with no rewards/saves. Gold zone spans 35–65%; marker speed increases 20% per broken board, not per attempt. Five attempts and strength/XP payouts unchanged.

Use `?boards` for Bao's actual board-breaking shot. Resume to run its 3-second windup/contact/split/retract cycle. Shared animation clock controls the attached right arm and board split; hand center contacts the top board at 1200 ms. Pausing freezes that clock. No gameplay/rewards or saved character changes.

Progressive chop update: zone widths after 0–5 completed chops are 30%, 26%, 22%, 18%, 14%, 10%, paired with speeds 1.0×–2.0× in 0.2 increments. Both use completed attempts, including misses. Hit scoring uses the zone visible at strike time; the next stage applies after impact. Five attempts and rewards unchanged.
