/**
 * Manages node and connection selection
 */
export class SelectionManager {
    /**
     * @param {NodeGraph} graph - Parent graph
     */
    constructor(graph) {
        this.graph = graph;
        this.selectedNodes = new Set();
        this.selectedConnections = new Set();

        this._isBoxSelecting = false;
        this._boxStart = { x: 0, y: 0 };
        this._boxElement = null;

        this._bindEvents();
    }

    /**
     * Bind event listeners
     */
    _bindEvents() {
        // Box selection
        this.graph.container.addEventListener('mousedown', (e) => {
            // Only start box selection on left click on empty space
            if (e.button !== 0) return;
            // Don't select if panning with space
            if (this.graph.viewport.isPanningWithSpace) return;

            if (e.target !== this.graph.container &&
                e.target !== this.graph.nodesLayer &&
                !e.target.classList.contains('ng-viewport')) return;

            // Clear selection unless Ctrl is held
            if (!e.ctrlKey && !e.metaKey) {
                this.clearSelection();
            }

            this._startBoxSelection(e);
        });

        document.addEventListener('mousemove', (e) => {
            if (this._isBoxSelecting) {
                this._updateBoxSelection(e);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this._isBoxSelecting) {
                this._endBoxSelection();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Delete selected nodes
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (document.activeElement.tagName !== 'INPUT' &&
                    document.activeElement.tagName !== 'TEXTAREA') {
                    this.deleteSelected();
                }
            }

            // Select all
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                if (document.activeElement.tagName !== 'INPUT' &&
                    document.activeElement.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    this.selectAll();
                }
            }

            // Escape to deselect
            if (e.key === 'Escape') {
                this.clearSelection();
            }
        });
    }

    /**
     * Start box selection
     */
    _startBoxSelection(e) {
        const pos = this.graph.viewport.screenToGraph(e.clientX, e.clientY);
        this._boxStart = pos;
        this._isBoxSelecting = true;

        // Create selection box element
        this._boxElement = document.createElement('div');
        this._boxElement.className = 'ng-selection-box';
        this._boxElement.style.left = `${pos.x}px`;
        this._boxElement.style.top = `${pos.y}px`;
        this._boxElement.style.width = '0';
        this._boxElement.style.height = '0';
        this.graph.nodesLayer.appendChild(this._boxElement);
    }

    /**
     * Update box selection
     */
    _updateBoxSelection(e) {
        const pos = this.graph.viewport.screenToGraph(e.clientX, e.clientY);

        const x = Math.min(this._boxStart.x, pos.x);
        const y = Math.min(this._boxStart.y, pos.y);
        const width = Math.abs(pos.x - this._boxStart.x);
        const height = Math.abs(pos.y - this._boxStart.y);

        this._boxElement.style.left = `${x}px`;
        this._boxElement.style.top = `${y}px`;
        this._boxElement.style.width = `${width}px`;
        this._boxElement.style.height = `${height}px`;
    }

    /**
     * End box selection
     */
    _endBoxSelection() {
        if (!this._boxElement) return;

        const boxRect = {
            left: parseFloat(this._boxElement.style.left),
            top: parseFloat(this._boxElement.style.top),
            width: parseFloat(this._boxElement.style.width),
            height: parseFloat(this._boxElement.style.height)
        };
        boxRect.right = boxRect.left + boxRect.width;
        boxRect.bottom = boxRect.top + boxRect.height;

        // Select nodes within box
        this.graph.nodes.forEach(node => {
            const bounds = node.getBounds();
            if (this._rectsIntersect(boxRect, {
                left: bounds.x,
                top: bounds.y,
                right: bounds.x + bounds.width,
                bottom: bounds.y + bounds.height
            })) {
                this.addToSelection(node);
            }
        });

        // Remove box element
        this._boxElement.remove();
        this._boxElement = null;
        this._isBoxSelecting = false;
    }

    /**
     * Check if two rectangles intersect
     */
    _rectsIntersect(a, b) {
        return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
    }

    /**
     * Select a node
     * @param {Node} node - Node to select
     * @param {boolean} additive - Add to selection instead of replacing
     */
    selectNode(node, additive = false) {
        if (!additive) {
            this.clearSelection();
        }
        this.addToSelection(node);
    }

    /**
     * Add a node to selection
     * @param {Node} node - Node to add
     */
    addToSelection(node) {
        if (!this.selectedNodes.has(node)) {
            this.selectedNodes.add(node);
            node.select();
            this.graph.emit('selection:change', { nodes: Array.from(this.selectedNodes) });
        }
    }

    /**
     * Remove a node from selection
     * @param {Node} node - Node to remove
     */
    removeFromSelection(node) {
        if (this.selectedNodes.has(node)) {
            this.selectedNodes.delete(node);
            node.deselect();
            this.graph.emit('selection:change', { nodes: Array.from(this.selectedNodes) });
        }
    }

    /**
     * Toggle node selection
     * @param {Node} node - Node to toggle
     */
    toggleSelection(node) {
        if (this.selectedNodes.has(node)) {
            this.removeFromSelection(node);
        } else {
            this.addToSelection(node);
        }
    }

    /**
     * Select a connection
     * @param {Connection} connection - Connection to select
     * @param {boolean} additive - Add to selection instead of replacing
     */
    selectConnection(connection, additive = false) {
        if (!additive) {
            this.clearSelection(); // Deselect all nodes and other connections
        }
        if (!this.selectedConnections.has(connection)) {
            this.selectedConnections.add(connection);
            connection.select();
        }
    }

    /**
     * Clear connection selection
     */
    clearConnectionSelection() {
        this.selectedConnections.forEach(conn => conn.deselect());
        this.selectedConnections.clear();
    }

    /**
     * Clear all selection
     */
    clearSelection() {
        this.selectedNodes.forEach(node => node.deselect());
        this.selectedNodes.clear();
        this.clearConnectionSelection();
        this.graph.emit('selection:change', { nodes: [], connections: [] });
    }

    /**
     * Select all nodes
     */
    selectAll() {
        this.graph.nodes.forEach(node => {
            this.addToSelection(node);
        });
        // Optionally select connections too? 
        // User asked for "Select All" usually implies nodes.
    }

    /**
     * Delete selected nodes and connections
     */
    deleteSelected() {
        // Delete selected connections
        this.selectedConnections.forEach(conn => {
            this.graph.disconnect(conn.id);
        });
        this.selectedConnections.clear();

        // Delete selected nodes
        this.selectedNodes.forEach(node => {
            this.graph.removeNode(node.id);
        });
        this.selectedNodes.clear();

        this.graph.emit('selection:change', { nodes: [], connections: [] });
    }

    /**
     * Get selected nodes
     * @returns {Node[]}
     */
    getSelectedNodes() {
        return Array.from(this.selectedNodes);
    }

    /**
     * Check if a node is selected
     * @param {Node} node - Node to check
     * @returns {boolean}
     */
    isSelected(node) {
        return this.selectedNodes.has(node);
    }
}
