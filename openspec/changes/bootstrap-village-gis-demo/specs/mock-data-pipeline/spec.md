## ADDED Requirements

### Requirement: Mock pipeline SHALL convert the village workbook into front-end JSON assets
The system SHALL provide a script that reads `data/Village.xlsx` and generates mock JSON assets for village records and filter facets.

#### Scenario: Building mock data
- **WHEN** the mock build script is executed
- **THEN** the system writes `public/mock/villages.json` and `public/mock/facets.json`

### Requirement: Mock records MUST preserve source fields and expose the front-end village contract
Each generated mock village record MUST preserve the original source fields under `raw`, MUST expose the summary fields required by the front-end village contract, and MUST add only the minimal derived fields required for interaction: `primaryid`, `geometry`, `searchText`, `dialectGroup`, and timeline sorting metadata.

#### Scenario: Reading a generated village record
- **WHEN** the front end consumes a generated mock record
- **THEN** the record exposes original source fields under `raw` alongside the minimal derived fields required for rendering and interaction

### Requirement: Mock pipeline MUST generate deterministic primaryid and fallback coordinates
The system MUST generate a deterministic string `primaryid` and a deterministic WGS84 point inside Guangdong whenever the source workbook does not provide usable geometry.

#### Scenario: Rebuilding the same workbook
- **WHEN** the same workbook row is converted multiple times
- **THEN** the generated `primaryid` and fallback point remain stable across runs

#### Scenario: Missing coordinate data
- **WHEN** a workbook row has no longitude and latitude geometry data
- **THEN** the generated mock record still includes a valid WGS84 point located inside the configured Guangdong bounds

### Requirement: Mock pipeline SHALL tolerate incomplete worksheet values
The mock pipeline SHALL continue generating output when optional village fields are empty, malformed, or absent.

#### Scenario: Missing language or time values
- **WHEN** a workbook row lacks dialect text or build-time text
- **THEN** the pipeline still emits a village record with safe fallback values for dialect grouping and timeline sorting
