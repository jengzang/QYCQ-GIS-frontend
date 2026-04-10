## ADDED Requirements

### Requirement: Village map SHALL provide three modes within one page
The system SHALL implement `村庄检索`、`源流迁徙`、`方言分布` as three switchable modes within the single `/map` page.

#### Scenario: Switching map mode
- **WHEN** a user changes the map mode
- **THEN** the `/map` page remains active and updates its controls, legend, and data presentation for the selected mode

### Requirement: Village selection MUST be driven by primaryId
The system MUST use `primaryId` as the only village selection key for map clicks, list interactions, detail rendering, URL state, and cross-page navigation.

#### Scenario: Selecting from map or list
- **WHEN** a user clicks a village point or a village list item
- **THEN** the selected village detail is resolved through the village `primaryId`

#### Scenario: Restoring selected village from URL
- **WHEN** a user opens `/map` with a `primaryId` query parameter
- **THEN** the page restores the selected village using that `primaryId`

#### Scenario: Returning from supporting pages
- **WHEN** a user enters `/map` from `特色民俗` or `村名地理`
- **THEN** the destination page carries the village `primaryId` and opens the corresponding village context

### Requirement: Search mode SHALL support administrative and free-text filtering
The `村庄检索` mode SHALL support free-text matching and administrative filtering by `归属市` and `归属镇`.

#### Scenario: Filtering by keyword
- **WHEN** a user enters a keyword
- **THEN** the map result set is filtered by searchable village text including village name, location, and dialect-related text

#### Scenario: Filtering by administrative fields
- **WHEN** a user selects a city or town filter
- **THEN** the result set only contains villages matching the selected administrative field values

### Requirement: Timeline mode SHALL reveal villages by sortable year
The `源流迁徙` mode SHALL filter visible villages by a timeline end year derived from the village timeline metadata.

#### Scenario: Moving the timeline
- **WHEN** a user moves the timeline control to a year value
- **THEN** the map result set contains villages whose `sortYear` is less than or equal to that year, while villages with unknown years remain distinguishable as incomplete timeline data

### Requirement: Dialect mode SHALL color villages by dialect group
The `方言分布` mode SHALL color map villages by `dialectGroup` and display a legend consistent with the configured dialect mapping.

#### Scenario: Viewing dialect distribution
- **WHEN** a user opens `方言分布`
- **THEN** the map applies dialect-based colors and the page shows a dialect legend aligned with the configured dialect groups
