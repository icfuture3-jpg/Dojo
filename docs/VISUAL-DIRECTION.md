# Cinematic cutout visual direction

Reference: the supplied martial-arts illustration's warm dojo light, cyan/gold/green energy sweeps and dramatic presentation, combined with the existing game's simple cutout figures, bold outlines and comic reactions. This is a shared first visual pass, not a claim of fully redrawn animation or true 3D.

## Implemented
- Original SVG Three Hands crest and illustrated dojo backing for the main menu. No image copied from a TV series; no external image/font/CDN dependency.
- Shared dark wood, aged gold and warm parchment color language across viewport menus, creator/shop/mission/trophy/rank panels, challenge cards and audio settings.
- Stronger paper-cutout silhouettes and flatter character shading, using the existing saved appearance, original faces, proportions, equipment and pose hierarchy. Loss desaturation remains.
- Decorative warm/cool lighting and perspective mat overlay in the original gameplay arena; hand-tinted energy ribbons at the existing reveal/result states. No hitbox or outcome changes.
- Shared lighting/energy treatment for cutscenes, Challenge Dojo arenas and finishers. Training and pot-challenge panels receive the same wood/gold framing.
- The illustrated shop upgrade tab remains intact.
- Decorative SVGs are pointer-inert and hidden from accessibility output; the crest has a readable label. Reduced-motion rules suppress the added energy animation and shared character/arena animation, without modifying any game countdown or simulation state.

## Preservation
No changes to RPS rules, AI choices, outcome timing, abilities, currencies/prices, unlocks, save format or progression. No new game dependencies. Effects use finite CSS animations and bounded vector paths, not an additional frame loop.

## Limits and release gate
This pass reuses existing poses; it does not implement new choreography, mesh/3D lighting, procedural attacks, sound changes, multiplayer or new content. Full visual inspection across every character/costume, rescue/campaign scene and result remains necessary. Existing classic phone gameplay/training scaling limitations remain. The inherited bundle-size warning remains visible; FPS has not been measured. Publish only to preview until approved.
