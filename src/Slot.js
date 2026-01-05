import { uid } from './utils/uid.js';

/**
 * Slot shapes available
 */
export const SlotShape = {
    CIRCLE: 'circle',
    SQUARE: 'square',
    ARROW: 'arrow',
    DIAMOND: 'diamond',
    CUSTOM: 'custom'
};

/**
 * Slot orientations
 */
export const SlotOrientation = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical'
};

/**
 * Represents an input or output slot on a node
 */
export class Slot {
    /**
     * @param {object} config - Slot configuration
     * @param {Node} config.node - Parent node
     * @param {string} config.type - 'input' or 'output'
     * @param {string} config.id - Slot ID
     * @param {string} config.label - Slot label
     * @param {string} config.shape - Slot shape (circle, square, arrow, diamond, custom)
    /**
     * @param {object} config - Slot configuration
     * @param {Node} config.node - Parent node
     * @param {string} config.type - 'input' or 'output'
     * @param {string} config.id - Slot ID
     * @param {string} config.label - Slot label
     * @param {string} config.shape - Slot shape (circle, square, arrow, diamond, custom)
     * @param {string} config.side - Side (left, right, top, bottom)
     * @param {string} config.align - Label alignment relative to connector
     * @param {boolean} config.edge - Whether to position on the edge
     * @param {string} config.orientation - horizontal or vertical
     * @param {string} config.color - Slot color
     * @param {number} config.size - Slot size in pixels
     * @param {number} config.clickAreaSize - Click area size (larger than visual size)
     * @param {boolean} config.highlightOnHover - Enable hover highlight
     * @param {string} config.customIcon - Custom icon HTML (for custom shape)
     */
    constructor(config) {
        this.id = config.id || uid('slot');
        this.node = config.node;
        this.type = config.type; // 'input' or 'output'
        this.label = config.label || '';
        this.shape = config.shape || SlotShape.CIRCLE;
        this.side = config.side || (config.type === 'input' ? 'left' : 'right');
        this.align = config.align; // e.g. 'left', 'right', 'top', 'bottom' (optional overrides)
        this.edge = config.edge || false;

        // Auto-detect orientation based on side if not specified
        if (!config.orientation) {
            this.orientation = (this.side === 'top' || this.side === 'bottom')
                ? SlotOrientation.VERTICAL
                : SlotOrientation.HORIZONTAL;
        } else {
            this.orientation = config.orientation;
        }

        this.color = config.color || '#667eea';
        this.size = config.size || 12;
        this.clickAreaSize = config.clickAreaSize || this.size + 10;
        this.highlightOnHover = config.highlightOnHover !== false;
        this.customIcon = config.customIcon || null;

        // Connections limit
        if (config.maxConnections !== undefined) {
            this.maxConnections = config.maxConnections;
        } else {
            this.maxConnections = this.type === 'input' ? 1 : Infinity;
        }

        this.connections = new Set();

        this._createElement();
        this._bindEvents();
    }

    /**
     * Create the slot DOM element
     */
    _createElement() {
        // Slot container
        this.element = document.createElement('div');
        this.element.className = `ng-slot ng-slot--${this.side} ng-slot--${this.orientation}`;
        if (this.edge) this.element.classList.add('ng-slot--edge');

        this.element.dataset.slotId = this.id;
        this.element.dataset.slotType = this.type;

        // Set CSS variables for size and color
        this.element.style.setProperty('--ng-slot-size', `${this.size}px`);
        this.element.style.setProperty('--ng-slot-color', this.color);

        // Slot connector (the visual dot/shape)
        this.connectorElement = document.createElement('div');
        this.connectorElement.className = `ng-slot-connector ng-slot-connector--${this.shape}`;
        // Dimensions and color handled by CSS variables in class

        // Click area (invisible, larger than visual)
        this.clickAreaElement = document.createElement('div');
        this.clickAreaElement.className = 'ng-slot-click-area';
        this.clickAreaElement.style.width = `${this.clickAreaSize}px`;
        this.clickAreaElement.style.height = `${this.clickAreaSize}px`;

        // Label
        if (this.label) {
            this.labelElement = document.createElement('span');
            this.labelElement.className = 'ng-slot-label';
            this.labelElement.textContent = this.label;

            // Custom label alignment styles could be applied here or via CSS classes
            // For now, flex-direction controls basic relative position.
        }

        // Custom icon
        if (this.shape === SlotShape.CUSTOM && this.customIcon) {
            this.connectorElement.innerHTML = this.customIcon;
        }

        // Assemble
        this.connectorElement.appendChild(this.clickAreaElement);

        // Append order determines visual order (flex direction handles layout)
        // Standard flex-direction for side handles dot vs label order.
        // We append Label then Connector for everything, and let CSS order it?
        // OR append strictly.
        // CSS:
        // Left: Row -> Label, Connector (Wait, Left side usually: Connector, Label? No, Input on Left: Connector on left edge, Label inside. 
        // Input Left: Connector, Label.
        // Output Right: Label, Connector.

        // Our CSS:
        // .ng-slot--left { flex-direction: row; margin-left: -6px; } -> Connector, Label
        // .ng-slot--right { flex-direction: row-reverse; margin-right: -6px; } -> Connector, Label (reversed) -> Label, Connector.
        // Correct.

        // So we ALWAYS append Connector then Label?
        // If we append Connector then Label:
        // Row (Left): Connector Left, Label Right. (Correct for Input on Left)
        // Row-Reverse (Right): Label Left, Connector Right. (Correct for Output on Right)
        // Column (Top): Connector Top, Label Bottom. (Correct for Top)
        // Column-Reverse (Bottom): Label Top, Connector Bottom. (Correct for Bottom)

        this.element.appendChild(this.connectorElement);
        if (this.labelElement) this.element.appendChild(this.labelElement);
    }

    /**
     * Bind event listeners
     */
    _bindEvents() {
        // Hover highlight
        this.clickAreaElement.addEventListener('mouseenter', () => {
            if (this.highlightOnHover) {
                this.highlight(true);
            }
            this.element.dispatchEvent(new CustomEvent('slot:hover', {
                bubbles: true,
                detail: { slot: this }
            }));
        });

        this.clickAreaElement.addEventListener('mouseleave', () => {
            if (this.highlightOnHover) {
                this.highlight(false);
            }
            this.element.dispatchEvent(new CustomEvent('slot:hoverend', {
                bubbles: true,
                detail: { slot: this }
            }));
        });

        // Connection drag start
        this.clickAreaElement.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Left click only
            e.stopPropagation();

            this.element.dispatchEvent(new CustomEvent('slot:dragstart', {
                bubbles: true,
                detail: { slot: this, event: e }
            }));
        });

        // Click
        this.clickAreaElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.element.dispatchEvent(new CustomEvent('slot:click', {
                bubbles: true,
                detail: { slot: this, event: e }
            }));
        });
    }

    /**
     * Get the connection point position (in graph coordinates)
     * @returns {object} Position {x, y}
     */
    getConnectionPoint() {
        const connectorRect = this.connectorElement.getBoundingClientRect();
        const nodeRect = this.node.element.getBoundingClientRect();

        // Get position relative to node
        const relX = connectorRect.left - nodeRect.left + connectorRect.width / 2;
        const relY = connectorRect.top - nodeRect.top + connectorRect.height / 2;

        // Add node position
        return {
            x: this.node.position.x + relX,
            y: this.node.position.y + relY
        };
    }

    /**
     * Highlight the slot
     * @param {boolean} active - Active state
     */
    highlight(active) {
        if (active) {
            this.connectorElement.classList.add('ng-slot-connector--highlight');
        } else {
            this.connectorElement.classList.remove('ng-slot-connector--highlight');
        }
    }

    /**
     * Set slot color
     * @param {string} color - CSS color
     */
    setColor(color) {
        this.color = color;
        this.element.style.setProperty('--ng-slot-color', color);
    }

    /**
     * Set slot size
     * @param {number} size - Size in pixels
     */
    setSize(size) {
        this.size = size;
        this.element.style.setProperty('--ng-slot-size', `${size}px`);
    }

    /**
     * Set label
     * @param {string} label - Label text
     */
    setLabel(label) {
        this.label = label;
        if (this.labelElement) {
            this.labelElement.textContent = label;
        }
    }

    /**
     * Check if connected
     * @returns {boolean}
     */
    isConnected() {
        return this.connections.size > 0;
    }

    /**
     * Get connected slots
     * @returns {Slot[]}
     */
    getConnectedSlots() {
        const slots = [];
        this.connections.forEach(conn => {
            if (this.type === 'output') {
                slots.push(conn.inputSlot);
            } else {
                slots.push(conn.outputSlot);
            }
        });
        return slots;
    }

    /**
     * Destroy the slot
     */
    destroy() {
        // Remove all connections
        this.connections.forEach(conn => conn.destroy());
        this.connections.clear();

        // Remove DOM element
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }

    /**
     * Serialize slot data
     * @returns {object} Serialized data
     */
    serialize() {
        return {
            id: this.id,
            type: this.type,
            label: this.label,
            shape: this.shape,
            orientation: this.orientation,
            side: this.side,
            align: this.align,
            edge: this.edge,
            color: this.color,
            size: this.size
        };
    }
}
