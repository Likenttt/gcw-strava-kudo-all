# Changelog

## [1.3.0] - 2026-03-08

### Changed

- Migrate the extension from Manifest V2 to Manifest V3.
- Support Garmin Connect `/app/newsfeed` routes while keeping compatibility with `/modern/newsfeed`.
- Update documentation and site metadata to use the current Garmin Connect `/app/newsfeed` URLs.

### Fixed

- Improve Garmin button injection for SPA navigation, filtered feeds, and delayed page header rendering.
- Improve Strava and Garmin startup behavior by avoiding reliance on `window.onload`.
- Exclude accidental `.vs/` development-environment files from the repository and ignore them in Git.
- Clean contributor integration follow-up issues in the README and Garmin fallback button behavior.

## [1.2.1]

### Added

- Add Safari install link and CRX download guidance.
- Add custom site header metadata and download page assets.

### Changed

- Improve release automation support by enabling manual workflow runs.
- Refresh packaged CRX artefacts and favicon-related website assets.

## [1.2.0]

### Added

- Add Strava support alongside Garmin Connect Web.
- Add localization message files and extension description i18n support.
- Add privacy policy, release links, and project site updates.

### Changed

- Reorganize the extension code around separate Garmin and Strava namespaces.
- Refresh the build flow, documentation, preview assets, and published project name.

## [0.2.0]

### Added

- Add browser locale resources.
- Add updated extension icons.

### Changed

- Move the Garmin kudos button into the navigation bar.
- Refresh the early project documentation.

## [0.1.0]

### Added

- First usable Garmin Connect Web release based on the original `tciles/kudo-all` idea.
