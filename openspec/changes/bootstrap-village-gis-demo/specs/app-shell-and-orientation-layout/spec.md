## ADDED Requirements

### Requirement: App shell SHALL expose four leader-facing primary destinations
The system SHALL provide the primary destinations `课题简介`、`村庄地图`、`特色民俗`、`村名地理` in the shared application shell, and `/` MUST redirect to `课题简介`.

#### Scenario: Landing on the root path
- **WHEN** a user opens `/`
- **THEN** the system redirects the user to `/overview`

#### Scenario: Rendering the shared navigation
- **WHEN** any primary page is rendered
- **THEN** the shared shell displays links for all four destinations

### Requirement: Page structure MUST switch by orientation instead of width breakpoints
The system MUST derive the main page structure from `portrait` or `landscape` orientation and MUST NOT rely on width breakpoint tiers to choose the shell or map layout.

#### Scenario: Portrait mode layout
- **WHEN** the application is rendered in portrait orientation
- **THEN** the shell and page sections stack vertically with the map detail content placed below the map area

#### Scenario: Landscape mode layout
- **WHEN** the application is rendered in landscape orientation
- **THEN** the shell and map workspace render side-oriented panels suitable for simultaneous map, filter, and detail viewing

### Requirement: Supporting pages SHALL present leader-readable narrative content
The `课题简介`、`特色民俗`、`村名地理` pages SHALL present narrative cards and summary content that can be explained without backend setup.

#### Scenario: Opening overview content
- **WHEN** a user opens `课题简介`
- **THEN** the page shows project framing, summary metrics, and a map-entry path that leads into the main GIS page

#### Scenario: Opening supporting content pages
- **WHEN** a user opens `特色民俗` or `村名地理`
- **THEN** the page shows village-linked story cards and preserves a return path to the map using `primaryId`
