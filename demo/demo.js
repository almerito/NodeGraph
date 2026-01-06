/**
 * NodeGraph.js Demo
 */
import { NodeGraph, SlotShape } from '../src/index.js';

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the graph
    const graph = new NodeGraph('#graph-container', {
        grid: {
            enabled: true,
            step: 20
        },
        zoom: {
            min: 0.25,
            max: 4
        },
        snapToGrid: true
    });

    graph.on('change', (event) => {
        // event.type: 'node:add', 'node:move', 'node:resize', 'connection:create', etc.
        // event.item: L'oggetto coinvolto (Node, Connection, Group) o il suo ID
        // event.timestamp: Timestamp della modifica

        console.log('Modifica:', event.type, event.item);
    });

    // Create sample nodes
    const node1 = graph.addNode({
        id: 'node-1',
        position: { x: 100, y: 150 },
        header: { content: '<strong>Input Node</strong>', className: 'node-input-header' },
        body: { content: '<p>This is an input source</p>' },
        outputs: [
            { id: 'out1', label: 'Output', shape: SlotShape.CIRCLE, color: '#667eea' }
        ]
    });

    const node2 = graph.addNode({
        id: 'node-2',
        position: { x: 400, y: 100 },
        header: { content: '<strong>Processor</strong>', className: 'node-processor-header' },
        body: { content: '<p>Processes the data</p>' },
        inputs: [
            { id: 'in1', label: 'Input A', shape: SlotShape.CIRCLE, color: '#667eea' },
            { id: 'in2', label: 'Input B', shape: SlotShape.SQUARE, color: '#764ba2' }
        ],
        outputs: [
            { id: 'out1', label: 'Result', shape: SlotShape.ARROW, color: '#48bb78' }
        ]
    });

    const node3 = graph.addNode({
        id: 'node-3',
        position: { x: 400, y: 300 },
        header: { content: '<strong>Secondary</strong>', className: 'node-secondary-header' },
        body: { content: '<p>Secondary input</p>' },
        outputs: [
            { id: 'out1', label: 'Value', shape: SlotShape.DIAMOND, color: '#ed8936' }
        ]
    });

    const node4 = graph.addNode({
        id: 'node-4',
        position: { x: 700, y: 180 },
        header: { content: '<strong>Output Node</strong>', className: 'node-output-header' }, // Use class
        body: {
            content: `
        <div class="node-custom-input-wrapper">
          <label class="node-custom-label">Result:</label>
          <input type="text" value="42" class="node-custom-input" />
        </div>
      `
        },
        footer: { content: 'Status: Ready' },
        inputs: [
            { id: 'in1', label: 'Final', shape: SlotShape.CIRCLE, color: '#48bb78' }
        ]
    });

    // Complex Node: Slots on all sides
    const node5 = graph.addNode({
        id: 'node-complex',
        position: { x: 700, y: 50 },
        header: { content: '<strong>Omni Node</strong>', className: 'node-omni-header' },
        body: { content: '<p class="text-center">Slots everywhere!</p>' },
        footer: { content: '4-way connectivity' },
        inputs: [
            { id: 'in_left', label: 'Left', side: 'left' },
            { id: 'in_top', label: 'Top Input', side: 'top', shape: SlotShape.SQUARE }
        ],
        outputs: [
            { id: 'out_right', label: 'Right', side: 'right' },
            { id: 'out_bottom', label: 'Bottom Output', side: 'bottom', shape: SlotShape.DIAMOND }
        ]
    });

    // Edge Node: Slots on the border
    const node6 = graph.addNode({
        id: 'node-edge',
        position: { x: 100, y: 350 },
        header: { content: '<strong>Edge Node</strong>', className: 'node-edge-header' },
        body: { content: '<p>Connectors on the edge</p>' },
        inputs: [
            { id: 'edge_in', label: 'Edge In', side: 'left', edge: true, color: '#4fd1c5' },
            { id: 'edge_top', label: 'Top Edge', side: 'top', edge: true, color: '#f6e05e' }
        ],
        outputs: [
            { id: 'edge_out', label: 'Edge Out', side: 'right', edge: true, color: '#f687b3' },
            { id: 'edge_bottom', label: 'Bottom Edge', side: 'bottom', edge: true, color: '#f6e05e' }
        ]
    });

    // Edge Node: Slots on the border
    const node7 = graph.addNode({
        id: 'node-edge-2',
        position: { x: 100, y: 350 },
        header: { content: '<strong>Edge Node</strong>', style: { background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' } },
        body: { content: '<p>Connectors on the edge, no label</p>' },
        footer: { content: 'Variable sizes' },
        inputs: [
            { id: 'edge_in', label: null, side: 'left', edge: true, color: '#4fd1c5' },
            { id: 'edge_top', label: null, side: 'top', edge: true, color: '#f6e05e' }
        ],
        outputs: [
            { id: 'edge_out', label: null, side: 'right', size: 20, edge: true, color: '#f687b3' },
            { id: 'edge_bottom', label: null, side: 'bottom', size: 20, edge: true, color: '#f6e05e', shape: SlotShape.DIAMOND }
        ]
    });

    // Custom Node: Inline styles and Variable Sizes
    const node8 = graph.addNode({
        id: 'node-custom',
        position: { x: 400, y: 500 },
        resizable: true,
        header: {
            content: '<strong>Custom Sizes</strong>',
            style: {
                background: 'linear-gradient(90deg, #ff00cc, #333399)',
                color: 'white',
                borderBottom: '2px solid #ff00cc'
            }
        },
        body: { content: '<p>Inline styles & custom slots</p>' },
        footer: { content: 'Variable sizes' },
        inputs: [
            { id: 'big_in', label: 'Big Input', size: 20, color: '#ff00cc' },
            { id: 'small_in', label: 'Small', size: 8, color: '#ccc' }
        ],
        outputs: [
            { id: 'huge_out', label: 'Huge', size: 24, shape: SlotShape.DIAMOND, color: '#00ffcc' },
            { id: 'tiny_out', label: 'Tiny', size: 6, side: 'bottom', shape: SlotShape.DIAMOND }
        ]
    });

    // Create initial connections
    graph.connect(node1.getOutput('out1'), node2.getInput('in1'));
    graph.connect(node3.getOutput('out1'), node2.getInput('in2'));
    graph.connect(node2.getOutput('out1'), node4.getInput('in1'));

    // Connect complex nodes
    graph.connectSymbolic(node2, node5, { color: '#aaa' });
    graph.connect(node5.getOutput('out_bottom'), node4.getInput('in1'));
    graph.connect(node7.getOutput('edge_out'), node8.getInput('big_in'));

    // Variable Gap Node
    const node9 = graph.addNode({
        id: 'node-gap',
        position: { x: 700, y: 500 },
        header: { content: '<strong>Custom Gap</strong>' },
        slotsTop: { style: { height: '30px', background: 'rgba(255,255,255,0.05)' } }, // Custom top height
        body: { content: '<p>Top slots area height: 30px</p>' },
        inputs: [
            { id: 'gap_in1', label: 'In 1', side: 'top', edge: true },
            { id: 'gap_in2', label: 'In 2', side: 'top', edge: false } // Regular slot sharing space
        ],
        outputs: []
    });

    // Resizable Node
    const node10 = graph.addNode({
        id: 'node-resize',
        position: { x: 950, y: 50 },
        resizable: true,
        header: { content: '<strong>Resizable</strong>' },
        body: { content: '<p>Drag bottom-right corner to resize</p>', style: { padding: '20px' } },
        inputs: [
            { id: 'resize_in', label: 'In' }
        ],
        outputs: [
            { id: 'resize_out', label: 'Out' }
        ]
    });

    // Event listeners for demo
    graph.on('node:select', (node) => {
        console.log('Node selected:', node.id);
    });

    // Validation Example: Strict Shape Matching
    graph.on('connection:validate', (context) => {
        const { source, target } = context;
        // Example: Only allow connecting slots of the same shape
        // Default shape is 'circle' if undefined
        const sourceShape = source.shape || 'circle';
        const targetShape = target.shape || 'circle';

        if (sourceShape !== targetShape) {
            context.valid = false;
        }
    });

    graph.on('connection:create', (conn) => {
        console.log('Connection created:', conn.id);
    });

    graph.on('connection:remove', (id) => {
        console.log('Connection removed:', id);
    });

    // Demo buttons
    let nodeCounter = 5;

    document.getElementById('btn-add-node').addEventListener('click', () => {
        const viewportState = graph.viewport.getState();
        const containerRect = graph.container.getBoundingClientRect();

        // Calculate center of viewport
        const x = (containerRect.width / 2 - viewportState.panX) / viewportState.scale;
        const y = (containerRect.height / 2 - viewportState.panY) / viewportState.scale;

        const newNode = graph.addNode({
            id: `node-${nodeCounter++}`,
            position: { x, y },
            header: { content: `<strong>New Node ${nodeCounter - 1}</strong>` },
            body: { content: '<p>Dynamic content here</p>' },
            inputs: [
                { id: 'in1', label: 'Input', shape: SlotShape.CIRCLE }
            ],
            outputs: [
                { id: 'out1', label: 'Output', shape: SlotShape.CIRCLE }
            ]
        });

        // Select the new node
        graph.selection.selectNode(newNode);
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
        if (confirm('Clear all nodes?')) {
            graph.clear();
            nodeCounter = 1;
        }
    });

    // Add custom context menu item
    graph.contextMenu.addItem('canvas', {
        id: 'add-node-here',
        label: 'Add Node Here',
        icon: '➕',
        action: (context) => {
            const pos = context.position;
            graph.addNode({
                id: `node-${nodeCounter++}`,
                position: { x: pos.x, y: pos.y },
                header: { content: `<strong>Node ${nodeCounter - 1}</strong>` },
                body: { content: '<p>Created from menu</p>' },
                inputs: [{ id: 'in1', label: 'In' }],
                outputs: [{ id: 'out1', label: 'Out' }]
            });
        }
    });

    // Add a group
    const group = graph.addGroup({
        label: 'Processing Group',
        position: { x: 380, y: 70 },
        size: { width: 180, height: 280 },
        color: 'rgba(102, 126, 234, 0.1)'
    });
    group.addNode(node2);
    group.addNode(node3);

    // Keyboard shortcuts info
    console.log(`
╔══════════════════════════════════════════════╗
║           NodeGraph.js Demo                  ║
╠══════════════════════════════════════════════╣
║ Controls:                                    ║
║   • Mouse Wheel - Zoom                       ║
║   • Middle Mouse / Space+Drag - Pan          ║
║   • Click - Select node                      ║
║   • Ctrl+Click - Multi-select                ║
║   • Drag - Move node                         ║
║   • Drag from slot - Create connection       ║
║   • Delete/Backspace - Delete selected       ║
║   • Ctrl+A - Select all                      ║
║   • Ctrl+C/X/V - Copy/Cut/Paste              ║
║   • Ctrl+D - Duplicate                       ║
║   • Right-click - Context menu               ║
║   • Escape - Deselect all                    ║
╚══════════════════════════════════════════════╝
  `);

    // Make graph available in console for debugging
    window.graph = graph;
});
