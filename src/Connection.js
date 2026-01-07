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
        // Visible path
        this.pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.pathElement.classList.add('ng-connection');
        this.pathElement.dataset.connectionId = this.id;

        // Hit Area path (invisible, wider)
        this.hitPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.hitPathElement.classList.add('ng-connection-hit-area');
        this.hitPathElement.dataset.connectionId = this.id;

        this._applyStyle();
        this.updatePath();

        // Append visible first, then hit area (so hit area is on top)
        this.svgLayer.appendChild(this.pathElement);
        this.svgLayer.appendChild(this.hitPathElement);
    }

    /**
     * Apply style to the path
     */
    _applyStyle() {
        // Style visible path
        this.pathElement.setAttribute('stroke', this.style.color);
        this.pathElement.setAttribute('stroke-width', this.style.width);
        this.pathElement.setAttribute('fill', 'none');

        // Style hit path
        this.hitPathElement.setAttribute('stroke', 'transparent');
        this.hitPathElement.setAttribute('stroke-width', Math.max(20, this.style.width * 5)); // Minimum 20px hit area
        this.hitPathElement.setAttribute('fill', 'none');

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
            this.hitPathElement.style.pointerEvents = 'none';
            return;
        }

        // Bind events to the HIT AREA, not the visible path
        this.hitPathElement.addEventListener('click', (e) => {
            e.stopPropagation();
            // Delegate to selection manager
            if (this.outputSlot.node.graph) {
                this.outputSlot.node.graph.selection.selectConnection(this, e.ctrlKey || e.metaKey);
            }
        });

        this.hitPathElement.addEventListener('contextmenu', (e) => {
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

        this.hitPathElement.addEventListener('mouseenter', () => {
            this.pathElement.classList.add('ng-connection--hover');
        });

        this.hitPathElement.addEventListener('mouseleave', () => {
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
        this.hitPathElement.setAttribute('d', pathData);
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
        if (this.hitPathElement && this.hitPathElement.parentNode) {
            this.hitPathElement.parentNode.removeChild(this.hitPathElement);
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
