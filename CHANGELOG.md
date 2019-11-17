# Changelog
All notable changes to this project will be documented in this file.

View detailed changes in our [Trello board](https://trello.com/b/EPJJJbYH/avalanche).

## [Unreleased]

## [0.4.59] - 2019-11-17
### Added
- Added AFPushNotification class for iOS remote notifications.

### Changes
- Separated AVAFoundation, AVACore & AVACLI namespaces.
- Updated package namespaces (AVAFoundation & AVACore).
- Standardized AFUtil & ACUtil.
- Started implementation of ESM (A lot of refactoring).

## [0.4.31] - 2019-11-16
### Added
- Added ACUtil to AVAFoundation.
- Added foreign key constraints (relations) to Migrator.
- Added constraint checks option to AFDatabase.

### Fixed
- Fixed Seeder 'wipe' option.

## [0.4.27] - 2019-08-24
### Added
- Added 'gitignore' installable package.
- Added 'gitlab-ci' installable package.
- Added 'docker' installable package.
- Added ability to have no primaryKey in Migrator.

### Changes
- Optimised AFModel.

## [0.4.25] - 2019-08-12
### Added
- Added error handling to template builder.
- Added error handling when writing to request.log.
- Added secret generator to environment on 'make' command.
- Added ability to set a default value in a model.
- Added this CHANGELOG.md to the source code.

### Changes
- Removed NULL values from insert query on AFModel.save() fuction.
- Changed the progress animation on the 'update' command.
- Minor improvements.

### Fixed
- Fixed result message on the 'update' command.

### Removed
- Removed date from request console logs.

## [0.4.21] - 2019-08-11
### Changes
- Replaced all ugly tables printed by console.
- Minor improvements.

## [0.4.17] - 2019-08-09
### Added
- Added validator to non-middleware endpoints.
- Added YouTube tutorial video link to readme.md.

### Changes
- Many optimisations in AFModel class.

## [0.4.11] - 2019-08-08
### Added
- Added Knex query builder.

### Changes
- Minor optimisations.

### Fixed
- Fixed many fatal bugs.

## [0.4.7] - 2019-08-07
### Added
- Added AFValidator class. The validator is contained in every request object.
- Added ability to choose storage type in 'make' command when making a model.
- Added environment resource to 'make' command.
- Added seeds resource to 'make' command.
- Added routes resource to 'make' command.
- Added middleware resource to 'make' command.
- Added error handling for invalid routes.
- Added 'update' command. This command updates the Avalanche CLI to the latest version.
- Added 'upgrade' command. This command upgrades your project to the latest version.

## Changed
- Updated model template.
- Deprecated view resource option in 'make' command.
- Optimised 'fix' command.

## [0.3.25] - 2019-07-24
### Added
- Added ability to render file directly from routing without a controller as middle-man.

## [0.3.24] - 2019-07-23
### Added
- Dependency installer.

## Changes
- npm now gets installed by the 'init' command. So now you don't need to have an npm project before installing Avalanche, but you can if you want to.
- Changed the way middleware works. 
- New viewcontroller standard (Viewcontroller will be deprecated in the future).
- Minor improvements

## Fixed
- Fixed 'run' command on Windows.
- Fixed fatal bug regarding the run path.

## Removed
- Removed third-party modules from AVAFoundation. Dependencies are now installed seperately.

## [0.3.7] - 2019-07-17
### Added
- Added 'help' command.
- Added 'make' command.

### Changes
- Commands are now dynamic and stored in the commands folder.

## [0.3.1] - 2019-07-16
### Added
- Added CSRF security tokens.
- Added model registerer.
- Added migrator.
- Added seeder.
- Added builderplate resources. Now boilerplates can be defined as installs.
- Standardised terminal prefix.

### Changed
- Moved all AVACore utilities to the ACUtil class.
- Major improvements on AFModel.
- Minor improvements.

## [0.2.24] - 2019-07-14
### Added
- Added filewatcher.
- Added server restarter (triggered by filewatcher).

### Changed
- Minor improvements.

## [0.2.13] - 2019-07-13
### Added
- Added AFStorage class to utilize filestorage.
- Added AFDatabase class to utilize a database.
- Added ASCII art when installation was complete.
- Added more utilities.

### Changed
- Optimised boilerplates.
- Minor improvements.

## [0.2.3] - 2019-07-11
### Changed
- Renamed all AVAFoundation classes by adding 'AVA' prefix to all class names.
- Minor improvements.

## [0.1.24] - 2019-08-10
### Added
- Added third-party packages.
- Added webserver permissions error handling.
- Added webserver 'port in use' error handling.
- Added 404 status page to boilerplate.

## [0.1.17] - 2019-08-10
### Added
- Added Readme file.
- GitHub Wiki.

### Changed
- Minor improvements.

### Removed
- Obsolite packages. Project has been pruned.

## [0.1.6] - 2019-08-10
### Added
- Added ability to have different environments that can be loaded at runtime.

## [0.1.1] - 2019-08-10
### Added
- AVAFoundation (Class library).

## [0.1.0] - 2019-08-07
### Added
- AVACore (Core framework).
- Avalanche CLI.
- Project structure.
- Added installable boilerplates.
- Added request logger.
- Added 'version' command.
- Added 'info' command.
- Added 'init' command.
- Added 'run' command.
- Added 'routes' command.
- Added 'fix' command.