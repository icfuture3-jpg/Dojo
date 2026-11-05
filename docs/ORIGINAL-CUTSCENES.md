# Distinct cutscene stories

The finite story catalog now has 47 authored shots: 12 introductory master shots, 16 opponent win/loss outcomes, one championship celebration, and 18 location-specific rescue intro/win/loss shots. No generic spotlight entrance, celebration or closing is automatically appended. The shoulder lift belongs only to the championship.

Master outcomes differ in both story and props: Bao’s stand/sash versus barred door; Mei’s turning mirrors versus curtain; Ren’s scroll/brush versus unmarked stones; Oku’s ringing bell/open doors versus rain basin/staff. Rescue locations use bamboo braces, medicine ferry, iron gate wheel, ceremonial kites, storm conductor and lunar disk/key, with separate threat, restored and setback actions.

Same match replay intentionally replays its own authored sequence; Tower and Daily use the named opponent’s own result, including Jun, Kai, Rin and Void Sage; repeat encounters reuse that opponent’s result (not infinitely generated new movies). Shared rendering primitives, stages and character art are retained. New sequence shots use the saved avatar HTML layer once, without the name plaques the user removed. Existing intro scenes retain their own story content including Bao's synchronized strike.

Preview fixture: `/victory-preview.html?dojo=0&kind=win`, `?dojo=1&kind=lose`, `?champion`, `?intro&dojo=2`, or `?rescue&dojo=5&kind=intro`. Starts paused for inspection, resume for prop motion. No gameplay or save mutation. Build emits fixture only for preview deployments.

Tests compare IDs, captions, rendered story compositions, master/dojo action coverage, no injected duplicate frames, and saved avatar count. Shared props alone do not establish uniqueness; inspect representative visual stories as well.
