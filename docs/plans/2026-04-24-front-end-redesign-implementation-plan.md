# Front-end redesign implementation plan

> For Hermes: apply frontend-design aesthetic choices while preserving current map/topic behavior and routing contracts.

Goal
- Redesign the GIS demo UI into a more premium Apple × Google hybrid presentation across the map page, folkways page, and toponymy page.

Architecture
- Keep the current routing and data flow unchanged. Concentrate changes in shared shell/surface components, global theme tokens, and visual composition inside the three main pages.

Tech stack
- React, TypeScript, Tailwind utility classes, existing shared UI components, Vitest, Testing Library

Tasks
1. Add failing assertions for new persistent section labels and premium-stage semantics on map/topic pages.
2. Update global style tokens and shell background treatment.
3. Upgrade shared hero/card primitives.
4. Redesign map workspace composition and panel styling.
5. Redesign folkways and toponymy page section composition.
6. Run targeted tests, then full tests, then build.

Scope guardrails
- Do not change query/filter semantics.
- Do not change primaryId link behavior.
- Do not add new data requirements.
- Do not optimize mock data quality in this task.
