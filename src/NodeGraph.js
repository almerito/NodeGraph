import { EventEmitter } from './utils/events.js';
import { uid } from './utils/uid.js';
import { Node } from './Node.js';
import { Connection } from './Connection.js';
import { Group } from './Group.js';
import { ViewportManager } from './managers/ViewportManager.js';
import { SelectionManager } from './managers/SelectionManager.js';
import { GridManager } from './managers/GridManager.js';
import { ContextMenuManager } from './managers/ContextMenuManager.js';
import { ClipboardManager } from './managers/ClipboardManager.js';

/**
 * Main NodeGraph class - the graph container
 */
export class NodeGraph extends EventEmitter {
    /**
     * @param {string|HTMLElement} container - Container element or selector
     * @param {object} options - Graph options
     */
    constructor(container, options = {}) {
        super();

        // Get container element
        if (typeof container === 'string') {
            this.container = document.querySelector(container);
        } else {
            this.container = container;
        }

        if (!this.container) {
            throw new Error('NodeGraph: Container element not found');
        }

        this.options = {
            grid: {
                enabled: true,
                step: 20,
                ...options.grid
            },
            zoom: {
                min: 0.1,
                max: 4,
                speed: 0.1,
                ...options.zoom
            },
            snapToGrid: options.snapToGrid !== false,
            ...options
        };

        // Collections
        this.nodes = new Map();
        this.connections = new Map();
        this.groups = new Map();

        // Connection dragging state
        this._connectionDrag = null;
        this._tempPath = null;

        this._createLayers();
        this._initManagers();
        this._bindEvents();
    }

    /**
     * Create the DOM layers
     */
    _createLayers() {
        this.container.classList.add('ng-container');

        // Create viewport wrapper
        this.viewportElement = document.createElement('div');
        this.viewportElement.className = 'ng-viewport';

        // Groups layer (bottom)
        this.groupsLayer = document.createElement('div');
        this.groupsLayer.className = 'ng-groups-layer';
        this.viewportElement.appendChild(this.groupsLayer);

        // SVG layer for connections and grid (middle)
        this.svgLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svgLayer.classList.add('ng-svg-layer');
        this.svgLayer.setAttribute('width', '100%');
        this.svgLayer.setAttribute('height', '100%');
        this.viewportElement.appendChild(this.svgLayer);

        // Connections group
        this.connectionsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.connectionsGroup.classList.add('ng-connections');
        this.svgLayer.appendChild(this.connectionsGroup);

        // DOM layer for nodes (top)
        this.nodesLayer = document.createElement('div');
        this.nodesLayer.className = 'ng-nodes-layer';
        this.viewportElement.appendChild(this.nodesLayer);

        this.container.appendChild(this.viewportElement);
    }

    /**
     * Initialize managers
     */
    _initManagers() {
        // Viewport (pan/zoom)
        this.viewport = new ViewportManager({
            container: this.container,
            content: this.viewportElement,
            options: this.options.zoom
        });

        // Selection
        this.selection = new SelectionManager(this);

        // Grid
        this.grid = new GridManager({
            svgLayer: this.svgLayer,
            options: this.options.grid
        });

        // Context menu
        this.contextMenu = new ContextMenuManager(this);

        // Clipboard
        this.clipboard = new ClipboardManager(this);
    }

    /**
     * Bind global event listeners
     */
    _bindEvents() {
        // Node events
        this.nodesLayer.addEventListener('node:select', (e) => {
            const { node, event } = e.detail;
            if (event.ctrlKey || event.metaKey) {
                this.selection.toggleSelection(node);
            } else {
                // If node is already selected, don't clear selection immediately
                // This allows dragging multiple nodes
                // If it's a click without drag, we might want to clear others,
                // but standard behavior often keeps selection or clears on mouseup.
                // For now, let's just NOT select if already selected to preserve group.
                if (!this.selection.isSelected(node)) {
                    this.selection.selectNode(node);
                }
            }
            this.emit('node:select', node);
        });

        this.nodesLayer.addEventListener('node:drag', (e) => {
            const { node } = e.detail;

            // Move all selected nodes together
            if (this.selection.isSelected(node) && this.selection.selectedNodes.size > 1) {
                // Already handled by individual node drag
            }

            this.emit('node:drag', node);
        });

        this.nodesLayer.addEventListener('node:dragend', (e) => {
            this.emit('node:dragend', e.detail.node);
        });

        this.nodesLayer.addEventListener('node:contextmenu', (e) => {
            const { node, event } = e.detail;
            if (!this.selection.isSelected(node)) {
                this.selection.selectNode(node);
            }
            this.contextMenu.open('node', event.clientX, event.clientY, { node });
        });

        // Slot events for connection creation
        this.nodesLayer.addEventListener('slot:dragstart', (e) => {
            const { slot, event } = e.detail;
            this._startConnectionDrag(slot, event);
        });

        // Canvas context menu
        this.container.addEventListener('contextmenu', (e) => {
            // Only show canvas menu if clicking on empty space
            if (e.target === this.container ||
                e.target === this.viewportElement ||
                e.target === this.nodesLayer ||
                e.target.classList.contains('ng-viewport')) {
                e.preventDefault();
                const pos = this.viewport.screenToGraph(e.clientX, e.clientY);
                this.contextMenu.open('canvas', e.clientX, e.clientY, { position: pos });
            }
        });

        // Group context menu
        this.groupsLayer.addEventListener('group:contextmenu', (e) => {
            const { group, event } = e.detail;
            this.contextMenu.open('group', event.clientX, event.clientY, { group });
        });

        // Connection context menu
        this.connectionsGroup.addEventListener('connection:contextmenu', (e) => {
            const { connection, event } = e.detail;
            this.contextMenu.open('connection', event.clientX, event.clientY, { connection });
        });

        // Mouse move for connection dragging and tracking position
        document.addEventListener('mousemove', (e) => {
            // Track last mouse position
            this.lastMousePos = { x: e.clientX, y: e.clientY };

            if (this._connectionDrag) {
                this._updateConnectionDrag(e);
            }
        });

        // Mouse up for connection creation
        document.addEventListener('mouseup', (e) => {
            if (this._connectionDrag) {
                this._endConnectionDrag(e);
            }
        });
    }

    /**
     * Start dragging a connection from a slot
     */
    _startConnectionDrag(slot, event) {
        this._connectionDrag = {
            sourceSlot: slot,
            startPos: slot.getConnectionPoint()
        };

        // Create temporary path
        this._tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this._tempPath.classList.add('ng-connection', 'ng-connection--temp');
        this._tempPath.setAttribute('stroke', slot.color);
        this._tempPath.setAttribute('stroke-width', '2');
        this._tempPath.setAttribute('fill', 'none');
        this._tempPath.setAttribute('stroke-dasharray', '5,5');
        this.svgLayer.appendChild(this._tempPath);

        this._updateConnectionDrag(event);
    }

    /**
     * Update connection drag path
     */
    _updateConnectionDrag(event) {
        if (!this._connectionDrag || !this._tempPath) return;

        const endPos = this.viewport.screenToGraph(event.clientX, event.clientY);
        const startPos = this._connectionDrag.startPos;
        const orientation = this._connectionDrag.sourceSlot.orientation;

        // Simple bezier path
        const dx = endPos.x - startPos.x;
        const offset = Math.max(Math.abs(dx) / 2, 50);

        let path;
        if (orientation === 'horizontal') {
            path = `M ${startPos.x} ${startPos.y} C ${startPos.x + offset} ${startPos.y}, ${endPos.x - offset} ${endPos.y}, ${endPos.x} ${endPos.y}`;
        } else {
            path = `M ${startPos.x} ${startPos.y} C ${startPos.x} ${startPos.y + offset}, ${endPos.x} ${endPos.y - offset}, ${endPos.x} ${endPos.y}`;
        }

        this._tempPath.setAttribute('d', path);

        // Validation Logic
        const targetElement = document.elementFromPoint(event.clientX, event.clientY);
        const slotClickArea = targetElement?.closest('.ng-slot-click-area');
        const slotElement = slotClickArea?.closest('.ng-slot');
        let targetSlot = null;

        if (slotElement) {
            const slotId = slotElement.dataset.slotId;
            targetSlot = this._findSlotById(slotId);
        }

        // Handle enter/leave slot
        const currentTarget = this._connectionDrag.targetSlot;

        if (targetSlot !== currentTarget) {
            // Leave previous
            if (currentTarget) {
                const conn = currentTarget.element.querySelector('.ng-slot-connector');
                if (conn) conn.classList.remove('ng-slot-connector--invalid', 'ng-slot-connector--highlight');
            }

            // Enter new
            if (targetSlot) {
                // Special case: Hovering source slot (start point)
                // Just highlight normally, no validation needed (it's always "neutral")
                if (targetSlot === this._connectionDrag.sourceSlot) {
                    const conn = targetSlot.element.querySelector('.ng-slot-connector');
                    if (conn) conn.classList.add('ng-slot-connector--highlight');
                    // We don't change isValid/context for source slot itself
                } else {
                    const context = {
                        source: this._connectionDrag.sourceSlot,
                        target: targetSlot,
                        valid: true // Assume valid initially
                    };

                    // Default Rule 1: Same Node (but not the source slot itself, checked above)
                    if (targetSlot.node === this._connectionDrag.sourceSlot.node) {
                        context.valid = false;
                    }
                    // Default Rule 2: Type mismatch
                    else if (targetSlot.type === this._connectionDrag.sourceSlot.type) {
                        context.valid = false;
                    }

                    // Emit event to allow user modification
                    this.emit('connection:validate', context);

                    this._connectionDrag.isValid = context.valid;
                    const conn = targetSlot.element.querySelector('.ng-slot-connector');
                    if (conn) {
                        if (!context.valid) {
                            conn.classList.add('ng-slot-connector--invalid');
                        } else {
                            conn.classList.add('ng-slot-connector--highlight');
                        }
                    }
                }
            }

            this._connectionDrag.targetSlot = targetSlot;
        }
    }

    /**
     * End connection drag
     */
    _endConnectionDrag(event) {
        if (!this._connectionDrag) return;

        // Clean up visual feedback on target slot if exists
        const targetSlot = this._connectionDrag.targetSlot;
        if (targetSlot) {
            const conn = targetSlot.element.querySelector('.ng-slot-connector');
            if (conn) conn.classList.remove('ng-slot-connector--invalid', 'ng-slot-connector--highlight');
        }

        if (targetSlot && this._connectionDrag.isValid) {
            // Create connection
            const sourceSlot = this._connectionDrag.sourceSlot;

            // Check if already connected logic is inside connect() but we can check here too or rely on connect()

            // Determine direction (output -> input)
            if (sourceSlot.type === 'output' && targetSlot.type === 'input') {
                this.connect(sourceSlot, targetSlot);
            } else if (sourceSlot.type === 'input' && targetSlot.type === 'output') {
                this.connect(targetSlot, sourceSlot);
            }
        }

        // Remove temp path
        if (this._tempPath) {
            this._tempPath.remove();
            this._tempPath = null;
        }

        this._connectionDrag = null;
    }

    /**
     * Find a slot by ID across all nodes
     */
    _findSlotById(slotId) {
        for (const node of this.nodes.values()) {
            if (node.inputSlots.has(slotId)) {
                return node.inputSlots.get(slotId);
            }
            if (node.outputSlots.has(slotId)) {
                return node.outputSlots.get(slotId);
            }
        }
        return null;
    }

    /**
     * Add a node to the graph
     * @param {object} config - Node configuration
     * @returns {Node} Created node
     */
    addNode(config) {
        const node = new Node({
            ...config,
            graph: this
        });

        this.nodes.set(node.id, node);
        this.nodesLayer.appendChild(node.element);

        this.emit('node:add', node);
        return node;
    }

    /**
     * Remove a node from the graph
     * @param {string} nodeId - Node ID
     */
    removeNode(nodeId) {
        const node = this.nodes.get(nodeId);
        if (!node) return;

        // Remove from selection
        this.selection.removeFromSelection(node);

        // Destroy node (will also destroy connections)
        node.destroy();
        this.nodes.delete(nodeId);

        this.emit('node:remove', nodeId);
    }

    /**
     * Get a node by ID
     * @param {string} nodeId - Node ID
     * @returns {Node|undefined}
     */
    getNode(nodeId) {
        return this.nodes.get(nodeId);
    }

    /**
     * Connect two slots
     * @param {Slot} outputSlot - Output slot
     * @param {Slot} inputSlot - Input slot
     * @param {object} style - Connection style
     * @returns {Connection} Created connection
     */
    connect(outputSlot, inputSlot, style = {}) {
        // Validate
        if (outputSlot.type !== 'output' || inputSlot.type !== 'input') {
            console.warn('NodeGraph: Invalid connection - must be output to input');
            return null;
        }

        // Check if connection already exists
        for (const conn of this.connections.values()) {
            if (conn.outputSlot === outputSlot && conn.inputSlot === inputSlot) {
                return conn; // Already connected
            }
        }

        const connection = new Connection({
            outputSlot,
            inputSlot,
            svgLayer: this.connectionsGroup,
            style
        });

        // Register connection in slots
        outputSlot.connections.add(connection);
        inputSlot.connections.add(connection);

        this.connections.set(connection.id, connection);

        this.emit('connection:create', connection);
        return connection;
    }

    /**
   * Create a symbolic (dashed) connection between two nodes
   * @param {Node} fromNode - Source node
   * @param {Node} toNode - Target node
   * @param {object} style - Connection style
   * @returns {Connection} Created connection
   */
    connectSymbolic(fromNode, toNode, style = {}) {
        const connection = new Connection({
            outputSlot: fromNode, // Using node as slot
            inputSlot: toNode, // Using node as slot
            svgLayer: this.connectionsGroup,
            style: { dashed: true, ...style }
        });

        this.connections.set(connection.id, connection);

        // Add to nodes tracking so they update when moved
        if (fromNode.connections) fromNode.connections.add(connection);
        if (toNode.connections) toNode.connections.add(connection);

        this.emit('connection:create', connection);
        return connection;
    }

    /**
     * Disconnect (remove) a connection
     * @param {string} connectionId - Connection ID
     */
    disconnect(connectionId) {
        const connection = this.connections.get(connectionId);
        if (!connection) return;

        connection.destroy();
        this.connections.delete(connectionId);

        this.emit('connection:remove', connectionId);
    }

    /**
     * Add a group to the graph
     * @param {object} config - Group configuration
     * @returns {Group} Created group
     */
    addGroup(config) {
        const group = new Group({
            ...config,
            graph: this
        });

        this.groups.set(group.id, group);
        this.groupsLayer.appendChild(group.element);

        this.emit('group:add', group);
        return group;
    }

    /**
     * Remove a group from the graph
     * @param {string} groupId - Group ID
     */
    removeGroup(groupId) {
        const group = this.groups.get(groupId);
        if (!group) return;

        group.destroy();
        this.groups.delete(groupId);

        this.emit('group:remove', groupId);
    }

    /**
     * Clear all nodes, connections, and groups
     */
    clear() {
        // Clear connections first
        this.connections.forEach(conn => conn.destroy());
        this.connections.clear();

        // Clear nodes
        this.nodes.forEach(node => node.destroy());
        this.nodes.clear();

        // Clear groups
        this.groups.forEach(group => group.destroy());
        this.groups.clear();

        // Clear selection
        this.selection.clearSelection();

        this.emit('graph:clear');
    }

    /**
     * Serialize the graph state
     * @returns {object} Serialized data
     */
    serialize() {
        return {
            nodes: Array.from(this.nodes.values()).map(n => n.serialize()),
            connections: Array.from(this.connections.values()).map(c => c.serialize()),
            groups: Array.from(this.groups.values()).map(g => g.serialize()),
            viewport: this.viewport.getState()
        };
    }

    /**
     * Deserialize and restore graph state
     * @param {object} data - Serialized data
     */
    deserialize(data) {
        this.clear();

        // Restore nodes
        if (data.nodes) {
            data.nodes.forEach(nodeData => {
                this.addNode(nodeData);
            });
        }

        // Restore connections
        if (data.connections) {
            data.connections.forEach(connData => {
                const outputNode = this.nodes.get(connData.outputNodeId);
                const inputNode = this.nodes.get(connData.inputNodeId);

                if (outputNode && inputNode) {
                    const outputSlot = outputNode.getOutput(connData.outputSlotId);
                    const inputSlot = inputNode.getInput(connData.inputSlotId);

                    if (outputSlot && inputSlot) {
                        this.connect(outputSlot, inputSlot, connData.style);
                    }
                }
            });
        }

        // Restore groups
        if (data.groups) {
            data.groups.forEach(groupData => {
                const group = this.addGroup(groupData);

                // Re-add nodes to group
                if (groupData.nodeIds) {
                    groupData.nodeIds.forEach(nodeId => {
                        const node = this.nodes.get(nodeId);
                        if (node) {
                            group.addNode(node);
                        }
                    });
                }
            });
        }

        // Restore viewport
        if (data.viewport) {
            this.viewport.setState(data.viewport);
        }

        this.emit('graph:deserialize', data);
    }

    /**
     * Auto-arrange nodes using Island Component Packing (16:9 Aspect Ratio)
     */
    arrange() {
        const allNodes = Array.from(this.nodes.values());
        if (allNodes.length === 0) return;

        // Settings
        const xSpacing = 250;
        const ySpacing = 120;
        const groupPadding = 80; // Padding between islands
        const startX = 100;
        const startY = 100;

        // 1. Identify Connected Components (Islands)
        const visited = new Set();
        const islands = [];

        allNodes.forEach(node => {
            if (visited.has(node.id)) return;

            // Start new island
            const islandNodes = [];
            const queue = [node];
            visited.add(node.id);
            islandNodes.push(node);

            // Traverse connected component (Undirected logic for gathering)
            let head = 0;
            while (head < queue.length) {
                const current = queue[head++];

                // Check all connections (in and out) to find neighbors
                const neighbors = new Set();
                current.inputSlots.forEach(s => s.connections.forEach(c => c.outputSlot.node && neighbors.add(c.outputSlot.node)));
                current.outputSlots.forEach(s => s.connections.forEach(c => c.inputSlot.node && neighbors.add(c.inputSlot.node)));

                neighbors.forEach(neighbor => {
                    if (!visited.has(neighbor.id)) {
                        visited.add(neighbor.id);
                        islandNodes.push(neighbor);
                        queue.push(neighbor);
                    }
                });
            }

            islands.push(this._layoutIsland(islandNodes, xSpacing, ySpacing));
        });

        // 2. Bin Packing Islands into 16:9 Aspect Ratio
        // Calculate Total Area to estimate target width
        let totalArea = 0;
        islands.forEach(island => {
            totalArea += (island.width + groupPadding) * (island.height + groupPadding);
        });

        const targetRatio = 16 / 9;
        // Width * Height = Area, Width / Height = Ratio => Width^2 / Ratio = Area => Width = sqrt(Area * Ratio)
        const targetWidth = Math.max(1000, Math.sqrt(totalArea * targetRatio));

        // Shelf Packing Algorithm
        let currentX = 0;
        let currentY = 0;
        let rowHeight = 0;

        // Sort islands? Maybe by height to pack better? 
        // Or keep them in original order to preserve "creation time" clustering? 
        // Let's sort by height desc for better packing
        islands.sort((a, b) => b.height - a.height);

        islands.forEach(island => {
            // Check if fits in current row
            if (currentX + island.width > targetWidth && currentX > 0) {
                // New Row
                currentX = 0;
                currentY += rowHeight + groupPadding;
                rowHeight = 0;
            }

            // Place Island
            const islandOffsetX = startX + currentX;
            const islandOffsetY = startY + currentY;

            // Apply positions to nodes in this island
            island.placements.forEach(p => {
                p.node.moveTo(islandOffsetX + p.x, islandOffsetY + p.y);
            });

            // Advance cursor
            currentX += island.width + groupPadding;
            rowHeight = Math.max(rowHeight, island.height);
        });

        this.emit('graph:arrange');
    }

    /**
     * Helper to layout a single connected component (Island)
     * Returns { width, height, placements: [{node, x, y}] }
     */
    _layoutIsland(nodes, xSpacing, ySpacing) {
        if (nodes.length === 0) return { width: 0, height: 0, placements: [] };

        // 1. Calculate Ranks (Topological Sort / Layering within Island)
        const ranks = new Map();
        const roots = nodes.filter(node => {
            // Root if no inputs *from within this island*
            let hasInternalInput = false;
            node.inputSlots.forEach(slot => {
                slot.connections.forEach(conn => {
                    if (nodes.includes(conn.outputSlot.node)) hasInternalInput = true;
                });
            });
            return !hasInternalInput;
        });

        if (roots.length === 0) roots.push(nodes[0]); // Handle cycle

        const queue = [];
        const visitedInIsland = new Set();

        roots.forEach(r => {
            ranks.set(r.id, 0);
            queue.push(r);
            visitedInIsland.add(r.id);
        });

        while (queue.length > 0) {
            const node = queue.shift();
            const currentRank = ranks.get(node.id);

            node.outputSlots.forEach(slot => {
                slot.connections.forEach(conn => {
                    const target = conn.inputSlot.node;
                    // Only process if target is in this island
                    if (nodes.includes(target)) {
                        if (!visitedInIsland.has(target.id) || ranks.get(target.id) < currentRank + 1) {
                            ranks.set(target.id, currentRank + 1);
                            visitedInIsland.add(target.id);
                            queue.push(target);
                        }
                    }
                });
            });
        }

        // Handle unreachables within island (shouldn't happen if connected, but safe fallback)
        nodes.forEach(n => {
            if (!ranks.has(n.id)) ranks.set(n.id, 0);
        });

        // 2. Group by Rank
        const layers = [];
        let maxRank = 0;
        ranks.forEach((rank, nodeId) => {
            if (!layers[rank]) layers[rank] = [];
            layers[rank].push(this.nodes.get(nodeId));
            if (rank > maxRank) maxRank = rank;
        });

        // 3. Calculate Positions
        const placements = [];
        let islandHeight = 0;
        const layerWidths = [];

        // Determine max height of the island
        layers.forEach(layer => {
            if (!layer) return;
            // Simple sort by Y to keep relative order or just ID
            layer.sort((a, b) => a.position.y - b.position.y);

            let layerH = 0;
            layer.forEach(n => {
                const b = n.getBounds();
                layerH += (b.height || 100) + ySpacing;
            });
            if (layerH > islandHeight) islandHeight = layerH;
        });
        // Remove last spacing pad
        if (islandHeight > 0) islandHeight -= ySpacing;

        // Position
        layers.forEach((layer, rank) => {
            if (!layer) return;

            let currentY = 0;
            // Center layer vertically relative to island? Or top align?
            // Top align is safer for now.

            // To Center:
            // let layerH = ...;
            // let startY = (islandHeight - layerH) / 2;

            layer.forEach(node => {
                const b = node.getBounds();
                const h = b.height || 100;

                placements.push({
                    node: node,
                    x: rank * xSpacing,
                    y: currentY
                });

                currentY += h + ySpacing;
            });
        });

        return {
            width: (maxRank + 1) * xSpacing, // Approx width
            height: islandHeight,
            placements: placements
        };
    }

    /**
     * Destroy the graph
     */
    destroy() {
        this.clear();

        // Destroy managers
        this.grid?.destroy();
        this.contextMenu?.destroy();

        // Remove elements
        this.viewportElement?.remove();
        this.container?.classList.remove('ng-container');

        this.emit('graph:destroy');
    }
}
