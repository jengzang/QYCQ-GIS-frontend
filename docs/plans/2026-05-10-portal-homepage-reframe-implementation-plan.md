# Portal Homepage Reframe Implementation Plan

> For Hermes: frontend-design is already required for this UI plan. Execute with strict TDD for code-bearing tasks.

Goal: Turn the current GIS demo shell into a portal-style site whose home page is 课题简介 and whose other three pages behave like normal site columns rather than demo/explainer pages.

Architecture: Keep the existing four-route structure, data hooks, URL/query semantics, and map workspace behavior. Concentrate changes in shared visual primitives (global tokens, shell, page hero, card tone) and in page-level content structure/copy so the redesign lands without destabilizing map logic.

Tech Stack: React 19, React Router 7, TypeScript, Tailwind 4 utilities, Vitest, Testing Library, Vite.

---

### Task 1: Add a homepage regression test for the new portal content

Objective: Lock in the new overview page role before changing production code.

Files:
- Create: `src/pages/overview/OverviewPage.test.tsx`
- Read: `src/pages/overview/OverviewPage.tsx`

Step 1: Write failing test

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, vi } from 'vitest';

vi.mock('@/shared/lib/orientation', () => ({
  useOrientationMode: () => 'landscape',
}));

const villages = [/* fixture villages with one sample card */];

vi.mock('@/entities/village/api/hooks', () => ({
  useVillageFacetsQuery: () => ({
    data: { dialectGroups: ['德庆话', '广宁话'], towns: ['高良镇', '白土镇'] },
  }),
  useVillagesQuery: () => ({ data: villages }),
}));

import { OverviewPage } from './OverviewPage';

describe('OverviewPage', () => {
  test('renders the portal-style project intro and section navigation', () => {
    render(
      <MemoryRouter>
        <OverviewPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: '课题简介' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /进入村庄地图/i })).toHaveAttribute('href', '/map');
    expect(screen.getByText('栏目导览')).toBeInTheDocument();
    expect(screen.getByText('研究对象')).toBeInTheDocument();
    expect(screen.getByText('代表村落')).toBeInTheDocument();
    expect(screen.queryByText('演示节奏')).not.toBeInTheDocument();
  });
});
```

Step 2: Run test to verify failure

Run: `npm test -- --run src/pages/overview/OverviewPage.test.tsx`
Expected: FAIL because the file does not exist yet and/or the page does not render the new portal labels.

Step 3: Do not change production code yet

No production code in this task.

Step 4: Commit after the full redesign is complete

Commit later together with related page/test updates.

### Task 2: Update topic-page tests to the new column-page wording

Objective: Lock in the new information architecture for folkways and toponymy before changing those pages.

Files:
- Modify: `src/pages/folkways/FolkwaysPage.test.tsx`
- Modify: `src/pages/toponymy/ToponymyPage.test.tsx`

Step 1: Write failing test expectations

Change expectations away from demo wording and toward new stable labels such as:
- folkways: `栏目导语`, `民俗内容`, `精选村庄`
- toponymy: `栏目导语`, `命名线索`, `精选村庄`

Keep existing assertions for:
- full-count metrics
- six featured cards only
- map jump links
- village content rendering

Step 2: Run tests to verify failure

Run: `npm test -- --run src/pages/folkways/FolkwaysPage.test.tsx src/pages/toponymy/ToponymyPage.test.tsx`
Expected: FAIL because production pages still render the old demo labels.

Step 3: Do not change production code yet

No production code in this task.

Step 4: Commit later with the redesign

### Task 3: Update shared content copy to portal language

Objective: Replace demo-first copy at the source so page components can render cleaner portal content.

Files:
- Modify: `src/shared/lib/demo-content.ts`

Step 1: Write minimal content changes

Update the exported copy/content objects so they express:
- overview page as project introduction / portal guide
- map page as normal map column intro
- folkways/toponymy pages as calm content-column intros
- overview cards as `研究对象 / 数据内容 / 浏览方式`
- folkways/toponymy highlight cards with calmer content labels

Step 2: Keep data structures stable

Do not change type shapes used by existing pages.

Step 3: Run targeted tests after implementation

Run later once the page components consume the new copy.

### Task 4: Refactor SiteShell into a compact portal header

Objective: Remove the demo-command-deck header and replace it with a normal website shell.

Files:
- Modify: `src/shared/ui/SiteShell.tsx`
- Read: `src/shared/mappings/nav-mapping.ts`

Step 1: Simplify the shell header

Implement:
- compact top header
- left-aligned project/site title with short subtitle
- right-aligned nav links
- no large nav cards

Step 2: Keep route behavior untouched

Do not alter route paths or active-link behavior.

Step 3: Preserve responsive behavior

Portrait can stack the nav under the title, but still as a compact header instead of tile cards.

### Task 5: Rework PageHero into a lighter page intro component

Objective: Make shared heroes feel like page intros rather than launch-stage sections.

Files:
- Modify: `src/shared/ui/PageHero.tsx`
- Optionally modify: `src/shared/ui/SurfaceCard.tsx`

Step 1: Reduce visual weight

Implement:
- lighter container styling
- calmer title scale
- lighter summary area
- metrics rendered as a compact summary row/grid instead of a heavy side stack

Step 2: Keep overview page compatible

The component must still support richer child content for the home page.

### Task 6: Retune global tokens for the natural portal aesthetic

Objective: Shift the whole site away from glossy demo lighting.

Files:
- Modify: `src/shared/styles/index.css`

Step 1: Update CSS variables

Retune:
- background colors
- text hierarchy
- border colors
- shadows
- selection color if needed

Step 2: Keep map readability intact

Do not reduce contrast so far that map controls or card content become muddy.

### Task 7: Rewrite OverviewPage into project intro + portal guide

Objective: Make `/overview` behave like the real home page.

Files:
- Modify: `src/pages/overview/OverviewPage.tsx`
- Test: `src/pages/overview/OverviewPage.test.tsx`

Step 1: Keep existing data hooks

Continue using village count and facet count data.

Step 2: Recompose sections

Implement these sections in order:
- intro hero with CTA(s)
- section navigation cards
- project overview blocks (`研究对象 / 数据内容 / 浏览方式`)
- representative village cards

Step 3: Remove demo-only sections

Delete content blocks such as:
- 演示节奏
- data-proof wording
- project-goal / interface-boundary demo framing

Step 4: Run the overview test

Run: `npm test -- --run src/pages/overview/OverviewPage.test.tsx`
Expected: PASS

### Task 8: Rewrite MapPage hero copy without touching map logic

Objective: Make `/map` feel like a functional column page while leaving all behavior intact.

Files:
- Modify: `src/pages/map/MapPage.tsx`
- Modify if needed: `src/shared/lib/demo-content.ts`
- Test: `src/pages/map/MapPage.test.tsx`

Step 1: Preserve all query/state logic

Do not alter:
- `resolveMode`
- timeline parsing
- query updates
- primaryId selection handling
- `MapWorkspace` props contract

Step 2: Simplify the page intro

Reduce the hero to:
- title
- short explanation
- content-relevant summaries only

Step 3: Re-run map regression tests

Run: `npm test -- --run src/pages/map/MapPage.test.tsx`
Expected: PASS

### Task 9: Rewrite FolkwaysPage into a normal content column

Objective: Replace demo-topic framing with calmer column-page structure.

Files:
- Modify: `src/pages/folkways/FolkwaysPage.tsx`
- Test: `src/pages/folkways/FolkwaysPage.test.tsx`

Step 1: Keep data-driven featured-village logic

Preserve:
- all villages used for metrics
- featured slice of six
- map jump links

Step 2: Recompose sections

Implement:
- light page intro
- `栏目导语`
- `民俗内容`
- `精选村庄`
- optional small closing note only if it reads like normal site content

Step 3: Run test

Run: `npm test -- --run src/pages/folkways/FolkwaysPage.test.tsx`
Expected: PASS

### Task 10: Rewrite ToponymyPage into a normal content column

Objective: Mirror the folkways shift while preserving naming-category behavior.

Files:
- Modify: `src/pages/toponymy/ToponymyPage.tsx`
- Test: `src/pages/toponymy/ToponymyPage.test.tsx`

Step 1: Keep data-driven featured-village logic

Preserve:
- all villages used for metrics
- naming-category calculation
- featured slice of six
- map jump links

Step 2: Recompose sections

Implement:
- light page intro
- `栏目导语`
- `命名线索`
- `精选村庄`

Step 3: Run test

Run: `npm test -- --run src/pages/toponymy/ToponymyPage.test.tsx`
Expected: PASS

### Task 11: Run focused verification and build

Objective: Prove the redesign works before claiming completion.

Files:
- Verify only

Step 1: Run targeted page tests

Run:
`npm test -- --run src/pages/overview/OverviewPage.test.tsx src/pages/map/MapPage.test.tsx src/pages/folkways/FolkwaysPage.test.tsx src/pages/toponymy/ToponymyPage.test.tsx`

Expected: PASS

Step 2: Run full build

Run:
`npm run build`

Expected: exit 0

Step 3: Review wording drift

Search for untouched demo-language remnants in touched files and remove obvious survivors.

### Task 12: Commit only the scoped redesign files

Objective: Record the redesign cleanly without sweeping unrelated dirty-tree changes.

Files:
- Stage only files touched for this portal redesign

Step 1: Review diff

Run: `git status --short` and `git diff --stat`

Step 2: Stage only relevant files

Example:
`git add docs/plans/2026-05-10-portal-homepage-reframe-implementation-plan.md src/shared/lib/demo-content.ts src/shared/styles/index.css src/shared/ui/SiteShell.tsx src/shared/ui/PageHero.tsx src/shared/ui/SurfaceCard.tsx src/pages/overview/OverviewPage.tsx src/pages/overview/OverviewPage.test.tsx src/pages/map/MapPage.tsx src/pages/folkways/FolkwaysPage.tsx src/pages/folkways/FolkwaysPage.test.tsx src/pages/toponymy/ToponymyPage.tsx src/pages/toponymy/ToponymyPage.test.tsx`

Step 3: Commit

```bash
git commit -m "feat: reframe gis site as portal homepage"
```
