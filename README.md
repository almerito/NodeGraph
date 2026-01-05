# NodeGraph.js

A lightweight, high-performance, vanilla JavaScript library for creating node-based graph editors. Built with zero dependencies (runtime) and designed for flexibility and ease of use.

## Features

- **Core Graph**: Infinite canvas with pan and zoom capabilities.
- **Nodes & Slots**: Fully customizable nodes with input/output slots. Supports various slot shapes (circle, square, arrow, diamond).
- **Connections**: Smooth Bezier curves for connections. Supports "symbolic" (dashed) connections for visual references.
- **Interactivity**: 
  - Drag and drop connections.
  - Multi-selection (box selection, additive).
  - Context menus for nodes, canvas, groups, and connections.
  - Smart proximity auto-connect.
- **Organization**:
  - Group nodes into colored containers.
  - Auto-arrange feature (Island Packing algorithm) to organize messy graphs.
- **Developer Experience**:
  - Event-driven architecture (`on('node:select')`, `on('connection:create')`, etc.).
  - Serialization/Deserialization support (JSON).
  - Connection validation hooks.
  - customizable CSS theming.

## Installation

```bash
npm install nodegraph-js
```

## Development

Currently set up as a Vite project.

```bash
# Run development server
npm run dev

# Build for production
npm run build
```

## Basic Usage

```javascript
import { NodeGraph, SlotShape } from 'nodegraph-js';
import 'nodegraph-js/style.css';

// Initialize the graph
const graph = new NodeGraph('#graph-container', {
    grid: { enabled: true, step: 20 },
    zoom: { min: 0.1, max: 2 }
});

// Add a node
const node1 = graph.addNode({
    id: 'node-1',
    position: { x: 100, y: 100 },
    header: { content: 'My Node' },
    inputs: [{ id: 'in', label: 'Input', shape: SlotShape.CIRCLE }],
    outputs: [{ id: 'out', label: 'Output', shape: SlotShape.CIRCLE }]
});

// Listen for events
graph.on('connection:create', (connection) => {
    console.log('Connected:', connection);
});
```

## License

AGPL-3.0
