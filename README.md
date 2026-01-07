# NodeGraph.js

[![npm version](https://badge.fury.io/js/nodegraph-js.svg)](https://badge.fury.io/js/nodegraph-js)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

**[GitHub Repository](https://github.com/almerito/NodeGraph)**

A lightweight, high-performance, vanilla JavaScript library for creating node-based graph editors. Built with zero dependencies (runtime) and designed for flexibility and ease of use.

## Features

- **Infinite Canvas**: smooth pan and zoom using CSS transforms.
- **Flexible Nodes**: 
    - Full customization of Header, Body, and Footer.
    - Resizable nodes.
    - Persistent data storage.
- **Advanced Slots**: 
    - Inputs/Outputs can be placed on any side (Top, Bottom, Left, Right).
    - Customizable shapes (Circle, Square, Diamond, Arrow).
    - **Grouping**: Define logical pairs (e.g. Horizontal In/Out).
- **Smart Connections**: 
    - Bezier curves with automatic path calculation.
    - **Smart Snapping**: Drop connections on nodes to auto-snap to compatible slots.
    - **Validation**: Enforce direction (In->Out) or groups, or allow flexible connections.
    - **Symbolic Connections**: Dashed lines for logical relationships without data flow.
- **Interaction**:
    - Multi-selection (Box select, Ctrl+Click).
    - Context Menus (fully customizable).
    - Clipboard (Copy/Paste nodes and sub-graphs).
    - Undo/Redo support (via API hooks).
- **Organization**:
    - **Groups**: visual containers to organize nodes.
    - **Auto-Arrange**: built-in algorithm to untangle messy graphs.

## Installation

```bash
npm install nodegraph-js
```

## Basic Usage

```javascript
import { NodeGraph } from 'nodegraph-js';
import 'nodegraph-js/style.css';

// Initialize
const graph = new NodeGraph('#graph-container', {
    gridSize: 20,
    gridColor: '#2d2d44',
    backgroundColor: '#1a1a2e',
    bidirectional: true,      // Allow dragging from Input to Output
    enforceDirection: true,   // Block Input-Input connections
    enforceSlotGroups: false  // Strict group matching
});

// Add a Node
const node1 = graph.addNode({
    id: 'node-1',
    position: { x: 100, y: 100 },
    header: { content: 'My Node' },
    inputs: [
        { id: 'in', label: 'Input', shape: 'circle', group: 'main' }
    ],
    outputs: [
        { id: 'out', label: 'Output', shape: 'circle', group: 'main' }
    ]
});

// Listen for events
graph.on('connection:create', (conn) => {
    console.log('New connection:', conn);
});
```

## Documentation

For full documentation on API, Configuration, and Styling, please check the [GitHub Repository](https://github.com/almerito/NodeGraph).

## License

AGPL-3.0-only
