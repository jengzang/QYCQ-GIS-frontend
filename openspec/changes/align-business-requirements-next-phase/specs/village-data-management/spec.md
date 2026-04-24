## ADDED Requirements

### Requirement: The system SHALL provide a dedicated management domain for village data maintenance
The system SHALL provide a dedicated management workflow for village data creation, editing, deletion, import, and export, separated from the public demo-oriented map experience.

#### Scenario: Entering management mode
- **WHEN** an administrator enters the data-management domain
- **THEN** the system presents maintenance tools without overloading the public map page

### Requirement: The system SHALL validate imported and edited village data
The system SHALL validate imported and edited village data for missing required fields, invalid values, and duplicate entries before accepting changes.

#### Scenario: Importing duplicate or malformed rows
- **WHEN** imported data contains duplicate identity rows or invalid required values
- **THEN** the system rejects or flags the invalid rows and reports the validation result
