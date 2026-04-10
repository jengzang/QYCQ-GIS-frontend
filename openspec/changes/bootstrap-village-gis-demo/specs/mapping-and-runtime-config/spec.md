## ADDED Requirements

### Requirement: Runtime configuration SHALL support mock, local API, and remote API profiles
The system SHALL support three runtime profiles for the village app: `mock`, `local API`, and `remote API`, and it SHALL choose the active profile through runtime configuration rather than page-level code changes.

#### Scenario: Running in mock profile
- **WHEN** the app runs in the development mock profile
- **THEN** the repository reads village data and facets from generated mock JSON assets

#### Scenario: Running in local API profile
- **WHEN** the app runs in the local API profile
- **THEN** the repository reads village data and facets from the configured local API base URL

#### Scenario: Running in remote API profile
- **WHEN** the app runs in the remote API profile
- **THEN** the repository reads village data and facets from the configured remote API base URL

### Requirement: Repository output MUST normalize mock and API records into one front-end model
The system MUST adapt both mock and API responses into the same `VillageRecord` model, including `primaryId`.

#### Scenario: Reading from different backends
- **WHEN** the front end loads village records from either mock JSON or API responses
- **THEN** components receive the same normalized village model shape and can resolve village selection through `primaryId`

### Requirement: Core presentation rules SHALL be editable through centralized mapping modules
The system SHALL define routes, query parameters, theme tokens, dialect mappings, timeline mappings, layer ids, and primary-id rules in centralized mapping or config modules.

#### Scenario: Updating a configured rule
- **WHEN** a maintainer changes a supported mapping or runtime config entry
- **THEN** the application behavior updates through that mapping layer without requiring the maintainer to rewrite page-specific entity logic

### Requirement: Map rendering SHALL support a local fallback style
The system SHALL render the village map even when no external MapLibre style URL has been configured.

#### Scenario: Missing external map style URL
- **WHEN** `VITE_MAP_STYLE_URL` is not provided
- **THEN** the map uses a local fallback style and still renders village points, layers, and selection state
