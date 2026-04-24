## ADDED Requirements

### Requirement: The system SHALL provide analytics views for village population and classification data
The system SHALL support analytics views for total population, gender composition, ethnicity distribution, language distribution, and economy-category distribution using the currently available village dataset.

#### Scenario: Opening analytics with active filters
- **WHEN** a user opens analytics after applying filters
- **THEN** the analytics view reflects the filtered village subset

### Requirement: The system SHALL generate non-spatial chart outputs without requiring authoritative coordinates
The system SHALL provide chart-based reporting such as bar charts and pie charts without depending on real longitude and latitude data.

#### Scenario: Viewing chart reports under temporary geometry mode
- **WHEN** the project is still using generated Guangdong fallback points
- **THEN** standard non-spatial charts remain valid for acceptance

### Requirement: Heatmap-style spatial analytics MUST depend on authoritative geometry
The system MUST treat heatmaps and other coordinate-sensitive spatial analytics as formally complete only when authoritative village coordinates are available.

#### Scenario: Temporary geometry is still in use
- **WHEN** the system runs with generated fallback points only
- **THEN** any heatmap or density visualization is considered demo-only and not accepted as authoritative spatial analysis

### Requirement: The system SHALL support exporting analytics results
The system SHALL support exporting analytics results derived from the current filtered village subset.

#### Scenario: Exporting filtered analytics
- **WHEN** a user exports analytics after applying filters
- **THEN** the exported result reflects the currently filtered subset and selected metrics
