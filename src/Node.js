import { uid } from './utils/uid.js';
import { Slot, SlotShape, SlotOrientation } from './Slot.js';

/**
 * Represents a node in the graph
 */
export class Node {
    /**
     * @param {object} config - Node configuration
     * @param {NodeGraph} config.graph - Parent graph
     * @param {string} config.id - Node ID
     * @param {object} config.position - Initial position {x, y}
     * @param {object} config.header - Header configuration
     * @param {object} config.body - Body configuration
     * @param {object} config.footer - Footer configuration
     * @param {Array} config.inputs - Input slot configurations
     * @param {Array} config.outputs - Output slot configurations
     * @param {string} config.className - Additional CSS class
     * @param {boolean} config.draggable - Enable dragging
     */
    constructor(config) {
        this.id = config.id || uid('node');
        this.graph = config.graph;
        this.position = { x: config.position?.x || 0, y: config.position?.y || 0 };
        this.draggable = config.draggable !== false;
        this.selected = false;
        this.resizable = config.resizable || false;
        this.data = config.data || {};

        this.inputSlots = new Map();
        this.outputSlots = new Map();
        this.connections = new Set(); // For symbolic connections directly to node

        this._createElement(config);
        this._createSlots(config.inputs, config.outputs);
        this._bindEvents();
        this._updatePosition();
    }

    /**
     * Create the node DOM element
     */
    _createElement(config) {
        // Main container
        this.element = document.createElement('div');
        this.element.className = 'ng-node';
        if (config.className) {
            this.element.classList.add(config.className);
        }
        this.element.dataset.nodeId = this.id;
        this.element.style.transform = `translate(${config.position.x}px, ${config.position.y}px)`;

        // Main wrapper for layout
        const wrapper = document.createElement('div');
        wrapper.className = 'ng-node-wrapper';
        this.element.appendChild(wrapper);

        // Top slots container
        this.slotsTop = document.createElement('div');
        this.slotsTop.className = 'ng-node-slots-top';
        if (config.slotsTop && config.slotsTop.style) {
            Object.assign(this.slotsTop.style, config.slotsTop.style);
        }
        wrapper.appendChild(this.slotsTop);

        // Header
        this.headerElement = document.createElement('div');
        this.headerElement.className = 'ng-node-header';
        if (config.header && config.header.content) {
            this.headerElement.innerHTML = config.header.content;
        }
        if (config.header && config.header.className) {
            this.headerElement.classList.add(config.header.className);
        }
        if (config.header && config.header.style) {
            Object.assign(this.headerElement.style, config.header.style);
        }
        wrapper.appendChild(this.headerElement);

        // Middle container (Left Slots + Content + Right Slots)
        const middle = document.createElement('div');
        middle.className = 'ng-node-middle';
        wrapper.appendChild(middle);

        // Left slots
        this.slotsLeft = document.createElement('div');
        this.slotsLeft.className = 'ng-node-slots-left';
        if (config.slotsLeft && config.slotsLeft.style) {
            Object.assign(this.slotsLeft.style, config.slotsLeft.style);
        }
        middle.appendChild(this.slotsLeft);

        // Content container (Body + Footer)
        const content = document.createElement('div');
        content.className = 'ng-node-content';
        middle.appendChild(content);

        // Body
        this.bodyElement = document.createElement('div');
        this.bodyElement.className = 'ng-node-body';
        if (config.body && config.body.content) {
            this.bodyElement.innerHTML = config.body.content;
        }
        if (config.body && config.body.className) {
            this.bodyElement.classList.add(config.body.className);
        }
        if (config.body && config.body.style) {
            Object.assign(this.bodyElement.style, config.body.style);
        }
        content.appendChild(this.bodyElement);

        // Footer
        this.footerElement = document.createElement('div');
        this.footerElement.className = 'ng-node-footer';
        if (config.footer && config.footer.content) {
            this._setContent(this.footerElement, config.footer.content);
        } else {
            this.footerElement.style.display = 'none';
        }
        if (config.footer && config.footer.className) {
            this.footerElement.classList.add(config.footer.className);
        }
        if (config.footer && config.footer.style) {
            Object.assign(this.footerElement.style, config.footer.style);
        }
        content.appendChild(this.footerElement);

        // Right slots
        this.slotsRight = document.createElement('div');
        this.slotsRight.className = 'ng-node-slots-right';
        if (config.slotsRight && config.slotsRight.style) {
            Object.assign(this.slotsRight.style, config.slotsRight.style);
        }
        middle.appendChild(this.slotsRight);

        // Bottom slots
        this.slotsBottom = document.createElement('div');
        this.slotsBottom.className = 'ng-node-slots-bottom';
        if (config.slotsBottom && config.slotsBottom.style) {
            Object.assign(this.slotsBottom.style, config.slotsBottom.style);
        }
        wrapper.appendChild(this.slotsBottom);

        // Resize handle
        if (this.resizable) {
            this.resizeHandle = document.createElement('div');
            this.resizeHandle.className = 'ng-node-resize-handle';
            this.element.appendChild(this.resizeHandle);
        }
    }

    /**
     * Set content of an element (string or HTML)
     */
    _setContent(element, content) {
        if (content === undefined || content === null) return;

        if (typeof content === 'string') {
            // Check if it looks like HTML
            if (content.trim().startsWith('<')) {
                element.innerHTML = content;
            } else {
                element.textContent = content;
            }
        } else if (content instanceof HTMLElement) {
            element.appendChild(content);
        }
    }

    /**
     * Create input/output slots
     */
    _createSlots(inputs = [], outputs = []) {
        // Create input slots
        inputs.forEach(config => {
            this.addInputSlot(config);
        });

        // Create output slots
        outputs.forEach(config => {
            this.addOutputSlot(config);
        });
    }

    /**
    * Bind event listeners
    */
    _bindEvents() {
        let isDragging = false;
        let dragStartPos = { x: 0, y: 0 };
        // Map to store start positions of all selected nodes
        const selectedNodesStartPositions = new Map();

        const onMouseDown = (e) => {
            // Ignore if clicking on slot or interactive element
            if (e.target.closest('.ng-slot-click-area') ||
                e.target.closest('input') ||
                e.target.closest('button') ||
                e.target.closest('select') ||
                e.target.closest('textarea')) {
                return;
            }

            // Left click only
            if (e.button !== 0) return;

            e.stopPropagation();

            // Emit select event (parent Graph handles actual selection toggle)
            this.element.dispatchEvent(new CustomEvent('node:select', {
                bubbles: true,
                detail: { node: this, event: e }
            }));

            if (!this.draggable) return;

            isDragging = true;
            dragStartPos = { x: e.clientX, y: e.clientY };

            // Prepare multi-selection drag
            // Only drag other selected nodes if THIS node is part of the selection
            // If it's not selected (or just selected via this click), it might be the only one
            const selection = this.graph?.selection;

            // Wait for next tick to ensure selection is updated by the event listener above?
            // Actually the event is synchronous but the handler on Graph might assume standard bubbling.
            // However, we can check if it IS selected.
            // If it was just clicked, it might have been added to selection.

            // We will rely on the fact that if this node is dragged, we want to drag all selected nodes
            // IF this node is currently selected.

            selectedNodesStartPositions.clear();

            if (selection && selection.isSelected(this)) {
                selection.getSelectedNodes().forEach(node => {
                    selectedNodesStartPositions.set(node, { ...node.position });
                    node.element.classList.add('ng-node--dragging');
                });
            } else {
                // Fallback if not selected (shouldn't happen if select event works, but safe fallback)
                selectedNodesStartPositions.set(this, { ...this.position });
                this.element.classList.add('ng-node--dragging');
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;

            const scale = this.graph?.viewport?.scale || 1;
            const dx = (e.clientX - dragStartPos.x) / scale;
            const dy = (e.clientY - dragStartPos.y) / scale;

            selectedNodesStartPositions.forEach((startPos, node) => {
                node.moveTo(startPos.x + dx, startPos.y + dy);
            });

            // Emit drag event
            this.element.dispatchEvent(new CustomEvent('node:drag', {
                bubbles: true,
                detail: { node: this }
            }));
        };

        const onMouseUp = () => {
            if (!isDragging) return;
            isDragging = false;

            selectedNodesStartPositions.forEach((_, node) => {
                node.element.classList.remove('ng-node--dragging');
            });

            // Snap to grid if enabled
            if (this.graph?.options?.snapToGrid) {
                const step = this.graph.options.grid?.step || 20;
                selectedNodesStartPositions.forEach((_, node) => {
                    node.moveTo(
                        Math.round(node.position.x / step) * step,
                        Math.round(node.position.y / step) * step
                    );
                });
            }

            // Emit dragend event
            this.element.dispatchEvent(new CustomEvent('node:dragend', {
                bubbles: true,
                detail: { node: this }
            }));

            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            selectedNodesStartPositions.clear();
        };

        this.element.addEventListener('mousedown', onMouseDown);

        // Resize handle logic
        if (this.resizable && this.resizeHandle) {
            let isResizing = false;
            let startSize = { width: 0, height: 0 };
            let resizeStartPos = { x: 0, y: 0 };

            this.resizeHandle.addEventListener('mousedown', (e) => {
                e.stopPropagation(); // Prevent node drag
                if (e.button !== 0) return;

                isResizing = true;
                resizeStartPos = { x: e.clientX, y: e.clientY };
                const rect = this.element.getBoundingClientRect();
                // Store current style size or computed size
                startSize = { width: rect.width, height: rect.height };

                // Force current dimensions to style to prevent snap-back if it was auto
                this.element.style.width = `${rect.width}px`;
                this.element.style.height = `${rect.height}px`;

                this.element.classList.add('ng-node--resizing');

                document.addEventListener('mousemove', onResizeMove);
                document.addEventListener('mouseup', onResizeUp);
            });

            const onResizeMove = (e) => {
                if (!isResizing) return;

                const scale = this.graph?.viewport?.scale || 1;
                const dx = (e.clientX - resizeStartPos.x) / scale;
                const dy = (e.clientY - resizeStartPos.y) / scale;

                const newWidth = Math.max(100, startSize.width + dx); // Min width 100
                const newHeight = Math.max(50, startSize.height + dy); // Min height 50

                this.element.style.width = `${newWidth}px`;
                this.element.style.height = `${newHeight}px`;

                this._updateConnections();
            };

            const onResizeUp = () => {
                isResizing = false;
                this.element.classList.remove('ng-node--resizing');
                document.removeEventListener('mousemove', onResizeMove);
                document.removeEventListener('mouseup', onResizeUp);

                this.element.dispatchEvent(new CustomEvent('node:resize', {
                    bubbles: true,
                    detail: { node: this }
                }));
            };
        }

        // Context menu
        this.element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.element.dispatchEvent(new CustomEvent('node:contextmenu', {
                bubbles: true,
                detail: { node: this, event: e }
            }));
        });
    }

    /**
     * Update element position
     */
    _updatePosition() {
        this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
    }

    /**
     * Update all connection paths
     */
    _updateConnections() {
        // Update input connections
        this.inputSlots.forEach(slot => {
            slot.connections.forEach(conn => conn.updatePath());
        });

        // Update output connections
        this.outputSlots.forEach(slot => {
            slot.connections.forEach(conn => conn.updatePath());
        });

        // Update symbolic connections
        this.connections.forEach(conn => conn.updatePath());
    }

    /**
     * Move node to position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    moveTo(x, y) {
        this.position.x = x;
        this.position.y = y;
        this._updatePosition();
        this._updateConnections();
    }

    /**
     * Move node by delta
     * @param {number} dx - Delta X
     * @param {number} dy - Delta Y
     */
    moveBy(dx, dy) {
        this.moveTo(this.position.x + dx, this.position.y + dy);
    }

    /**
     * Add an input slot
     * @param {object} config - Slot configuration
     * @returns {Slot} Created slot
     */
    addInputSlot(config) {
        const slot = new Slot({
            ...config,
            node: this,
            type: 'input'
        });
        this.inputSlots.set(slot.id, slot);

        // Append to correct container
        const side = config.side || 'left';
        if (side === 'top') {
            this.slotsTop.appendChild(slot.element);
        } else if (side === 'bottom') {
            this.slotsBottom.appendChild(slot.element);
        } else if (side === 'right') {
            this.slotsRight.appendChild(slot.element);
        } else { // Default to left
            this.slotsLeft.appendChild(slot.element);
        }

        return slot;
    }

    /**
     * Add an output slot
     * @param {object} config - Slot configuration
     * @returns {Slot} Created slot
     */
    addOutputSlot(config) {
        const slot = new Slot({
            ...config,
            node: this,
            type: 'output'
        });
        this.outputSlots.set(slot.id, slot);

        // Append to correct container
        const side = config.side || 'right';
        if (side === 'top') {
            this.slotsTop.appendChild(slot.element);
        } else if (side === 'bottom') {
            this.slotsBottom.appendChild(slot.element);
        } else if (side === 'left') {
            this.slotsLeft.appendChild(slot.element);
        } else { // Default to right
            this.slotsRight.appendChild(slot.element);
        }

        return slot;
    }

    /**
     * Get an input slot by ID
     * @param {string} id - Slot ID
     * @returns {Slot|undefined}
     */
    getInput(id) {
        return this.inputSlots.get(id);
    }

    /**
     * Get an output slot by ID
     * @param {string} id - Slot ID
     * @returns {Slot|undefined}
     */
    getOutput(id) {
        return this.outputSlots.get(id);
    }

    /**
     * Remove a slot
     * @param {string} id - Slot ID
     */
    removeSlot(id) {
        if (this.inputSlots.has(id)) {
            this.inputSlots.get(id).destroy();
            this.inputSlots.delete(id);
        } else if (this.outputSlots.has(id)) {
            this.outputSlots.get(id).destroy();
            this.outputSlots.delete(id);
        }
    }

    /**
     * Set header content
     * @param {string|HTMLElement} content - Content to set
     */
    setHeader(content) {
        if (this.headerElement) {
            this._setContent(this.headerElement, content);
        }
    }

    /**
     * Set body content
     * @param {string|HTMLElement} content - Content to set
     */
    setBody(content) {
        if (this.bodyElement) {
            this._setContent(this.bodyElement, content);
        }
    }

    /**
     * Set footer content
     * @param {string|HTMLElement} content - Content to set
     */
    setFooter(content) {
        if (this.footerElement) {
            this._setContent(this.footerElement, content);
        }
    }

    /**
     * Select this node
     */
    select() {
        this.selected = true;
        this.element.classList.add('ng-node--selected');
    }

    /**
     * Deselect this node
     */
    deselect() {
        this.selected = false;
        this.element.classList.remove('ng-node--selected');
    }

    /**
     * Get node bounding box
     * @returns {object} {x, y, width, height}
     */
    getBounds() {
        const rect = this.element.getBoundingClientRect();
        return {
            x: this.position.x,
            y: this.position.y,
            width: rect.width,
            height: rect.height
        };
    }

    /**
     * Destroy the node
     */
    destroy() {
        // Destroy all slots (which will destroy connections)
        this.inputSlots.forEach(slot => slot.destroy());
        this.outputSlots.forEach(slot => slot.destroy());
        this.inputSlots.clear();
        this.outputSlots.clear();

        // Destroy symbolic connections
        this.connections.forEach(conn => conn.destroy());
        this.connections.clear();

        // Remove DOM element
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }

    /**
     * Helper to extract style/class config from element
     */
    _extractConfig(element) {
        if (!element) return null;
        const config = {};
        if (element.innerHTML) config.content = element.innerHTML;
        if (element.className) {
            // Filter out default classes
            const classes = Array.from(element.classList)
                .filter(c => !c.startsWith('ng-node-'));
            if (classes.length > 0) config.className = classes.join(' ');
        }
        if (element.style && element.style.length > 0) {
            config.style = {};
            for (let i = 0; i < element.style.length; i++) {
                const prop = element.style[i];
                config.style[prop] = element.style.getPropertyValue(prop);
            }
        }
        return Object.keys(config).length > 0 ? config : null;
    }

    /**
     * Helper to extract style from container
     */
    _extractContainerConfig(element) {
        if (!element) return null;
        const config = {};
        if (element.style && element.style.length > 0) {
            config.style = {};
            for (let i = 0; i < element.style.length; i++) {
                const prop = element.style[i];
                config.style[prop] = element.style.getPropertyValue(prop);
            }
        }
        return Object.keys(config).length > 0 ? config : null;
    }

    /**
     * Serialize node data
     * @returns {object} Serialized data
     */
    serialize() {
        return {
            id: this.id,
            data: JSON.parse(JSON.stringify(this.data)), // Deep copy to ensure independence
            position: { ...this.position },

            header: this._extractConfig(this.headerElement),
            body: this._extractConfig(this.bodyElement),
            footer: this._extractConfig(this.footerElement),

            slotsTop: this._extractContainerConfig(this.slotsTop),
            slotsBottom: this._extractContainerConfig(this.slotsBottom),
            slotsLeft: this._extractContainerConfig(this.slotsLeft),
            slotsRight: this._extractContainerConfig(this.slotsRight),

            inputs: Array.from(this.inputSlots.values()).map(s => s.serialize()),
            outputs: Array.from(this.outputSlots.values()).map(s => s.serialize())
        };
    }

    /**
     * Get slots belonging to a specific group
     * @param {string} groupName 
     * @returns {Slot[]}
     */
    getSlotsByGroup(groupName) {
        const slots = [];
        this.inputSlots.forEach(s => { if (s.group === groupName) slots.push(s); });
        this.outputSlots.forEach(s => { if (s.group === groupName) slots.push(s); });
        return slots;
    }

    /**
     * Get the connection point for this node (center)
     * @returns {object} {x, y}
     */
    getConnectionPoint() {
        const rect = this.element.getBoundingClientRect();
        // Return limits relative to graph would be better, but node.position is graph space
        // Let's use node center in graph space
        // We can't rely on rect for width/height if it hasn't rendered, but usually it has
        // Fallback to approximate size if rect is 0
        const width = rect.width || 200;
        const height = rect.height || 100;

        return {
            x: this.position.x + width / 2,
            y: this.position.y + height / 2
        };
    }

    /**
     * Get orientation for connections (defaults to horizontal)
     */
    get orientation() {
        return 'horizontal';
    }
}
