/**
 * NodeGraph.js - A customizable node graph library
 * 
 * @module nodegraph
 */

import './styles/nodegraph.css';

// Core classes
export { NodeGraph } from './NodeGraph.js';
export { Node } from './Node.js';
export { Slot, SlotShape, SlotOrientation } from './Slot.js';
export { Connection } from './Connection.js';
export { Group } from './Group.js';

// Managers
export { ViewportManager } from './managers/ViewportManager.js';
export { SelectionManager } from './managers/SelectionManager.js';
export { GridManager } from './managers/GridManager.js';
export { ContextMenuManager } from './managers/ContextMenuManager.js';
export { ClipboardManager } from './managers/ClipboardManager.js';

// Utilities
export { uid } from './utils/uid.js';
export { calculateBezierPath, getBezierMidpoint } from './utils/bezier.js';
export { EventEmitter, throttle, debounce } from './utils/events.js';
