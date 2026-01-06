# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2026-01-06
### Fixed
- **Clipboard & Symbolic Connections**: Fixed a crash (`undefined reading 'id'`) when copying symbolic connections (dashed) to the clipboard.

## [1.0.3] - 2026-01-06
### Added
- **Global Change Event**: Added `change` event emitted for all graph state modifications (`node:add`, `connection:create`, `node:move`, etc.).
- **Context Menu 'Disconnect'**: Added option to node context menu to remove all connections from a node.
- **Clipboard Interception**: Added `clipboard:pasting` event allowing modification or cancellation of nodes before pasting.
- **Node Resize Event**: Added `node:resize` event emitted when resizing completes.

## [1.0.2] - 2026-01-05
### Fixed
- **Diamond Slot & Hover**: Resolved CSS conflict where Diamond slots lost rotation on hover or invalid state.

## [1.0.1] - 2026-01-05
### Fixed
- **Diamond Slot Positioning**: Fixed CSS conflict between `rotate` transform and `translate` positioning on Node edges. Diamond slots now correctly align on all 4 sides.

## [1.0.0] - 2026-01-05
### Added
- Initial Release on NPM as `nodegraph-js`.
- Core NodeGraph engine with Pan/Zoom viewport.
- Connection system with Bezier curves and validation.
- Node customization with header/body/footer and flexible slots.
- Group system for organizing nodes.
- Selection, Context Menus, and Clipboard support.
- Smart Connect (Proximity-based auto-connection).
