# Portal homepage reframe design

Goal
- Reframe the current GIS demo from a demo-first presentation shell into a normal portal-style website with four stable top-level sections: 课题简介, 村庄地图, 特色民俗, 村名地理.
- Keep the existing routing, data flow, map behavior, query params, and topic-to-map jump behavior intact while changing the site’s information architecture, page voice, and visual hierarchy.

Confirmed direction
- Site type: 门户型
- Navigation: 课题简介 / 村庄地图 / 特色民俗 / 村名地理
- Home page role: 课题简介
- Home content model: mixed
  - upper half = 课题介绍
  - lower half = 门户导览
- Implementation scope: medium redesign, not a rebuild
- Visual tone: organic / natural / warm / restrained / real website

Problems to solve
1. The current header behaves like a demo command deck instead of a normal site header.
2. Shared hero sections read like product-launch or AI-generated showcase copy.
3. The overview page behaves like a presentation brief, not a portal home page.
4. The map page explains itself too much instead of letting the map be the main experience.
5. Folkways and toponymy pages read like design-explainer topic demos rather than content columns in a single site.

Design principles
1. Preserve the four-page route structure already in place.
2. Preserve all existing data sources and map query semantics.
3. Replace demo/explainer wording with normal website/content wording.
4. Reduce visual overstatement: less glow, less stage-like hero behavior, lighter shadows, calmer surfaces.
5. Make the home page serve both as project introduction and as the main portal entry.
6. Make the map page the functional core without forcing every page to feel like a system dashboard.
7. Keep the whole site visually unified; topic pages may vary slightly in tone but must still feel like the same site.

Target information architecture
1. Global header
- Left side: site title / project title with a short subtitle if needed
- Right side: horizontal text navigation for the four sections
- Remove the current large title + large description + navigation-card composition from the shared shell
- Remove or strongly reduce nav hint prominence

2. Home page (课题简介)
- Role 1: explain what the project is
- Role 2: guide users into the three main content/function sections
- Upper section:
  - project title
  - concise project summary
  - one primary CTA to 村庄地图
  - one secondary CTA to 特色民俗 or 村名地理
  - one lightweight data overview block
- Lower section:
  - section entry cards for 村庄地图 / 特色民俗 / 村名地理
  - project overview content blocks such as 研究对象 / 数据内容 / 浏览方式
  - representative village cards based on existing village sample data

3. Map page
- Behave like a normal functional column page
- Keep a light page header only: title + short explanation
- Reduce or remove heavy metric-panel presentation
- Let MapWorkspace dominate the page visually
- Remove self-explaining copy such as layout strategy and demo-mode wording

4. Folkways page
- Behave like a content column page
- Keep data-driven featured villages and existing content basis
- Replace “专题导览 / 洞察 / 产品化栏目 / 演示节奏” style language with normal column language
- Structure should become:
  - light page header
  - column introduction / grouped highlights
  - featured villages

5. Toponymy page
- Mirror the folkways column structure
- Keep the naming-classification logic and map jumpback
- Replace design-presentation wording with calm interpretive language about place names and geography

Target visual system
- Base colors: mist white, paper white, gray-blue, muted ink, soft earth/warm accents
- Surfaces: lighter cards that feel like content containers, not glossy product panels
- Borders: subtler and more consistent
- Shadows: shallower and softer
- Background: keep gentle layering, but remove most of the current glowing/deck-like atmosphere
- Typography: calmer headline scale, more editorial/body-content balance, less product-launch emphasis

Component-level implementation plan
1. src/shared/ui/SiteShell.tsx
- Replace current oversized header composition with a compact portal header
- Keep page container and background framing, but reduce decorative stage effect
- Render navigation as a normal horizontal nav with active-state emphasis instead of large card tiles

2. src/shared/ui/PageHero.tsx
- Convert from large promo-stage section into a lighter page-intro component
- Keep support for title/description/metrics, but allow the component to render more compactly by default
- Metrics should read as a lightweight summary, not a KPI stack
- The overview page may still use the richest version of the component; other pages should be visually shorter

3. src/shared/styles/index.css
- Retune global color tokens, border tokens, and shadow tokens toward a warmer, more natural portal aesthetic
- Keep enough contrast and clarity for map/data readability

4. src/pages/overview/OverviewPage.tsx
- Rewrite from “demo overview” to “project introduction + portal guide”
- Remove sections like 演示节奏 and data-proof style copy
- Reorganize into:
  - intro hero
  - section navigation cards
  - project overview content blocks
  - representative village cards

5. src/pages/map/MapPage.tsx
- Keep all query and selection logic untouched
- Replace the current hero wording with a compact functional intro
- Reduce metrics to only content-relevant summaries if they remain at all

6. src/pages/folkways/FolkwaysPage.tsx
- Keep village-derived metrics and featured card mechanics
- Rewrite copy and section hierarchy to feel like a normal content column
- Reduce demo-storytelling language and over-explicit product framing

7. src/pages/toponymy/ToponymyPage.tsx
- Apply the same structural shift as folkways
- Keep category logic and village cards
- Rewrite copy to feel like place-name interpretation content rather than design exposition

Content voice migration
Replace wording patterns such as:
- demo
- 展示节奏
- 产品化
- 回跳方式
- 对接边界
- insight section
- 专题升级

With wording patterns such as:
- 栏目
- 浏览
- 查看
- 了解
- 内容
- 地图入口
- 代表村落
- 命名线索
- 民俗内容

Safety boundaries
- No route changes
- No API contract changes
- No query-param semantic changes
- No MapWorkspace behavior redesign in this pass
- No new dependencies required
- No cleanup-driven restructuring outside the touched surfaces

Verification plan
- Update or add tests only where visible structure or persistent labels change materially
- Run targeted tests around shared UI/page surfaces if applicable
- Run project build to confirm the redesign compiles successfully
- Do a final manual review for wording consistency so no obvious demo-language remnants remain on the touched pages

Out of scope for this pass
- Changing map interaction model
- Reworking village data shape
- Adding new portal sections beyond the four confirmed tabs
- Introducing heavy motion, illustration systems, or decorative branding assets
