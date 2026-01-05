import { uid } from './utils/uid.js';
import { calculateBezierPath } from './utils/bezier.js';

/**
 * Represents a connection between two slots
 */
export class Connection {
    /**
     * @param {object} config - Connection configuration
     * @param {Slot} config.outputSlot - Source slot (output)
     * @param {Slot} config.inputSlot - Target slot (input)
     * @param {SVGElement} config.svgLayer - SVG layer to draw on
     * @param {object} config.style - Connection style options
     */
    constructor(config) {
        this.id = config.id || uid('conn');
        this.outputSlot = config.outputSlot;
        this.inputSlot = config.inputSlot;
        this.svgLayer = config.svgLayer;
        this.style = {
            color: config.style?.color || '#667eea',
            width: config.style?.width || 2,
            dashed: config.style?.dashed || false,
            ...config.style
        };

        this.selected = false;
        this._createPath();
        this._bindEvents();
    }

    /**
     * Create the SVG path element
     */
    _createPath() {
        this.pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.pathElement.classList.add('ng-connection');
        this.pathElement.dataset.connectionId = this.id;

        this._applyStyle();
        this.updatePath();

        this.svgLayer.appendChild(this.pathElement);
    }

    /**
     * Apply style to the path
     */
    _applyStyle() {
        this.pathElement.setAttribute('stroke', this.style.color);
        this.pathElement.setAttribute('stroke-width', this.style.width);
        this.pathElement.setAttribute('fill', 'none');

        if (this.style.dashed) {
            this.pathElement.setAttribute('stroke-dasharray', '8,4');
        } else {
            this.pathElement.removeAttribute('stroke-dasharray');
        }
    }

    /**
     * Bind event listeners
     */
    _bindEvents() {
        // Dashed (symbolic) connections are non-interactive
        if (this.style.dashed) {
            this.pathElement.style.pointerEvents = 'none';
            return;
        }

        this.pathElement.addEventListener('click', (e) => {
            e.stopPropagation();
            // Delegate to selection manager
            if (this.outputSlot.node.graph) {
                this.outputSlot.node.graph.selection.selectConnection(this, e.ctrlKey || e.metaKey);
            }
        });

        this.pathElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Select if not already selected
            if (this.outputSlot.node.graph && !this.selected) {
                this.outputSlot.node.graph.selection.selectConnection(this);
            }

            this.pathElement.dispatchEvent(new CustomEvent('connection:contextmenu', {
                bubbles: true,
                detail: { connection: this, event: e }
            }));
        });

        this.pathElement.addEventListener('mouseenter', () => {
            this.pathElement.classList.add('ng-connection--hover');
        });

        this.pathElement.addEventListener('mouseleave', () => {
            this.pathElement.classList.remove('ng-connection--hover');
        });
    }

    /**
   * Update the path based on slot positions
   */
    updatePath() {
        const startPos = this.outputSlot.getConnectionPoint();
        const endPos = this.inputSlot.getConnectionPoint();

        // Check orientation (Slots have orientation, Nodes default to horizontal in getter)
        const startOrientation = this.outputSlot.orientation || 'horizontal';
        const endOrientation = this.inputSlot.orientation || 'horizontal';

        const pathData = calculateBezierPath(startPos, endPos, startOrientation, endOrientation);
        this.pathElement.setAttribute('d', pathData);
    }

    /**
     * Select this connection
     */
    select() {
        this.selected = true;
        this.pathElement.classList.add('ng-connection--selected');
    }

    /**
     * Deselect this connection
     */
    deselect() {
        this.selected = false;
        this.pathElement.classList.remove('ng-connection--selected');
    }

    /**
     * Set connection style
     * @param {object} style - Style options
     */
    setStyle(style) {
        this.style = { ...this.style, ...style };
        this._applyStyle();
    }

    /**
     * Destroy the connection
     */
    destroy() {
        // Remove from slots if they are slots
        if (this.outputSlot && this.outputSlot.connections) {
            this.outputSlot.connections.delete(this);
        }
        if (this.inputSlot && this.inputSlot.connections) {
            this.inputSlot.connections.delete(this);
        }

        // Remove DOM element
        if (this.pathElement && this.pathElement.parentNode) {
            this.pathElement.parentNode.removeChild(this.pathElement);
        }
    }

    /**
     * Serialize connection data
     * @returns {object} Serialized data
     */
    serialize() {
        // Helper to get ID whether it's a Slot or Node
        const getContextIds = (item) => {
            // If it has a node property, it's a Slot
            if (item.node) {
                return { nodeId: item.node.id, slotId: item.id };
            }
            // Otherwise assume it's a Node
            return { nodeId: item.id, slotId: null };
        };

        const outputIds = getContextIds(this.outputSlot);
        const inputIds = getContextIds(this.inputSlot);

        return {
            id: this.id,
            outputNodeId: outputIds.nodeId,
            outputSlotId: outputIds.slotId, // null for symbolic
            inputNodeId: inputIds.nodeId,
            inputSlotId: inputIds.slotId, // null for symbolic
            style: { ...this.style }
        };
    }
}
