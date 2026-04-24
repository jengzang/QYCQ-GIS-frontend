## ADDED Requirements

### Requirement: Village query SHALL support additional business filters beyond city and town
The system SHALL support filtering villages by `归属市`、`归属镇`、`村名/关键词`、`民族`、`语言/方言分组`、`建村时间`、`经济情况`, with support for combining multiple conditions in a single query session.

#### Scenario: Combining multiple conditions
- **WHEN** a user applies city, town, keyword, ethnicity, and economy filters together
- **THEN** the result set only contains villages matching all active filter conditions

### Requirement: Village query SHALL preserve query state across map, list, and URL
The system SHALL keep active query conditions and current selection synchronized across the filter panel, map result set, list result set, and URL state.

#### Scenario: Restoring a combined query from URL
- **WHEN** a user reloads or shares a URL containing active filter parameters
- **THEN** the page restores the same query state and result set

### Requirement: Village detail SHALL expose business-complete source attributes for the selected village
The system SHALL present a selected village with grouped business attributes including administrative data, timeline data, language and ethnicity data, economy data, and topic-related source fields.

#### Scenario: Viewing selected village detail
- **WHEN** a user selects a village from the map or list
- **THEN** the detail panel shows the grouped source attributes required for business reading and follow-up analysis
