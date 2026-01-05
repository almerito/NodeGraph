/**
 * Manages the grid display and snap functionality
 */
export class GridManager {
    /**
     * @param {object} config - Configuration
     * @param {SVGElement} config.svgLayer - SVG layer to draw on
     * @param {object} config.options - Grid options
     */
    constructor(config) {
        this.svgLayer = config.svgLayer;
        this.options = {
            enabled: config.options?.enabled !== false,
            step: config.options?.step || 20,
            color: config.options?.color || 'rgba(255,255,255,0.05)',
            majorLineEvery: config.options?.majorLineEvery || 5,
            majorColor: config.options?.majorColor || 'rgba(255,255,255,0.1)',
            ...config.options
        };

        this._gridGroup = null;
        this._pattern = null;

        if (this.options.enabled) {
            this._createGrid();
        }
    }

    /**
     * Create the grid pattern
     */
    _createGrid() {
        // Create defs for pattern
        let defs = this.svgLayer.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            this.svgLayer.insertBefore(defs, this.svgLayer.firstChild);
        }

        const step = this.options.step;
        const majorStep = step * this.options.majorLineEvery;

        // Minor grid pattern
        this._pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        this._pattern.setAttribute('id', 'ng-grid-pattern');
        this._pattern.setAttribute('width', majorStep);
        this._pattern.setAttribute('height', majorStep);
        this._pattern.setAttribute('patternUnits', 'userSpaceOnUse');

        // Minor lines
        for (let i = 0; i <= this.options.majorLineEvery; i++) {
            const x = i * step;
            const y = i * step;

            // Vertical line
            const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            vLine.setAttribute('x1', x);
            vLine.setAttribute('y1', 0);
            vLine.setAttribute('x2', x);
            vLine.setAttribute('y2', majorStep);
            vLine.setAttribute('stroke', i === 0 ? this.options.majorColor : this.options.color);
            vLine.setAttribute('stroke-width', i === 0 ? 1 : 0.5);
            this._pattern.appendChild(vLine);

            // Horizontal line
            const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            hLine.setAttribute('x1', 0);
            hLine.setAttribute('y1', y);
            hLine.setAttribute('x2', majorStep);
            hLine.setAttribute('y2', y);
            hLine.setAttribute('stroke', i === 0 ? this.options.majorColor : this.options.color);
            hLine.setAttribute('stroke-width', i === 0 ? 1 : 0.5);
            this._pattern.appendChild(hLine);
        }

        defs.appendChild(this._pattern);

        // Create grid rectangle
        this._gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this._gridGroup.classList.add('ng-grid');

        const gridRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        gridRect.setAttribute('x', -10000);
        gridRect.setAttribute('y', -10000);
        gridRect.setAttribute('width', 20000);
        gridRect.setAttribute('height', 20000);
        gridRect.setAttribute('fill', 'url(#ng-grid-pattern)');

        this._gridGroup.appendChild(gridRect);

        // Insert grid at the beginning (behind connections)
        this.svgLayer.insertBefore(this._gridGroup, this.svgLayer.firstChild.nextSibling);
    }

    /**
     * Show the grid
     */
    show() {
        this.options.enabled = true;
        if (!this._gridGroup) {
            this._createGrid();
        } else {
            this._gridGroup.style.display = '';
        }
    }

    /**
     * Hide the grid
     */
    hide() {
        this.options.enabled = false;
        if (this._gridGroup) {
            this._gridGroup.style.display = 'none';
        }
    }

    /**
     * Toggle grid visibility
     */
    toggle() {
        if (this.options.enabled) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Set grid step size
     * @param {number} step - Step size in pixels
     */
    setStep(step) {
        this.options.step = step;
        this._destroyGrid();
        this._createGrid();
    }

    /**
     * Snap a position to the grid
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {object} Snapped position {x, y}
     */
    snap(x, y) {
        const step = this.options.step;
        return {
            x: Math.round(x / step) * step,
            y: Math.round(y / step) * step
        };
    }

    /**
     * Destroy the grid
     */
    _destroyGrid() {
        if (this._gridGroup) {
            this._gridGroup.remove();
            this._gridGroup = null;
        }
        if (this._pattern) {
            this._pattern.remove();
            this._pattern = null;
        }
    }

    /**
     * Destroy the grid manager
     */
    destroy() {
        this._destroyGrid();
    }
}
