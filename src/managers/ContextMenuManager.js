/**
 * Manages context menus
 */
export class ContextMenuManager {
    /**
     * @param {NodeGraph} graph - Parent graph
     */
    constructor(graph) {
        this.graph = graph;
        this.menuElement = null;
        this.isOpen = false;

        // Menu items registry
        this.menuItems = {
            canvas: [],
            node: [],
            group: [],
            connection: []
        };

        // Default menu items
        this._registerDefaultItems();
        this._bindEvents();
    }

    /**
     * Register default menu items
     */
    _registerDefaultItems() {
        // Canvas menu items
        this.addItem('canvas', {
            id: 'add-node',
            label: 'Add Node',
            icon: '➕',
            action: (context) => {
                this.graph.emit('canvas:add-node', context.position);
            }
        });

        this.addItem('canvas', {
            id: 'add-group',
            label: 'Add Group',
            icon: '📁',
            action: (context) => {
                this.graph.addGroup({
                    label: 'New Group',
                    position: context.position,
                    size: { width: 300, height: 200 }
                });
            }
        });

        this.addItem('canvas', { type: 'separator' });

        this.addItem('canvas', {
            id: 'paste',
            label: 'Paste',
            icon: '📋',
            shortcut: 'Ctrl+V',
            action: () => this.graph.clipboard?.paste(),
            enabled: () => this.graph.clipboard?.hasData()
        });

        this.addItem('canvas', {
            id: 'select-all',
            label: 'Select All',
            icon: '☑️',
            shortcut: 'Ctrl+A',
            action: () => this.graph.selection?.selectAll()
        });

        this.addItem('canvas', { type: 'separator' });

        this.addItem('canvas', {
            id: 'toggle-grid',
            label: 'Toggle Grid',
            icon: '⊞',
            action: () => this.graph.grid?.toggle()
        });

        this.addItem('canvas', {
            id: 'arrange',
            label: 'Arrange Nodes',
            icon: '🏗️',
            action: () => this.graph.arrange()
        });

        this.addItem('canvas', {
            id: 'reset-view',
            label: 'Reset View',
            icon: '🏠',
            action: () => this.graph.viewport?.reset()
        });

        // Node menu items
        this.addItem('node', {
            id: 'copy',
            label: 'Copy',
            icon: '📄',
            shortcut: 'Ctrl+C',
            action: (context) => this.graph.clipboard?.copy()
        });

        this.addItem('node', {
            id: 'cut',
            label: 'Cut',
            icon: '✂️',
            shortcut: 'Ctrl+X',
            action: () => this.graph.clipboard?.cut()
        });

        this.addItem('node', {
            id: 'duplicate',
            label: 'Duplicate',
            icon: '⧉',
            shortcut: 'Ctrl+D',
            action: () => this.graph.clipboard?.duplicate()
        });

        this.addItem('node', { type: 'separator' });

        this.addItem('node', {
            id: 'connect',
            label: 'Connect',
            icon: '🔗',
            action: (context) => this.graph.autoConnect(context.node),
            enabled: (context) => {
                // Check if any node is close enough
                const node = context.node;
                const threshold = Math.min(node.element.offsetWidth, node.element.offsetHeight) / 2;
                const nodeBounds = node.getBounds();

                for (const other of this.graph.nodes.values()) {
                    if (other === node) continue;
                    const otherBounds = other.getBounds();
                    const dx = Math.max(0, Math.abs((nodeBounds.x + nodeBounds.width / 2) - (otherBounds.x + otherBounds.width / 2)) - (nodeBounds.width + otherBounds.width) / 2);
                    const dy = Math.max(0, Math.abs((nodeBounds.y + nodeBounds.height / 2) - (otherBounds.y + otherBounds.height / 2)) - (nodeBounds.height + otherBounds.height) / 2);
                    const gap = Math.sqrt(dx * dx + dy * dy);

                    if (gap < threshold) return true;
                }
                return false;
            }
        });

        this.addItem('node', { type: 'separator' });

        this.addItem('node', {
            id: 'disconnect',
            label: 'Disconnect',
            icon: '🔌', // Plugin/Disconnect icon
            action: (context) => {
                const node = context.node;
                const connectionsToRemove = [];

                // Collect input connections
                node.inputSlots.forEach(slot => {
                    slot.connections.forEach(conn => connectionsToRemove.push(conn.id));
                });

                // Collect output connections
                node.outputSlots.forEach(slot => {
                    slot.connections.forEach(conn => connectionsToRemove.push(conn.id));
                });

                // Collect symbolic/other connections tracked on node
                if (node.connections) {
                    node.connections.forEach(conn => connectionsToRemove.push(conn.id));
                }

                // Disconnect all
                connectionsToRemove.forEach(id => this.graph.disconnect(id));
            },
            enabled: (context) => {
                // Only enable if there are connections
                let hasConnections = false;
                context.node.inputSlots.forEach(s => { if (s.connections.size > 0) hasConnections = true; });
                if (hasConnections) return true;
                context.node.outputSlots.forEach(s => { if (s.connections.size > 0) hasConnections = true; });
                if (hasConnections) return true;
                if (context.node.connections && context.node.connections.size > 0) return true;
                return false;
            }
        });

        this.addItem('node', { type: 'separator' });

        this.addItem('node', {
            id: 'delete',
            label: 'Delete',
            icon: '🗑️',
            shortcut: 'Del',
            action: () => this.graph.selection?.deleteSelected(),
            className: 'ng-context-menu-item--danger'
        });

        // Group menu items
        this.addItem('group', {
            id: 'rename',
            label: 'Rename Group',
            icon: '✎',
            action: (context) => context.group._startEditLabel()
        });

        this.addItem('group', {
            id: 'color',
            label: 'Change Color',
            icon: '🎨',
            action: (context) => {
                // Create hidden color input
                const input = document.createElement('input');
                input.type = 'color';
                input.value = '#667eea'; // Default or calculate from current rgba
                input.style.position = 'absolute';
                input.style.opacity = '0';
                input.style.pointerEvents = 'none';
                document.body.appendChild(input);

                input.addEventListener('input', (e) => {
                    const hex = e.target.value;
                    // Convert hex to rgba with opacity
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    context.group.setColor(`rgba(${r}, ${g}, ${b}, 0.1)`);
                });

                input.addEventListener('change', () => {
                    input.remove();
                });

                input.click();
            }
        });

        this.addItem('group', { type: 'separator' });

        this.addItem('group', {
            id: 'delete-group',
            label: 'Delete Group',
            icon: '🗑️',
            action: (context) => this.graph.removeGroup(context.group.id),
            className: 'ng-context-menu-item--danger'
        });

        // Connection menu items
        this.addItem('connection', {
            id: 'delete-connection',
            label: 'Delete Connection',
            icon: '🗑️',
            action: (context) => {
                if (context.connection) {
                    this.graph.disconnect(context.connection.id);
                }
            },
            className: 'ng-context-menu-item--danger'
        });
    }

    /**
     * Bind event listeners
     */
    _bindEvents() {
        // Close menu on click outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.menuElement?.contains(e.target)) {
                this.close();
            }
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Close on scroll/zoom
        this.graph.container.addEventListener('wheel', () => {
            if (this.isOpen) this.close();
        });
    }

    /**
     * Add a menu item
     * @param {string} menuType - Menu type (canvas, node, group, connection)
     * @param {object} item - Menu item configuration
     */
    addItem(menuType, item) {
        if (!this.menuItems[menuType]) {
            this.menuItems[menuType] = [];
        }

        // Check if item with ID exists
        if (item.id) {
            const index = this.menuItems[menuType].findIndex(i => i.id === item.id);
            if (index !== -1) {
                // Replace existing
                this.menuItems[menuType][index] = item;
                return;
            }
        }

        this.menuItems[menuType].push(item);
    }

    /**
     * Remove a menu item
     * @param {string} menuType - Menu type
     * @param {string} itemId - Item ID
     */
    removeItem(menuType, itemId) {
        if (this.menuItems[menuType]) {
            this.menuItems[menuType] = this.menuItems[menuType].filter(item => item.id !== itemId);
        }
    }

    /**
     * Open context menu
     * @param {string} menuType - Menu type
     * @param {number} x - X position (screen)
     * @param {number} y - Y position (screen)
     * @param {object} context - Context data (node, connection, etc.)
     */
    open(menuType, x, y, context = {}) {
        this.close();

        const items = this.menuItems[menuType];
        if (!items || items.length === 0) return;

        this.menuElement = document.createElement('div');
        this.menuElement.className = 'ng-context-menu';

        items.forEach(item => {
            if (item.type === 'separator') {
                const separator = document.createElement('div');
                separator.className = 'ng-context-menu-separator';
                this.menuElement.appendChild(separator);
                return;
            }

            // Check if item is enabled
            const isEnabled = item.enabled ? item.enabled(context) : true;

            const menuItem = document.createElement('div');
            menuItem.className = 'ng-context-menu-item';
            if (item.className) menuItem.classList.add(item.className);
            if (!isEnabled) menuItem.classList.add('ng-context-menu-item--disabled');

            // Icon
            if (item.icon) {
                const icon = document.createElement('span');
                icon.className = 'ng-context-menu-icon';
                icon.textContent = item.icon;
                menuItem.appendChild(icon);
            }

            // Label
            const label = document.createElement('span');
            label.className = 'ng-context-menu-label';
            label.textContent = item.label;
            menuItem.appendChild(label);

            // Shortcut
            if (item.shortcut) {
                const shortcut = document.createElement('span');
                shortcut.className = 'ng-context-menu-shortcut';
                shortcut.textContent = item.shortcut;
                menuItem.appendChild(shortcut);
            }

            // Click handler
            if (isEnabled && item.action) {
                menuItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    item.action(context);
                    this.close();
                });
            }

            this.menuElement.appendChild(menuItem);
        });

        // Position menu
        this.menuElement.style.left = `${x}px`;
        this.menuElement.style.top = `${y}px`;

        document.body.appendChild(this.menuElement);
        this.isOpen = true;

        // Adjust position if menu goes off screen
        const rect = this.menuElement.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            this.menuElement.style.left = `${x - rect.width}px`;
        }
        if (rect.bottom > window.innerHeight) {
            this.menuElement.style.top = `${y - rect.height}px`;
        }
    }

    /**
     * Close context menu
     */
    close() {
        if (this.menuElement) {
            this.menuElement.remove();
            this.menuElement = null;
        }
        this.isOpen = false;
    }

    /**
     * Destroy the context menu manager
     */
    destroy() {
        this.close();
    }
}
