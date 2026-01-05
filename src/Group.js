import { uid } from './utils/uid.js';

/**
 * Represents a group container for nodes
 */
export class Group {
    /**
     * @param {object} config - Group configuration
     * @param {NodeGraph} config.graph - Parent graph
     * @param {string} config.id - Group ID
     * @param {string} config.label - Group label
     * @param {string} config.color - Background color
     * @param {object} config.position - Position {x, y}
     * @param {object} config.size - Size {width, height}
     * @param {number} config.padding - Padding around nodes
     */
    constructor(config) {
        this.id = config.id || uid('group');
        this.graph = config.graph;
        this.label = config.label || 'Group';
        this.color = config.color || 'rgba(102, 126, 234, 0.1)';
        this.position = { x: config.position?.x || 0, y: config.position?.y || 0 };
        this.size = { width: config.size?.width || 200, height: config.size?.height || 150 };
        this.padding = config.padding || 20;
        this.nodes = new Set();

        this._createElement();
        this._bindEvents();
        this._updateStyle();
    }

    /**
     * Create the group DOM element
     */
    _createElement() {
        this.element = document.createElement('div');
        this.element.className = 'ng-group';
        this.element.dataset.groupId = this.id;

        // Header with label
        this.headerElement = document.createElement('div');
        this.headerElement.className = 'ng-group-header';

        this.labelElement = document.createElement('span');
        this.labelElement.className = 'ng-group-label';
        this.labelElement.textContent = this.label;
        this.labelElement.contentEditable = false;
        this.headerElement.appendChild(this.labelElement);

        this.element.appendChild(this.headerElement);

        // Resize handle
        this.resizeHandle = document.createElement('div');
        this.resizeHandle.className = 'ng-group-resize-handle';
        this.element.appendChild(this.resizeHandle);

        this._updatePosition();
        this._updateSize();
    }

    /**
     * Bind event listeners
     */
    _bindEvents() {
        let isDragging = false;
        let isResizing = false;
        let dragStart = { x: 0, y: 0 };
        let startPos = { x: 0, y: 0 };
        let startSize = { width: 0, height: 0 };

        // Drag header to move group
        this.headerElement.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            e.stopPropagation();

            isDragging = true;
            dragStart = { x: e.clientX, y: e.clientY };
            startPos = { ...this.position };

            // Capture colliding nodes
            const collidingNodes = [];
            const groupRect = this._getGraphRect();

            this.graph.nodes.forEach(node => {
                const nodeBounds = node.getBounds();
                // Check intersection
                if (this._rectsIntersect(groupRect, nodeBounds)) {
                    collidingNodes.push(node);
                }
            });

            this.collidingNodes = collidingNodes;

            this.element.classList.add('ng-group--dragging');
        });

        // Resize handle
        this.resizeHandle.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            e.stopPropagation();

            isResizing = true;
            dragStart = { x: e.clientX, y: e.clientY };
            startSize = { ...this.size };

            this.element.classList.add('ng-group--resizing');
        });

        document.addEventListener('mousemove', (e) => {
            const scale = this.graph?.viewport?.scale || 1;

            if (isDragging) {
                const dx = (e.clientX - dragStart.x) / scale;
                const dy = (e.clientY - dragStart.y) / scale;

                // Move group
                this.position.x = startPos.x + dx;
                this.position.y = startPos.y + dy;
                this._updatePosition();

                // Move colliding nodes
                if (this.collidingNodes) {
                    this.collidingNodes.forEach(node => {
                        node.moveBy(dx - (this.lastDx || 0), dy - (this.lastDy || 0));
                    });
                    this.lastDx = dx;
                    this.lastDy = dy;
                }
            }

            if (isResizing) {
                const dx = (e.clientX - dragStart.x) / scale;
                const dy = (e.clientY - dragStart.y) / scale;

                this.size.width = Math.max(100, startSize.width + dx);
                this.size.height = Math.max(60, startSize.height + dy);
                this._updateSize();

                startSize = { ...this.size };
                dragStart = { x: e.clientX, y: e.clientY };
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.element.classList.remove('ng-group--dragging');
                this.collidingNodes = null;
                this.lastDx = 0;
                this.lastDy = 0;
            }
            if (isResizing) {
                isResizing = false;
                this.element.classList.remove('ng-group--resizing');
            }
        });

        // Double click to edit label
        this.labelElement.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this._startEditLabel();
        });

        // Context menu
        this.element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.element.dispatchEvent(new CustomEvent('group:contextmenu', {
                bubbles: true,
                detail: { group: this, event: e }
            }));
        });
    }

    /**
     * Start editing the label
     */
    _startEditLabel() {
        this.labelElement.contentEditable = true;
        this.labelElement.focus();

        // Select all text
        const range = document.createRange();
        range.selectNodeContents(this.labelElement);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        const finishEdit = () => {
            this.labelElement.contentEditable = false;
            this.label = this.labelElement.textContent || 'Group';
            this.labelElement.removeEventListener('blur', finishEdit);
            this.labelElement.removeEventListener('keydown', onKeyDown);
        };

        const onKeyDown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                finishEdit();
            }
            if (e.key === 'Escape') {
                this.labelElement.textContent = this.label;
                finishEdit();
            }
        };

        this.labelElement.addEventListener('blur', finishEdit);
        this.labelElement.addEventListener('keydown', onKeyDown);
    }

    /**
     * Update element position
     */
    _updatePosition() {
        this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
    }

    /**
     * Update element size
     */
    _updateSize() {
        this.element.style.width = `${this.size.width}px`;
        this.element.style.height = `${this.size.height}px`;
    }

    /**
     * Update element style
     */
    _updateStyle() {
        this.element.style.backgroundColor = this.color;
    }

    /**
     * Add a node to the group
     * @param {Node} node - Node to add
     */
    addNode(node) {
        this.nodes.add(node);
        node.group = this;
    }

    /**
     * Remove a node from the group
     * @param {Node} node - Node to remove
     */
    removeNode(node) {
        this.nodes.delete(node);
        if (node.group === this) {
            node.group = null;
        }
    }

    /**
     * Set group label
     * @param {string} label - New label
     */
    setLabel(label) {
        this.label = label;
        this.labelElement.textContent = label;
    }

    /**
     * Set group color
     * @param {string} color - CSS color
     */
    setColor(color) {
        this.color = color;
        this._updateStyle();
    }

    /**
     * Auto-resize to fit contained nodes
     */
    fitToNodes() {
        if (this.nodes.size === 0) return;

        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        this.nodes.forEach(node => {
            const bounds = node.getBounds();
            minX = Math.min(minX, bounds.x);
            minY = Math.min(minY, bounds.y);
            maxX = Math.max(maxX, bounds.x + bounds.width);
            maxY = Math.max(maxY, bounds.y + bounds.height);
        });

        this.position.x = minX - this.padding;
        this.position.y = minY - this.padding - 30; // Account for header
        this.size.width = maxX - minX + this.padding * 2;
        this.size.height = maxY - minY + this.padding * 2 + 30;

        this._updatePosition();
        this._updateSize();
    }

    /**
   * Get group rect in graph space
   */
    _getGraphRect() {
        return {
            left: this.position.x,
            top: this.position.y,
            right: this.position.x + this.size.width,
            bottom: this.position.y + this.size.height,
            width: this.size.width,
            height: this.size.height
        };
    }

    /**
     * Check if two rects intersect
     */
    _rectsIntersect(a, b) {
        const aRight = a.left + a.width;
        const aBottom = a.top + a.height;
        const bRight = b.x + b.width; // Node bounds use x, y, width, height
        const bBottom = b.y + b.height;

        return !(a.left > bRight ||
            aRight < b.x ||
            a.top > bBottom ||
            aBottom < b.y);
    }

    /**
     * Destroy the group
     */
    destroy() {
        // Remove nodes reference to this group
        this.nodes.forEach(node => {
            if (node.group === this) {
                node.group = null;
            }
        });
        this.nodes.clear();

        // Remove DOM element
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }

    /**
     * Serialize group data
     * @returns {object} Serialized data
     */
    serialize() {
        return {
            id: this.id,
            label: this.label,
            color: this.color,
            position: { ...this.position },
            size: { ...this.size },
            nodeIds: Array.from(this.nodes).map(n => n.id)
        };
    }
}
