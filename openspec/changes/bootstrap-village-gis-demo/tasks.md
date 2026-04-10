## 1. Repository Setup

- [ ] 1.1 Initialize the Vite + React + TypeScript project scaffold and baseline repository files
- [ ] 1.2 Add Tailwind, MapLibre, React Query, router, testing, and typing dependencies
- [ ] 1.3 Configure TypeScript, Vite, Vitest, Playwright, and shared path aliases

## 2. OpenSpec Artifacts

- [ ] 2.1 Write the proposal for the GIS demo bootstrap change
- [ ] 2.2 Write the design document covering architecture, orientation strategy, primaryId, and runtime data decisions
- [ ] 2.3 Add spec deltas for app shell, village map, mock data pipeline, and mapping/runtime config
- [ ] 2.4 Add an implementation task checklist for the change

## 3. Mock Data Pipeline

- [ ] 3.1 Implement the Python workbook reader for `data/Village.xlsx`
- [ ] 3.2 Generate deterministic `primaryid`, fallback Guangdong WGS84 points, dialect groups, and timeline sort years
- [ ] 3.3 Emit `public/mock/villages.json` and `public/mock/facets.json`
- [ ] 3.4 Add Python tests for deterministic output and missing-field tolerance

## 4. Mapping And Config Layer

- [ ] 4.1 Create centralized mappings for route, nav, query param, theme, dialect, timeline, map layer, runtime source, village field, and primary-id rules
- [ ] 4.2 Add runtime config that resolves mock or API source selection from environment variables
- [ ] 4.3 Add unit tests for the mapping and runtime modules that encode project invariants

## 5. Village Domain And Repository

- [ ] 5.1 Define the `VillageRecord`, API record, query, and facets contracts
- [ ] 5.2 Implement adapters that normalize mock and API data into the shared front-end village model
- [ ] 5.3 Implement the repository abstraction for list, getByPrimaryId, and facets access
- [ ] 5.4 Add filtering helpers and unit tests for search, admin filters, timeline, and dialect filters

## 6. App Shell And Shared UI

- [ ] 6.1 Build the app providers, router, and root application entry
- [ ] 6.2 Build the shared shell, page hero, surface card, metric card, and global style tokens
- [ ] 6.3 Implement orientation utilities so page skeletons switch by portrait or landscape mode

## 7. Village Map Experience

- [ ] 7.1 Build the `/map` page with URL-driven mode, filter, year, and `primaryId` state
- [ ] 7.2 Build the map workspace with search, timeline, and dialect modes on one page
- [ ] 7.3 Integrate MapLibre layers, local fallback style, point selection, and detail rendering via `primaryId`
- [ ] 7.4 Add component and integration tests for portrait and landscape map behavior

## 8. Supporting Pages

- [ ] 8.1 Build the `课题简介` page with live metrics and entry links to the map page
- [ ] 8.2 Build the `特色民俗` page with village-linked content cards
- [ ] 8.3 Build the `村名地理` page with village-linked naming and location cards

## 9. Verification

- [ ] 9.1 Run mock generation and verify emitted assets
- [ ] 9.2 Run unit tests for TypeScript and Python code
- [ ] 9.3 Run production build verification for default and serve modes
- [ ] 9.4 Validate the OpenSpec change after all artifacts are written
