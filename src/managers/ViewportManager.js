import { throttle } from '../utils/events.js';

/**
 * Manages viewport pan and zoom
 */
export class ViewportManager {
    /**
     * @param {object} config - Configuration
     * @param {HTMLElement} config.container - Container element
     * @param {HTMLElement} config.content - Content element to transform
     * @param {object} config.options - Zoom/pan options
     */
    constructor(config) {
        this.container = config.container;
        this.content = config.content;
        this.options = {
            minZoom: config.options?.minZoom || 0.1,
            maxZoom: config.options?.maxZoom || 4,
            zoomSpeed: config.options?.zoomSpeed || 0.1,
            panButton: config.options?.panButton || 1, // Middle mouse button
            ...config.options
        };

        this.scale = 1;
        this.panX = 0;
        this.panY = 0;

        this._isPanning = false;
        this._panStartX = 0;
        this._panStartY = 0;
        this._spacePressed = false;

        this._bindEvents();
    }

    /**
     * Check if panning with space key
     */
    get isPanningWithSpace() {
        return this._spacePressed;
    }

    /**
     * Bind event listeners
     */
    _bindEvents() {
        // Zoom with mouse wheel
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();

            const rect = this.container.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const delta = e.deltaY > 0 ? -1 : 1;
            const zoomFactor = 1 + delta * this.options.zoomSpeed;

            this.zoomAt(mouseX, mouseY, zoomFactor);
        }, { passive: false });

        // Pan with middle mouse button or space+drag
        this.container.addEventListener('mousedown', (e) => {
            // Middle mouse button or left click with space
            if (e.button === this.options.panButton || (e.button === 0 && this._spacePressed)) {
                e.preventDefault();
                this._startPan(e);
            }
        });

        document.addEventListener('mousemove', throttle((e) => {
            if (this._isPanning) {
                this._updatePan(e);
            }
        }, 16)); // ~60fps

        document.addEventListener('mouseup', (e) => {
            if (this._isPanning) {
                this._endPan();
            }
        });

        // Space key for pan mode
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this._spacePressed) {
                this._spacePressed = true;
                this.container.style.cursor = 'grab';
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                this._spacePressed = false;
                this.container.style.cursor = '';
            }
        });
    }

    /**
     * Start panning
     */
    _startPan(e) {
        this._isPanning = true;
        this._panStartX = e.clientX - this.panX;
        this._panStartY = e.clientY - this.panY;
        this.container.style.cursor = 'grabbing';
    }

    /**
     * Update pan position
     */
    _updatePan(e) {
        this.panX = e.clientX - this._panStartX;
        this.panY = e.clientY - this._panStartY;
        this._applyTransform();
    }

    /**
     * End panning
     */
    _endPan() {
        this._isPanning = false;
        this.container.style.cursor = this._spacePressed ? 'grab' : '';
    }

    /**
     * Apply CSS transform
     */
    _applyTransform() {
        this.content.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
    }

    /**
     * Zoom at a specific point
     * @param {number} x - X coordinate (relative to container)
     * @param {number} y - Y coordinate (relative to container)
     * @param {number} factor - Zoom factor
     */
    zoomAt(x, y, factor) {
        const newScale = Math.min(Math.max(this.scale * factor, this.options.minZoom), this.options.maxZoom);

        if (newScale === this.scale) return;

        const scaleChange = newScale / this.scale;

        // Adjust pan to zoom towards mouse position
        this.panX = x - (x - this.panX) * scaleChange;
        this.panY = y - (y - this.panY) * scaleChange;
        this.scale = newScale;

        this._applyTransform();
    }

    /**
     * Set zoom level
     * @param {number} scale - New scale
     */
    setZoom(scale) {
        this.scale = Math.min(Math.max(scale, this.options.minZoom), this.options.maxZoom);
        this._applyTransform();
    }

    /**
     * Set pan position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    setPan(x, y) {
        this.panX = x;
        this.panY = y;
        this._applyTransform();
    }

    /**
     * Reset viewport to default
     */
    reset() {
        this.scale = 1;
        this.panX = 0;
        this.panY = 0;
        this._applyTransform();
    }

    /**
     * Center the viewport on a point
     * @param {number} x - X coordinate in content space
     * @param {number} y - Y coordinate in content space
     */
    centerOn(x, y) {
        const rect = this.container.getBoundingClientRect();
        this.panX = rect.width / 2 - x * this.scale;
        this.panY = rect.height / 2 - y * this.scale;
        this._applyTransform();
    }

    /**
     * Convert screen coordinates to graph coordinates
     * @param {number} screenX - Screen X
     * @param {number} screenY - Screen Y
     * @returns {object} {x, y} in graph space
     */
    screenToGraph(screenX, screenY) {
        const rect = this.container.getBoundingClientRect();
        return {
            x: (screenX - rect.left - this.panX) / this.scale,
            y: (screenY - rect.top - this.panY) / this.scale
        };
    }

    /**
     * Convert graph coordinates to screen coordinates
     * @param {number} graphX - Graph X
     * @param {number} graphY - Graph Y
     * @returns {object} {x, y} in screen space
     */
    graphToScreen(graphX, graphY) {
        const rect = this.container.getBoundingClientRect();
        return {
            x: graphX * this.scale + this.panX + rect.left,
            y: graphY * this.scale + this.panY + rect.top
        };
    }

    /**
     * Get current state
     * @returns {object} {scale, panX, panY}
     */
    getState() {
        return {
            scale: this.scale,
            panX: this.panX,
            panY: this.panY
        };
    }

    /**
     * Set state
     * @param {object} state - {scale, panX, panY}
     */
    /**
     * Fit viewport to content (all nodes)
     * @param {Map} nodes - Map of nodes
     * @param {number} padding - Padding around content
     */
    fitToContent(nodes, padding = 50) {
        if (!nodes || nodes.size === 0) {
            this.reset();
            return;
        }

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        nodes.forEach(node => {
            const bounds = node.getBounds();
            // getBounds returns x/y top-left.
            minX = Math.min(minX, bounds.x);
            minY = Math.min(minY, bounds.y);
            maxX = Math.max(maxX, bounds.x + bounds.width);
            maxY = Math.max(maxY, bounds.y + bounds.height);
        });

        if (minX === Infinity) return;

        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;

        const containerRect = this.container.getBoundingClientRect();
        const availableWidth = containerRect.width - (padding * 2);
        const availableHeight = containerRect.height - (padding * 2);

        const scaleX = availableWidth / contentWidth;
        const scaleY = availableHeight / contentHeight;

        // Use the smaller scale to fit both dimensions, clamped to limits
        let newScale = Math.min(scaleX, scaleY);
        newScale = Math.min(Math.max(newScale, this.options.minZoom), this.options.maxZoom);

        // Calculate center of content
        const contentCenterX = minX + contentWidth / 2;
        const contentCenterY = minY + contentHeight / 2;

        // Calculate pan to put content center at container center
        this.scale = newScale;
        this.panX = (containerRect.width / 2) - (contentCenterX * this.scale);
        this.panY = (containerRect.height / 2) - (contentCenterY * this.scale);

        this._applyTransform();
    }

}
