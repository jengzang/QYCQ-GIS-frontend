## ADDED Requirements

### Requirement: The system SHALL support topic-oriented village presentation beyond the overview map flow
The system SHALL support topic-oriented presentation for village folkways, traditional dwellings, specialty products, notable people, and toponymy-related content while preserving navigation back to the village map context.

#### Scenario: Opening a topic view and returning to the map
- **WHEN** a user enters a topic-oriented view for a village
- **THEN** the system preserves a route back to the corresponding village map context through `primaryId`

### Requirement: The system SHALL support timeline-based topic storytelling for migration or language narratives
The system SHALL support timeline-based presentation for migration or language-story narratives, while distinguishing simple filter-by-year behavior from richer narrative playback behavior.

#### Scenario: Showing language or migration chronology
- **WHEN** a user opens the chronology-oriented topic mode
- **THEN** the system provides an explicit timeline presentation rather than only a static detail card

### Requirement: Nearby-village queries MUST depend on authoritative geometry
The system MUST treat nearby-village queries and distance-sensitive neighborhood analysis as dependent on authoritative geometry.

#### Scenario: Temporary geometry is still in use
- **WHEN** the project still relies on generated Guangdong fallback points
- **THEN** nearby-village queries are not accepted as formally accurate spatial results
