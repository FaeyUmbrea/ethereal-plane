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