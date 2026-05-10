# Front-end redesign design

Goal
- Upgrade the GIS demo into a polished Apple × Google hybrid frontend with stronger product-grade presence across the map page and two topic pages, without changing existing query, routing, or primaryId-driven behavior.

Confirmed direction
- Tone: hybrid of Google clarity and Apple polish
- Priority surfaces: map page + folkways page + toponymy page
- Strength: obvious redesign, not just polish
- First impression: premium product feel

Design principles
1. Keep existing business flow intact: filters, primaryId linkage, URL sync, topic-to-map jumpback.
2. Increase stage presence: stronger hero composition, cleaner hierarchy, clearer sections, richer card depth.
3. Move from “blue-white demo shell” to “mist white / cool gray blue / ink text / restrained luminous accents”.
4. Prefer product-grade restraint over flashy motion. Use subtle gradients, layered shadows, glassy surfaces, refined spacing, and stronger typographic hierarchy.
5. Keep demo-readability high: no visually noisy ornament that competes with data.

Target visual system
- Background: soft mist gradient with faint radial highlights
- Surfaces: translucent white cards with layered borders and softer shadows
- Accent model: one cool blue primary plus warm pearl highlights for premium feel
- Typography: stronger display treatment in hero headings, cleaner metric emphasis, calmer secondary copy
- Interaction: slightly elevated hover states, segmented controls, pill chips, clearer CTA affordances

Planned implementation
1. Shared visual system
- Update src/shared/styles/index.css tokens for new background, border, shadow, and text hierarchy
- Introduce reusable ambient background layers in SiteShell
- Upgrade SurfaceCard and PageHero into more premium, asymmetric stage components

2. Map page redesign
- Recompose hero into a flagship product-intro section
- Make map canvas the visual anchor with stronger framing
- Turn filters into a premium control deck rather than a plain form stack
- Improve tabs, counts, loading/status text, and detail panel hierarchy

3. Topic page redesign
- Recompose both topic pages into editorial product sections: lead hero, metrics strip, insight cards, featured villages, CTA return path
- Use shared layout language with page-specific tone differences

4. Safety boundaries
- No new data dependencies
- No new map analytics behavior
- No change to query semantics or primaryId contract
- No dependence on final cleaned data

Verification plan
- Extend page/component tests only where redesign introduces new semantic section labels or persistent content expectations
- Run targeted tests for map/topic/shared surfaces
- Run full test suite and build
