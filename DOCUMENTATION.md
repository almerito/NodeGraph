
# NodeGraph.js Documentation

A lightweight, flexible node graph library with extensive customization capabilities.

## 1. Graph Initialization
```javascript
import { NodeGraph } from './src/NodeGraph.js';

const container = document.getElementById('graph-container');
const graph = new NodeGraph(container, {
    gridSize: 20,
    gridColor: '#2d2d44',
    backgroundColor: '#1a1a2e'
});
```

## 2. Node Customization
Create nodes using `graph.addNode(config)`.

### Basic Configuration
```javascript
const node = graph.addNode({
    id: 'my-node',          // Unique string ID
    data: { myValue: 123 }, // Custom persistent data container
    position: { x: 100, y: 100 },
    resizable: true,        // Enable resizing handles (bottom-right)
    header: { content: '<strong>Title</strong>', className: 'my-header', style: { color: 'blue' } },
    body:   { content: '<p>Content</p>', className: 'my-body' },
    footer: { content: 'Status: OK', className: 'my-footer' }
});
```

### Layout Customization (Slots Containers)
You can customize the 4 slot containers surrounding the node body. This is useful for creating custom gaps or forcing dimensions.
```javascript
{
    // ...node config
    slotsTop:    { style: { height: '30px', background: 'transparent' } },
    slotsBottom: { style: { height: '20px' } },
    slotsLeft:   { style: { width: '20px' } },
    slotsRight:  { style: { width: '20px' } }
}
```

## 3. Slot Configuration (Inputs/Outputs)
Slots can be placed on any side (left, right, top, bottom) and customized individually.

### Common Properties
```javascript
inputs: [
    {
        id: 'in1',
        label: 'Input 1',       // Text label (pass null for no label)
        side: 'left',           // 'left' | 'right' | 'top' | 'bottom'
        shape: 'circle',        // 'circle' | 'square' | 'diamond' | 'arrow' | 'custom'
        color: '#ff0000',       // Override default color (--ng-slot-color)
        size: 10,               // Override default size (--ng-slot-size)
        edge: false             // If true, attaches to border
    }
]
```

### "Edge" Slots
Slots with `edge: true` are positioned absolutely on the border of the node.
- **Positioning**: Automatically centered on the border line.
- **Labels**: Absolutely positioned inside the node, floating near the connector.
- **Layout**: 
  - Top/Bottom edge slots default to `0px` container height to prevent unwanted vertical gaps.
  - Left/Right edge slots maintain minimal height for stacking.
  - Ideal for "bus" connections or compact designs.

### Variables & Styling
The library uses CSS variables for slots, which can be overridden globally, per-node, or per-slot via config.
- `--ng-slot-size`: Diameter/Size of the connector (default 12px).
- `--ng-slot-color`: Background color of the connector.

## 4. UI Interactions
- **Selection**: Left-click to select. Click empty space to deselect.
- **Box Selection**: Drag Left Mouse on empty space.
- **Pan**: 
  - Middle Mouse Drag
  - **Spacebar + Left Mouse Drag** (Temporarily disables box selection)
- **Zoom**: Mouse Wheel.
- **Connections**: Drag from an output slot to an input slot.
- **Symbolic Connections**: `graph.connectSymbolic(nodeA, nodeB, options)` for dashed logic links.

## 5. CSS Classes
- `.ng-node`: Main node container.
- `.ng-node-selected`: Applied when selected.
- `.ng-slot`: Slot container (relative/absolute depending on config).
- `.ng-slot-connector`: The visual "dot" or shape.
- `.ng-slot-label`: Text label.
- `.ng-connection`: SVG path for connections.

## 6. Events
The `NodeGraph` instance emits various events that you can listen to using `graph.on(eventName, callback)`.

### Global Change Event
Triggered for *any* state change in the graph. Useful for auto-saving, history management, or external UI updates.
- **`change`**: `{ type: string, item: any, timestamp: number }`
  - `type`: Original event name (e.g., 'node:move', 'node:add')
  - `item`: Affected object or ID

### Node Events
- **`node:add`**: `(node: Node)` - Fired when a node is added.
- **`node:remove`**: `(nodeId: string)` - Fired when a node is removed.
- **`node:select`**: `(node: Node)` - Fired when a node is selected.
- **`node:deselect`**: `(node: Node)` - Fired when a node is deselected.
- **`node:drag`**: `(node: Node)` - Fired while dragging a node.
- **`node:dragend`** (or `node:move` in change event): `(node: Node)` - Fired when drag ends.
- **`node:resize`**: `(node: Node)` - Fired when node resizing is completed.
- **`node:contextmenu`**: `(node: Node)` - Fired when right-clicking a node.

### Connection Events
- **`connection:create`**: `(connection: Connection)` - Fired when a connection is created.
- **`connection:remove`**: `(connectionId: string)` - Fired when a connection is removed.
- **`connection:validate`**: `(context: { source: Slot, target: Slot, valid: boolean })` - Fired during drag to validate potential connection. Modify `context.valid` to prevent connections.

### Group Events
- **`group:add`**: `(group: Group)` - Fired when a group is added.
- **`group:remove`**: `(groupId: string)` - Fired when a group is removed.

### Graph & Selection Events
- **`graph:arrange`**: `()` - Fired after auto-arrange is applied.
- **`graph:clear`**: `()` - Fired when graph is cleared.
- **`graph:deserialize`**: `(data: object)` - Fired after graph state is restored.
- **`selection:change`**: `{ nodes: Node[], connections: Connection[] }` - Fired when selection set changes.

### Clipboard Events
- **`clipboard:copy`**: `{ nodes: Node[] }`
- **`clipboard:cut`**: `{}`
- **`clipboard:pasting`**: `{ data: NodeConfig, originalId: string, cancel: boolean }` - Fired BEFORE paste. Modify `data` to change node props, or set `cancel = true` to skip.
- **`clipboard:paste`**: `{ nodes: Node[] }` (New nodes)

### Canvas Events
- **`canvas:add-node`**: `(position: {x, y})` - Fired from context menu "Add Node". Listen to this to show your node creation modal/menu.

## 7. State Management (Save/Load)
You can save and restore the entire graph state (nodes, connections, groups, viewport, and persistent data) using `serialize` and `deserialize`.

### Saving
```javascript
const savedData = graph.serialize(); 
// Returns a JSON-serializable object containing:
// { nodes: [...], connections: [...], groups: [...], viewport: {...} }

const jsonString = JSON.stringify(savedData);
// Save jsonString to localStorage, file, or database
```

### Loading
```javascript
const savedData = JSON.parse(jsonString); // Retrieve from storage
graph.deserialize(savedData);
```
- `deserialize` automatically clears the current graph before loading.
- It restores all IDs, positions, connections, and custom `data`.

## 8. Symbolic Connections (Dashed)
Symbolic connections represent logical relationships without using specific input/output slots. They connect two node bodies directly and are rendered as dashed lines.

```javascript
const nodeA = graph.getNode('id-1');
const nodeB = graph.getNode('id-2');

// Create a dashed connection
graph.connectSymbolic(nodeA, nodeB, {
    color: '#ffcc00', // Optional style override
    width: 2
});
```
- **Interactive**: They are non-interactive by default (no click/drag events) to distinguish them from functional data flow connections.
- **Persistence**: They are saved and restored automatically via `serialize`/`deserialize`.

### Removing
Use `graph.disconnect(connectionId)` just like regular connections.
```javascript
// Remove a specific connection
graph.disconnect(connection.id);

// Remove ALL symbolic connections between two nodes
graph.disconnectSymbolic(nodeA, nodeB);
```
