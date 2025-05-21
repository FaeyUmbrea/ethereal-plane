## Version 2.4.0

### Changed

- Added preliminary compatibility for Foundry V13
- Changed UI to be in line with the new Foundry V13 UI (May cause display issues on V12)

## Version 2.3.1

### Fixed

- Fixed a bug that prevented the poll editor from rendering, even if the poll was not started yet

## Version 2.3.0

### Fixed

- Chat Commands now properly work even if the chat tab is disabled

### Added

- Chat Command aliases, allowing multiple commands to share macros and cooldowns are now available. Existing command entries will automatically be migrated to work with the new system, but commands sharing a macro will need to be manually merged
  - Importing old commands still works as expected, but the new format is not backwards compatible and command lists exported in 2.3.0 or newer can't be imported in 2.2.1 or older
## Version 2.2.1

### Fixed

- Fixed a formatting issue in the Typescript conversion that prevented new EP connections from being created.

## Version 2.2.0

### Added

- Introduced a new feature in the backend that forwards message deletions to the foundry client, currently this only removes messages from the chat tab
- Added a button to manually reconnect to the server

### Changed

- Codebase has been refactored to TypeScript to allow for better stability, all EP features have been tested, but some bugs might still occur as this involved updating the entire module to TypeScript

## Version 2.1.1

### Changed

- Discontinued support for Foundry V10

## Version 2.1.0

### Added

- Chat Commands now have separate cooldowns for subs and non-subs. Set the sub cooldown to -1 to have both default to the non-sub cooldown

## Version 2.0.2

### Fixes
- Prevent auth-loop from occurring if client has been deleted on the config site
- Make it clearer that client ids are registered to the foundry instance by using URL as default name

## Version 2.0.1

### Changes

- Patreon membership is no longer required to use the hosted version (although it unlocks some additional features and is highly appreciated)
- Improved loading times in setups with lots of modules
- New Backend
  - Multi Stream Support
  - YouTube free for everyone!
- Full localization support
- New Notification-Center
  - Notifications are fetched from a central server instead of a local file