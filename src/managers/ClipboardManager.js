/**
 * Manages clipboard operations (copy, paste, cut)
 */
export class ClipboardManager {
    /**
     * @param {NodeGraph} graph - Parent graph
     */
    constructor(graph) {
        this.graph = graph;
        this._clipboardData = null;

        this._bindEvents();
    }

    /**
     * Bind keyboard event listeners
     */
    _bindEvents() {
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in input
            if (document.activeElement.tagName === 'INPUT' ||
                document.activeElement.tagName === 'TEXTAREA') {
                return;
            }

            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modKey = isMac ? e.metaKey : e.ctrlKey;

            if (modKey && e.key === 'c') {
                e.preventDefault();
                this.copy();
            } else if (modKey && e.key === 'x') {
                e.preventDefault();
                this.cut();
            } else if (modKey && e.key === 'v') {
                e.preventDefault();
                this.paste();
            } else if (modKey && e.key === 'd') {
                e.preventDefault();
                this.duplicate();
            }
        });
    }

    /**
     * Copy selected nodes to clipboard
     */
    copy() {
        const selectedNodes = this.graph.selection?.getSelectedNodes() || [];
        if (selectedNodes.length === 0) return;

        // Calculate center of selection for relative positioning
        let minX = Infinity, minY = Infinity;
        selectedNodes.forEach(node => {
            minX = Math.min(minX, node.position.x);
            minY = Math.min(minY, node.position.y);
        });

        // Serialize nodes with relative positions
        const nodesData = selectedNodes.map(node => {
            const data = node.serialize();
            data.position.x -= minX;
            data.position.y -= minY;
            return data;
        });

        // Get connections between selected nodes
        const nodeIds = new Set(selectedNodes.map(n => n.id));
        const connections = [];

        this.graph.connections.forEach(conn => {
            // Helper to safely get node ID from a slot or node (symbolic)
            const getNodeId = (item) => item.node ? item.node.id : item.id;

            const outputNodeId = getNodeId(conn.outputSlot);
            const inputNodeId = getNodeId(conn.inputSlot);

            if (nodeIds.has(outputNodeId) && nodeIds.has(inputNodeId)) {
                connections.push(conn.serialize());
            }
        });

        this._clipboardData = {
            nodes: nodesData,
            connections: connections
        };

        this.graph.emit('clipboard:copy', { nodes: selectedNodes });
    }

    /**
     * Cut selected nodes
     */
    cut() {
        this.copy();
        this.graph.selection?.deleteSelected();
        this.graph.emit('clipboard:cut', {});
    }

    /**
   * Paste nodes from clipboard
   */
    paste() {
        if (!this._clipboardData) return;

        // Get paste position (mouse position or center of viewport)
        let pasteX, pasteY;

        if (this.graph.lastMousePos) {
            const pos = this.graph.viewport.screenToGraph(this.graph.lastMousePos.x, this.graph.lastMousePos.y);
            pasteX = pos.x;
            pasteY = pos.y;
        } else {
            const viewportState = this.graph.viewport?.getState() || { panX: 0, panY: 0, scale: 1 };
            const containerRect = this.graph.container.getBoundingClientRect();
            pasteX = (containerRect.width / 2 - viewportState.panX) / viewportState.scale;
            pasteY = (containerRect.height / 2 - viewportState.panY) / viewportState.scale;
        }

        // Calculate bounds of original copied nodes to offset correctly
        // The clipboard data stores positions relative to the top-left of the selection
        // So pasting at mouse position should put the top-left of selection at mouse

        // Map old IDs to new IDs
        const idMap = new Map();

        // Clear current selection
        this.graph.selection?.clearSelection();

        // Create nodes
        const newNodes = [];
        this._clipboardData.nodes.forEach(nodeData => {
            const oldId = nodeData.id;

            // Clone data to avoid mutating clipboard source
            const processedData = JSON.parse(JSON.stringify(nodeData));

            // Set new position
            processedData.position = {
                x: pasteX + nodeData.position.x,
                y: pasteY + nodeData.position.y
            };

            // Clear ID to allow auto-generation
            delete processedData.id;

            // Emit interception event
            // User can modify 'processedData' properties (like header, body) or cancel
            const eventData = {
                data: processedData,
                originalId: oldId,
                cancel: false
            };

            this.graph.emit('clipboard:pasting', eventData);

            // Check if user cancelled this specific node paste
            if (eventData.cancel) return;

            // Create new node using the (potentially modified) data
            const newNode = this.graph.addNode(processedData);

            idMap.set(oldId, newNode.id);
            newNodes.push(newNode);

            // Select the new node
            this.graph.selection?.addToSelection(newNode);
        });

        // Recreate connections
        this._clipboardData.connections.forEach(connData => {
            const newOutputNodeId = idMap.get(connData.outputNodeId);
            const newInputNodeId = idMap.get(connData.inputNodeId);

            if (newOutputNodeId && newInputNodeId) {
                const outputNode = this.graph.getNode(newOutputNodeId);
                const inputNode = this.graph.getNode(newInputNodeId);

                if (outputNode && inputNode) {
                    const outputSlot = outputNode.getOutput(connData.outputSlotId);
                    const inputSlot = inputNode.getInput(connData.inputSlotId);

                    if (outputSlot && inputSlot) {
                        this.graph.connect(outputSlot, inputSlot, connData.style);
                    }
                }
            }
        });

        this.graph.emit('clipboard:paste', { nodes: newNodes });
    }

    /**
     * Duplicate selected nodes (copy + paste in place)
     */
    duplicate() {
        const selectedNodes = this.graph.selection?.getSelectedNodes() || [];
        if (selectedNodes.length === 0) return;

        // Store current clipboard and mouse pos
        const previousClipboard = this._clipboardData;
        const previousMousePos = this.graph.lastMousePos;

        // Copy
        this.copy();

        // Force paste at offset position relative to current position, NOT mouse
        // To do this, we need to trick paste() or handle it manually
        // Simplest: temporarily unset lastMousePos if we want relative offset, 
        // BUT user asked for duplicate to use MOUSE position too?
        // "Incolla e duplica devono posizionare il nodo dove si trova il mouse"
        // So distinct behavior:
        // Ctrl+D usually duplicates in place or with offset. 
        // But if user wants mouse position, then it acts like Copy+Paste at Mouse.

        // Let's follow instruction: "Incolla e duplica devono posizionare il nodo dove si trova il mouse"

        this.paste();

        // Restore
        this._clipboardData = previousClipboard;
        this.graph.lastMousePos = previousMousePos;
    }

    /**
     * Check if clipboard has data
     * @returns {boolean}
     */
    hasData() {
        return this._clipboardData !== null && this._clipboardData.nodes.length > 0;
    }

    /**
     * Clear clipboard
     */
    clear() {
        this._clipboardData = null;
    }
}
