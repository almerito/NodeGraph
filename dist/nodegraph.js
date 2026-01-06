class I {
  constructor() {
    this._events = /* @__PURE__ */ new Map();
  }
  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(t, e) {
    return this._events.has(t) || this._events.set(t, /* @__PURE__ */ new Set()), this._events.get(t).add(e), () => this.off(t, e);
  }
  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(t, e) {
    this._events.has(t) && this._events.get(t).delete(e);
  }
  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {...any} args - Arguments to pass to callbacks
   */
  emit(t, ...e) {
    this._events.has(t) && this._events.get(t).forEach((s) => {
      try {
        s(...e);
      } catch (i) {
        console.error(`Error in event handler for "${t}":`, i);
      }
    });
  }
  /**
   * Subscribe to an event once
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  once(t, e) {
    const s = (...i) => {
      this.off(t, s), e(...i);
    };
    this.on(t, s);
  }
}
function z(g, t) {
  let e;
  return function(...s) {
    e || (g.apply(this, s), e = !0, setTimeout(() => e = !1, t));
  };
}
function X(g, t) {
  let e;
  return function(...s) {
    clearTimeout(e), e = setTimeout(() => g.apply(this, s), t);
  };
}
function S(g = "") {
  const t = Date.now().toString(36), e = Math.random().toString(36).substring(2, 9);
  return g ? `${g}-${t}-${e}` : `${t}-${e}`;
}
const w = {
  CIRCLE: "circle",
  SQUARE: "square",
  ARROW: "arrow",
  DIAMOND: "diamond",
  CUSTOM: "custom"
}, C = {
  HORIZONTAL: "horizontal",
  VERTICAL: "vertical"
};
class L {
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
  constructor(t) {
    this.id = t.id || S("slot"), this.node = t.node, this.type = t.type, this.label = t.label || "", this.shape = t.shape || w.CIRCLE, this.side = t.side || (t.type === "input" ? "left" : "right"), this.align = t.align, this.edge = t.edge || !1, t.orientation ? this.orientation = t.orientation : this.orientation = this.side === "top" || this.side === "bottom" ? C.VERTICAL : C.HORIZONTAL, this.color = t.color || "#667eea", this.size = t.size || 12, this.clickAreaSize = t.clickAreaSize || this.size + 10, this.highlightOnHover = t.highlightOnHover !== !1, this.customIcon = t.customIcon || null, t.maxConnections !== void 0 ? this.maxConnections = t.maxConnections : this.maxConnections = this.type === "input" ? 1 : 1 / 0, this.connections = /* @__PURE__ */ new Set(), this._createElement(), this._bindEvents();
  }
  /**
   * Create the slot DOM element
   */
  _createElement() {
    this.element = document.createElement("div"), this.element.className = `ng-slot ng-slot--${this.side} ng-slot--${this.orientation}`, this.edge && this.element.classList.add("ng-slot--edge"), this.element.dataset.slotId = this.id, this.element.dataset.slotType = this.type, this.element.style.setProperty("--ng-slot-size", `${this.size}px`), this.element.style.setProperty("--ng-slot-color", this.color), this.connectorElement = document.createElement("div"), this.connectorElement.className = `ng-slot-connector ng-slot-connector--${this.shape}`, this.clickAreaElement = document.createElement("div"), this.clickAreaElement.className = "ng-slot-click-area", this.clickAreaElement.style.width = `${this.clickAreaSize}px`, this.clickAreaElement.style.height = `${this.clickAreaSize}px`, this.label && (this.labelElement = document.createElement("span"), this.labelElement.className = "ng-slot-label", this.labelElement.textContent = this.label), this.shape === w.CUSTOM && this.customIcon && (this.connectorElement.innerHTML = this.customIcon), this.connectorElement.appendChild(this.clickAreaElement), this.element.appendChild(this.connectorElement), this.labelElement && this.element.appendChild(this.labelElement);
  }
  /**
   * Bind event listeners
   */
  _bindEvents() {
    this.clickAreaElement.addEventListener("mouseenter", () => {
      this.highlightOnHover && this.highlight(!0), this.element.dispatchEvent(new CustomEvent("slot:hover", {
        bubbles: !0,
        detail: { slot: this }
      }));
    }), this.clickAreaElement.addEventListener("mouseleave", () => {
      this.highlightOnHover && this.highlight(!1), this.element.dispatchEvent(new CustomEvent("slot:hoverend", {
        bubbles: !0,
        detail: { slot: this }
      }));
    }), this.clickAreaElement.addEventListener("mousedown", (t) => {
      t.button === 0 && (t.stopPropagation(), this.element.dispatchEvent(new CustomEvent("slot:dragstart", {
        bubbles: !0,
        detail: { slot: this, event: t }
      })));
    }), this.clickAreaElement.addEventListener("click", (t) => {
      t.stopPropagation(), this.element.dispatchEvent(new CustomEvent("slot:click", {
        bubbles: !0,
        detail: { slot: this, event: t }
      }));
    });
  }
  /**
   * Get the connection point position (in graph coordinates)
   * @returns {object} Position {x, y}
   */
  getConnectionPoint() {
    const t = this.connectorElement.getBoundingClientRect(), e = t.left + t.width / 2, s = t.top + t.height / 2;
    return this.node.graph.viewport.screenToGraph(e, s);
  }
  /**
   * Highlight the slot
   * @param {boolean} active - Active state
   */
  highlight(t) {
    t ? this.connectorElement.classList.add("ng-slot-connector--highlight") : this.connectorElement.classList.remove("ng-slot-connector--highlight");
  }
  /**
   * Set slot color
   * @param {string} color - CSS color
   */
  setColor(t) {
    this.color = t, this.element.style.setProperty("--ng-slot-color", t);
  }
  /**
   * Set slot size
   * @param {number} size - Size in pixels
   */
  setSize(t) {
    this.size = t, this.element.style.setProperty("--ng-slot-size", `${t}px`);
  }
  /**
   * Set label
   * @param {string} label - Label text
   */
  setLabel(t) {
    this.label = t, this.labelElement && (this.labelElement.textContent = t);
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
    const t = [];
    return this.connections.forEach((e) => {
      this.type === "output" ? t.push(e.inputSlot) : t.push(e.outputSlot);
    }), t;
  }
  /**
   * Destroy the slot
   */
  destroy() {
    this.connections.forEach((t) => t.destroy()), this.connections.clear(), this.element && this.element.parentNode && this.element.parentNode.removeChild(this.element);
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
class M {
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
  constructor(t) {
    var e, s;
    this.id = t.id || S("node"), this.graph = t.graph, this.position = { x: ((e = t.position) == null ? void 0 : e.x) || 0, y: ((s = t.position) == null ? void 0 : s.y) || 0 }, this.draggable = t.draggable !== !1, this.selected = !1, this.resizable = t.resizable || !1, this.data = t.data || {}, this.inputSlots = /* @__PURE__ */ new Map(), this.outputSlots = /* @__PURE__ */ new Map(), this.connections = /* @__PURE__ */ new Set(), this._createElement(t), this._createSlots(t.inputs, t.outputs), this._bindEvents(), this._updatePosition();
  }
  /**
   * Create the node DOM element
   */
  _createElement(t) {
    this.element = document.createElement("div"), this.element.className = "ng-node", t.className && this.element.classList.add(t.className), this.element.dataset.nodeId = this.id, this.element.style.transform = `translate(${t.position.x}px, ${t.position.y}px)`;
    const e = document.createElement("div");
    e.className = "ng-node-wrapper", this.element.appendChild(e), this.slotsTop = document.createElement("div"), this.slotsTop.className = "ng-node-slots-top", t.slotsTop && t.slotsTop.style && Object.assign(this.slotsTop.style, t.slotsTop.style), e.appendChild(this.slotsTop), this.headerElement = document.createElement("div"), this.headerElement.className = "ng-node-header", t.header && t.header.content && (this.headerElement.innerHTML = t.header.content), t.header && t.header.className && this.headerElement.classList.add(t.header.className), t.header && t.header.style && Object.assign(this.headerElement.style, t.header.style), e.appendChild(this.headerElement);
    const s = document.createElement("div");
    s.className = "ng-node-middle", e.appendChild(s), this.slotsLeft = document.createElement("div"), this.slotsLeft.className = "ng-node-slots-left", t.slotsLeft && t.slotsLeft.style && Object.assign(this.slotsLeft.style, t.slotsLeft.style), s.appendChild(this.slotsLeft);
    const i = document.createElement("div");
    i.className = "ng-node-content", s.appendChild(i), this.bodyElement = document.createElement("div"), this.bodyElement.className = "ng-node-body", t.body && t.body.content && (this.bodyElement.innerHTML = t.body.content), t.body && t.body.className && this.bodyElement.classList.add(t.body.className), t.body && t.body.style && Object.assign(this.bodyElement.style, t.body.style), i.appendChild(this.bodyElement), this.footerElement = document.createElement("div"), this.footerElement.className = "ng-node-footer", t.footer && t.footer.content ? this._setContent(this.footerElement, t.footer.content) : this.footerElement.style.display = "none", t.footer && t.footer.className && this.footerElement.classList.add(t.footer.className), t.footer && t.footer.style && Object.assign(this.footerElement.style, t.footer.style), i.appendChild(this.footerElement), this.slotsRight = document.createElement("div"), this.slotsRight.className = "ng-node-slots-right", t.slotsRight && t.slotsRight.style && Object.assign(this.slotsRight.style, t.slotsRight.style), s.appendChild(this.slotsRight), this.slotsBottom = document.createElement("div"), this.slotsBottom.className = "ng-node-slots-bottom", t.slotsBottom && t.slotsBottom.style && Object.assign(this.slotsBottom.style, t.slotsBottom.style), e.appendChild(this.slotsBottom), this.resizable && (this.resizeHandle = document.createElement("div"), this.resizeHandle.className = "ng-node-resize-handle", this.element.appendChild(this.resizeHandle));
  }
  /**
   * Set content of an element (string or HTML)
   */
  _setContent(t, e) {
    e != null && (typeof e == "string" ? e.trim().startsWith("<") ? t.innerHTML = e : t.textContent = e : e instanceof HTMLElement && t.appendChild(e));
  }
  /**
   * Create input/output slots
   */
  _createSlots(t = [], e = []) {
    t.forEach((s) => {
      this.addInputSlot(s);
    }), e.forEach((s) => {
      this.addOutputSlot(s);
    });
  }
  /**
  * Bind event listeners
  */
  _bindEvents() {
    let t = !1, e = { x: 0, y: 0 };
    const s = /* @__PURE__ */ new Map(), i = (a) => {
      var r;
      if (a.target.closest(".ng-slot-click-area") || a.target.closest("input") || a.target.closest("button") || a.target.closest("select") || a.target.closest("textarea") || a.button !== 0 || (a.stopPropagation(), this.element.dispatchEvent(new CustomEvent("node:select", {
        bubbles: !0,
        detail: { node: this, event: a }
      })), !this.draggable)) return;
      t = !0, e = { x: a.clientX, y: a.clientY };
      const h = (r = this.graph) == null ? void 0 : r.selection;
      s.clear(), h && h.isSelected(this) ? h.getSelectedNodes().forEach((p) => {
        s.set(p, { ...p.position }), p.element.classList.add("ng-node--dragging");
      }) : (s.set(this, { ...this.position }), this.element.classList.add("ng-node--dragging")), document.addEventListener("mousemove", n), document.addEventListener("mouseup", o);
    }, n = (a) => {
      var c, l;
      if (!t) return;
      const h = ((l = (c = this.graph) == null ? void 0 : c.viewport) == null ? void 0 : l.scale) || 1, r = (a.clientX - e.x) / h, p = (a.clientY - e.y) / h;
      s.forEach((d, u) => {
        u.moveTo(d.x + r, d.y + p);
      }), this.element.dispatchEvent(new CustomEvent("node:drag", {
        bubbles: !0,
        detail: { node: this }
      }));
    }, o = () => {
      var a, h, r;
      if (t) {
        if (t = !1, s.forEach((p, c) => {
          c.element.classList.remove("ng-node--dragging");
        }), (h = (a = this.graph) == null ? void 0 : a.options) != null && h.snapToGrid) {
          const p = ((r = this.graph.options.grid) == null ? void 0 : r.step) || 20;
          s.forEach((c, l) => {
            l.moveTo(
              Math.round(l.position.x / p) * p,
              Math.round(l.position.y / p) * p
            );
          });
        }
        this.element.dispatchEvent(new CustomEvent("node:dragend", {
          bubbles: !0,
          detail: { node: this }
        })), document.removeEventListener("mousemove", n), document.removeEventListener("mouseup", o), s.clear();
      }
    };
    if (this.element.addEventListener("mousedown", i), this.resizable && this.resizeHandle) {
      let a = !1, h = { width: 0, height: 0 }, r = { x: 0, y: 0 };
      this.resizeHandle.addEventListener("mousedown", (l) => {
        if (l.stopPropagation(), l.button !== 0) return;
        a = !0, r = { x: l.clientX, y: l.clientY };
        const d = this.element.getBoundingClientRect();
        h = { width: d.width, height: d.height }, this.element.style.width = `${d.width}px`, this.element.style.height = `${d.height}px`, this.element.classList.add("ng-node--resizing"), document.addEventListener("mousemove", p), document.addEventListener("mouseup", c);
      });
      const p = (l) => {
        var E, b;
        if (!a) return;
        const d = ((b = (E = this.graph) == null ? void 0 : E.viewport) == null ? void 0 : b.scale) || 1, u = (l.clientX - r.x) / d, m = (l.clientY - r.y) / d, f = Math.max(100, h.width + u), y = Math.max(50, h.height + m);
        this.element.style.width = `${f}px`, this.element.style.height = `${y}px`, this._updateConnections();
      }, c = () => {
        a = !1, this.element.classList.remove("ng-node--resizing"), document.removeEventListener("mousemove", p), document.removeEventListener("mouseup", c), this.element.dispatchEvent(new CustomEvent("node:resize", {
          bubbles: !0,
          detail: { node: this }
        }));
      };
    }
    this.element.addEventListener("contextmenu", (a) => {
      a.preventDefault(), a.stopPropagation(), this.element.dispatchEvent(new CustomEvent("node:contextmenu", {
        bubbles: !0,
        detail: { node: this, event: a }
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
    this.inputSlots.forEach((t) => {
      t.connections.forEach((e) => e.updatePath());
    }), this.outputSlots.forEach((t) => {
      t.connections.forEach((e) => e.updatePath());
    }), this.connections.forEach((t) => t.updatePath());
  }
  /**
   * Move node to position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  moveTo(t, e) {
    this.position.x = t, this.position.y = e, this._updatePosition(), this._updateConnections();
  }
  /**
   * Move node by delta
   * @param {number} dx - Delta X
   * @param {number} dy - Delta Y
   */
  moveBy(t, e) {
    this.moveTo(this.position.x + t, this.position.y + e);
  }
  /**
   * Add an input slot
   * @param {object} config - Slot configuration
   * @returns {Slot} Created slot
   */
  addInputSlot(t) {
    const e = new L({
      ...t,
      node: this,
      type: "input"
    });
    this.inputSlots.set(e.id, e);
    const s = t.side || "left";
    return s === "top" ? this.slotsTop.appendChild(e.element) : s === "bottom" ? this.slotsBottom.appendChild(e.element) : s === "right" ? this.slotsRight.appendChild(e.element) : this.slotsLeft.appendChild(e.element), e;
  }
  /**
   * Add an output slot
   * @param {object} config - Slot configuration
   * @returns {Slot} Created slot
   */
  addOutputSlot(t) {
    const e = new L({
      ...t,
      node: this,
      type: "output"
    });
    this.outputSlots.set(e.id, e);
    const s = t.side || "right";
    return s === "top" ? this.slotsTop.appendChild(e.element) : s === "bottom" ? this.slotsBottom.appendChild(e.element) : s === "left" ? this.slotsLeft.appendChild(e.element) : this.slotsRight.appendChild(e.element), e;
  }
  /**
   * Get an input slot by ID
   * @param {string} id - Slot ID
   * @returns {Slot|undefined}
   */
  getInput(t) {
    return this.inputSlots.get(t);
  }
  /**
   * Get an output slot by ID
   * @param {string} id - Slot ID
   * @returns {Slot|undefined}
   */
  getOutput(t) {
    return this.outputSlots.get(t);
  }
  /**
   * Remove a slot
   * @param {string} id - Slot ID
   */
  removeSlot(t) {
    this.inputSlots.has(t) ? (this.inputSlots.get(t).destroy(), this.inputSlots.delete(t)) : this.outputSlots.has(t) && (this.outputSlots.get(t).destroy(), this.outputSlots.delete(t));
  }
  /**
   * Set header content
   * @param {string|HTMLElement} content - Content to set
   */
  setHeader(t) {
    this.headerElement && this._setContent(this.headerElement, t);
  }
  /**
   * Set body content
   * @param {string|HTMLElement} content - Content to set
   */
  setBody(t) {
    this.bodyElement && this._setContent(this.bodyElement, t);
  }
  /**
   * Set footer content
   * @param {string|HTMLElement} content - Content to set
   */
  setFooter(t) {
    this.footerElement && this._setContent(this.footerElement, t);
  }
  /**
   * Select this node
   */
  select() {
    this.selected = !0, this.element.classList.add("ng-node--selected");
  }
  /**
   * Deselect this node
   */
  deselect() {
    this.selected = !1, this.element.classList.remove("ng-node--selected");
  }
  /**
   * Get node bounding box
   * @returns {object} {x, y, width, height}
   */
  getBounds() {
    const t = this.element.getBoundingClientRect();
    return {
      x: this.position.x,
      y: this.position.y,
      width: t.width,
      height: t.height
    };
  }
  /**
   * Destroy the node
   */
  destroy() {
    this.inputSlots.forEach((t) => t.destroy()), this.outputSlots.forEach((t) => t.destroy()), this.inputSlots.clear(), this.outputSlots.clear(), this.connections.forEach((t) => t.destroy()), this.connections.clear(), this.element && this.element.parentNode && this.element.parentNode.removeChild(this.element);
  }
  /**
   * Helper to extract style/class config from element
   */
  _extractConfig(t) {
    if (!t) return null;
    const e = {};
    if (t.innerHTML && (e.content = t.innerHTML), t.className) {
      const s = Array.from(t.classList).filter((i) => !i.startsWith("ng-node-"));
      s.length > 0 && (e.className = s.join(" "));
    }
    if (t.style && t.style.length > 0) {
      e.style = {};
      for (let s = 0; s < t.style.length; s++) {
        const i = t.style[s];
        e.style[i] = t.style.getPropertyValue(i);
      }
    }
    return Object.keys(e).length > 0 ? e : null;
  }
  /**
   * Helper to extract style from container
   */
  _extractContainerConfig(t) {
    if (!t) return null;
    const e = {};
    if (t.style && t.style.length > 0) {
      e.style = {};
      for (let s = 0; s < t.style.length; s++) {
        const i = t.style[s];
        e.style[i] = t.style.getPropertyValue(i);
      }
    }
    return Object.keys(e).length > 0 ? e : null;
  }
  /**
   * Serialize node data
   * @returns {object} Serialized data
   */
  serialize() {
    return {
      id: this.id,
      data: JSON.parse(JSON.stringify(this.data)),
      // Deep copy to ensure independence
      position: { ...this.position },
      header: this._extractConfig(this.headerElement),
      body: this._extractConfig(this.bodyElement),
      footer: this._extractConfig(this.footerElement),
      slotsTop: this._extractContainerConfig(this.slotsTop),
      slotsBottom: this._extractContainerConfig(this.slotsBottom),
      slotsLeft: this._extractContainerConfig(this.slotsLeft),
      slotsRight: this._extractContainerConfig(this.slotsRight),
      inputs: Array.from(this.inputSlots.values()).map((t) => t.serialize()),
      outputs: Array.from(this.outputSlots.values()).map((t) => t.serialize())
    };
  }
  /**
   * Get the connection point for this node (center)
   * @returns {object} {x, y}
   */
  getConnectionPoint() {
    const t = this.element.getBoundingClientRect(), e = t.width || 200, s = t.height || 100;
    return {
      x: this.position.x + e / 2,
      y: this.position.y + s / 2
    };
  }
  /**
   * Get orientation for connections (defaults to horizontal)
   */
  get orientation() {
    return "horizontal";
  }
}
function P(g, t, e = "horizontal", s = "horizontal") {
  const i = t.x - g.x, n = t.y - g.y;
  let o, a, h, r;
  const p = Math.min(Math.abs(i) / 2, Math.abs(n) / 2, 100), l = Math.max(p, 50);
  return e === "horizontal" ? (o = g.x + l, a = g.y) : (o = g.x, a = g.y + l), s === "horizontal" ? (h = t.x - l, r = t.y) : (h = t.x, r = t.y - l), `M ${g.x} ${g.y} C ${o} ${a}, ${h} ${r}, ${t.x} ${t.y}`;
}
function G(g, t) {
  return {
    x: (g.x + t.x) / 2,
    y: (g.y + t.y) / 2
  };
}
class N {
  /**
   * @param {object} config - Connection configuration
   * @param {Slot} config.outputSlot - Source slot (output)
   * @param {Slot} config.inputSlot - Target slot (input)
   * @param {SVGElement} config.svgLayer - SVG layer to draw on
   * @param {object} config.style - Connection style options
   */
  constructor(t) {
    var e, s, i;
    this.id = t.id || S("conn"), this.outputSlot = t.outputSlot, this.inputSlot = t.inputSlot, this.svgLayer = t.svgLayer, this.style = {
      color: ((e = t.style) == null ? void 0 : e.color) || "#667eea",
      width: ((s = t.style) == null ? void 0 : s.width) || 2,
      dashed: ((i = t.style) == null ? void 0 : i.dashed) || !1,
      ...t.style
    }, this.selected = !1, this._createPath(), this._bindEvents();
  }
  /**
   * Create the SVG path element
   */
  _createPath() {
    this.pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path"), this.pathElement.classList.add("ng-connection"), this.pathElement.dataset.connectionId = this.id, this._applyStyle(), this.updatePath(), this.svgLayer.appendChild(this.pathElement);
  }
  /**
   * Apply style to the path
   */
  _applyStyle() {
    this.pathElement.setAttribute("stroke", this.style.color), this.pathElement.setAttribute("stroke-width", this.style.width), this.pathElement.setAttribute("fill", "none"), this.style.dashed ? this.pathElement.setAttribute("stroke-dasharray", "8,4") : this.pathElement.removeAttribute("stroke-dasharray");
  }
  /**
   * Bind event listeners
   */
  _bindEvents() {
    if (this.style.dashed) {
      this.pathElement.style.pointerEvents = "none";
      return;
    }
    this.pathElement.addEventListener("click", (t) => {
      t.stopPropagation(), this.outputSlot.node.graph && this.outputSlot.node.graph.selection.selectConnection(this, t.ctrlKey || t.metaKey);
    }), this.pathElement.addEventListener("contextmenu", (t) => {
      t.preventDefault(), t.stopPropagation(), this.outputSlot.node.graph && !this.selected && this.outputSlot.node.graph.selection.selectConnection(this), this.pathElement.dispatchEvent(new CustomEvent("connection:contextmenu", {
        bubbles: !0,
        detail: { connection: this, event: t }
      }));
    }), this.pathElement.addEventListener("mouseenter", () => {
      this.pathElement.classList.add("ng-connection--hover");
    }), this.pathElement.addEventListener("mouseleave", () => {
      this.pathElement.classList.remove("ng-connection--hover");
    });
  }
  /**
  * Update the path based on slot positions
  */
  updatePath() {
    const t = this.outputSlot.getConnectionPoint(), e = this.inputSlot.getConnectionPoint(), s = this.outputSlot.orientation || "horizontal", i = this.inputSlot.orientation || "horizontal", n = P(t, e, s, i);
    this.pathElement.setAttribute("d", n);
  }
  /**
   * Select this connection
   */
  select() {
    this.selected = !0, this.pathElement.classList.add("ng-connection--selected");
  }
  /**
   * Deselect this connection
   */
  deselect() {
    this.selected = !1, this.pathElement.classList.remove("ng-connection--selected");
  }
  /**
   * Set connection style
   * @param {object} style - Style options
   */
  setStyle(t) {
    this.style = { ...this.style, ...t }, this._applyStyle();
  }
  /**
   * Destroy the connection
   */
  destroy() {
    this.outputSlot && this.outputSlot.connections && this.outputSlot.connections.delete(this), this.inputSlot && this.inputSlot.connections && this.inputSlot.connections.delete(this), this.pathElement && this.pathElement.parentNode && this.pathElement.parentNode.removeChild(this.pathElement);
  }
  /**
   * Serialize connection data
   * @returns {object} Serialized data
   */
  serialize() {
    const t = (i) => i.node ? { nodeId: i.node.id, slotId: i.id } : { nodeId: i.id, slotId: null }, e = t(this.outputSlot), s = t(this.inputSlot);
    return {
      id: this.id,
      outputNodeId: e.nodeId,
      outputSlotId: e.slotId,
      // null for symbolic
      inputNodeId: s.nodeId,
      inputSlotId: s.slotId,
      // null for symbolic
      style: { ...this.style }
    };
  }
}
class A {
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
  constructor(t) {
    var e, s, i, n;
    this.id = t.id || S("group"), this.graph = t.graph, this.label = t.label || "Group", this.color = t.color || "rgba(102, 126, 234, 0.1)", this.position = { x: ((e = t.position) == null ? void 0 : e.x) || 0, y: ((s = t.position) == null ? void 0 : s.y) || 0 }, this.size = { width: ((i = t.size) == null ? void 0 : i.width) || 200, height: ((n = t.size) == null ? void 0 : n.height) || 150 }, this.padding = t.padding || 20, this.nodes = /* @__PURE__ */ new Set(), this._createElement(), this._bindEvents(), this._updateStyle();
  }
  /**
   * Create the group DOM element
   */
  _createElement() {
    this.element = document.createElement("div"), this.element.className = "ng-group", this.element.dataset.groupId = this.id, this.headerElement = document.createElement("div"), this.headerElement.className = "ng-group-header", this.labelElement = document.createElement("span"), this.labelElement.className = "ng-group-label", this.labelElement.textContent = this.label, this.labelElement.contentEditable = !1, this.headerElement.appendChild(this.labelElement), this.element.appendChild(this.headerElement), this.resizeHandle = document.createElement("div"), this.resizeHandle.className = "ng-group-resize-handle", this.element.appendChild(this.resizeHandle), this._updatePosition(), this._updateSize();
  }
  /**
   * Bind event listeners
   */
  _bindEvents() {
    let t = !1, e = !1, s = { x: 0, y: 0 }, i = { x: 0, y: 0 }, n = { width: 0, height: 0 };
    this.headerElement.addEventListener("mousedown", (o) => {
      if (o.button !== 0) return;
      o.stopPropagation(), t = !0, s = { x: o.clientX, y: o.clientY }, i = { ...this.position };
      const a = [], h = this._getGraphRect();
      this.graph.nodes.forEach((r) => {
        const p = r.getBounds();
        this._rectsIntersect(h, p) && a.push(r);
      }), this.collidingNodes = a, this.element.classList.add("ng-group--dragging");
    }), this.resizeHandle.addEventListener("mousedown", (o) => {
      o.button === 0 && (o.stopPropagation(), e = !0, s = { x: o.clientX, y: o.clientY }, n = { ...this.size }, this.element.classList.add("ng-group--resizing"));
    }), document.addEventListener("mousemove", (o) => {
      var h, r;
      const a = ((r = (h = this.graph) == null ? void 0 : h.viewport) == null ? void 0 : r.scale) || 1;
      if (t) {
        const p = (o.clientX - s.x) / a, c = (o.clientY - s.y) / a;
        this.position.x = i.x + p, this.position.y = i.y + c, this._updatePosition(), this.collidingNodes && (this.collidingNodes.forEach((l) => {
          l.moveBy(p - (this.lastDx || 0), c - (this.lastDy || 0));
        }), this.lastDx = p, this.lastDy = c);
      }
      if (e) {
        const p = (o.clientX - s.x) / a, c = (o.clientY - s.y) / a;
        this.size.width = Math.max(100, n.width + p), this.size.height = Math.max(60, n.height + c), this._updateSize(), n = { ...this.size }, s = { x: o.clientX, y: o.clientY };
      }
    }), document.addEventListener("mouseup", () => {
      t && (t = !1, this.element.classList.remove("ng-group--dragging"), this.collidingNodes = null, this.lastDx = 0, this.lastDy = 0), e && (e = !1, this.element.classList.remove("ng-group--resizing"));
    }), this.labelElement.addEventListener("dblclick", (o) => {
      o.stopPropagation(), this._startEditLabel();
    }), this.element.addEventListener("contextmenu", (o) => {
      o.preventDefault(), o.stopPropagation(), this.element.dispatchEvent(new CustomEvent("group:contextmenu", {
        bubbles: !0,
        detail: { group: this, event: o }
      }));
    });
  }
  /**
   * Start editing the label
   */
  _startEditLabel() {
    this.labelElement.contentEditable = !0, this.labelElement.focus();
    const t = document.createRange();
    t.selectNodeContents(this.labelElement);
    const e = window.getSelection();
    e.removeAllRanges(), e.addRange(t);
    const s = () => {
      this.labelElement.contentEditable = !1, this.label = this.labelElement.textContent || "Group", this.labelElement.removeEventListener("blur", s), this.labelElement.removeEventListener("keydown", i);
    }, i = (n) => {
      n.key === "Enter" && (n.preventDefault(), s()), n.key === "Escape" && (this.labelElement.textContent = this.label, s());
    };
    this.labelElement.addEventListener("blur", s), this.labelElement.addEventListener("keydown", i);
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
    this.element.style.width = `${this.size.width}px`, this.element.style.height = `${this.size.height}px`;
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
  addNode(t) {
    this.nodes.add(t), t.group = this;
  }
  /**
   * Remove a node from the group
   * @param {Node} node - Node to remove
   */
  removeNode(t) {
    this.nodes.delete(t), t.group === this && (t.group = null);
  }
  /**
   * Set group label
   * @param {string} label - New label
   */
  setLabel(t) {
    this.label = t, this.labelElement.textContent = t;
  }
  /**
   * Set group color
   * @param {string} color - CSS color
   */
  setColor(t) {
    this.color = t, this._updateStyle();
  }
  /**
   * Auto-resize to fit contained nodes
   */
  fitToNodes() {
    if (this.nodes.size === 0) return;
    let t = 1 / 0, e = 1 / 0, s = -1 / 0, i = -1 / 0;
    this.nodes.forEach((n) => {
      const o = n.getBounds();
      t = Math.min(t, o.x), e = Math.min(e, o.y), s = Math.max(s, o.x + o.width), i = Math.max(i, o.y + o.height);
    }), this.position.x = t - this.padding, this.position.y = e - this.padding - 30, this.size.width = s - t + this.padding * 2, this.size.height = i - e + this.padding * 2 + 30, this._updatePosition(), this._updateSize();
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
  _rectsIntersect(t, e) {
    const s = t.left + t.width, i = t.top + t.height, n = e.x + e.width, o = e.y + e.height;
    return !(t.left > n || s < e.x || t.top > o || i < e.y);
  }
  /**
   * Destroy the group
   */
  destroy() {
    this.nodes.forEach((t) => {
      t.group === this && (t.group = null);
    }), this.nodes.clear(), this.element && this.element.parentNode && this.element.parentNode.removeChild(this.element);
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
      nodeIds: Array.from(this.nodes).map((t) => t.id)
    };
  }
}
class D {
  /**
   * @param {object} config - Configuration
   * @param {HTMLElement} config.container - Container element
   * @param {HTMLElement} config.content - Content element to transform
   * @param {object} config.options - Zoom/pan options
   */
  constructor(t) {
    var e, s, i, n;
    this.container = t.container, this.content = t.content, this.options = {
      minZoom: ((e = t.options) == null ? void 0 : e.minZoom) || 0.1,
      maxZoom: ((s = t.options) == null ? void 0 : s.maxZoom) || 4,
      zoomSpeed: ((i = t.options) == null ? void 0 : i.zoomSpeed) || 0.1,
      panButton: ((n = t.options) == null ? void 0 : n.panButton) || 1,
      // Middle mouse button
      ...t.options
    }, this.scale = 1, this.panX = 0, this.panY = 0, this._isPanning = !1, this._panStartX = 0, this._panStartY = 0, this._spacePressed = !1, this._bindEvents();
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
    this.container.addEventListener("wheel", (t) => {
      t.preventDefault();
      const e = this.container.getBoundingClientRect(), s = t.clientX - e.left, i = t.clientY - e.top, o = 1 + (t.deltaY > 0 ? -1 : 1) * this.options.zoomSpeed;
      this.zoomAt(s, i, o);
    }, { passive: !1 }), this.container.addEventListener("mousedown", (t) => {
      (t.button === this.options.panButton || t.button === 0 && this._spacePressed) && (t.preventDefault(), this._startPan(t));
    }), document.addEventListener("mousemove", z((t) => {
      this._isPanning && this._updatePan(t);
    }, 16)), document.addEventListener("mouseup", (t) => {
      this._isPanning && this._endPan();
    }), document.addEventListener("keydown", (t) => {
      t.code === "Space" && !this._spacePressed && (this._spacePressed = !0, this.container.style.cursor = "grab");
    }), document.addEventListener("keyup", (t) => {
      t.code === "Space" && (this._spacePressed = !1, this.container.style.cursor = "");
    });
  }
  /**
   * Start panning
   */
  _startPan(t) {
    this._isPanning = !0, this._panStartX = t.clientX - this.panX, this._panStartY = t.clientY - this.panY, this.container.style.cursor = "grabbing";
  }
  /**
   * Update pan position
   */
  _updatePan(t) {
    this.panX = t.clientX - this._panStartX, this.panY = t.clientY - this._panStartY, this._applyTransform();
  }
  /**
   * End panning
   */
  _endPan() {
    this._isPanning = !1, this.container.style.cursor = this._spacePressed ? "grab" : "";
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
  zoomAt(t, e, s) {
    const i = Math.min(Math.max(this.scale * s, this.options.minZoom), this.options.maxZoom);
    if (i === this.scale) return;
    const n = i / this.scale;
    this.panX = t - (t - this.panX) * n, this.panY = e - (e - this.panY) * n, this.scale = i, this._applyTransform();
  }
  /**
   * Set zoom level
   * @param {number} scale - New scale
   */
  setZoom(t) {
    this.scale = Math.min(Math.max(t, this.options.minZoom), this.options.maxZoom), this._applyTransform();
  }
  /**
   * Set pan position
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  setPan(t, e) {
    this.panX = t, this.panY = e, this._applyTransform();
  }
  /**
   * Reset viewport to default
   */
  reset() {
    this.scale = 1, this.panX = 0, this.panY = 0, this._applyTransform();
  }
  /**
   * Center the viewport on a point
   * @param {number} x - X coordinate in content space
   * @param {number} y - Y coordinate in content space
   */
  centerOn(t, e) {
    const s = this.container.getBoundingClientRect();
    this.panX = s.width / 2 - t * this.scale, this.panY = s.height / 2 - e * this.scale, this._applyTransform();
  }
  /**
   * Convert screen coordinates to graph coordinates
   * @param {number} screenX - Screen X
   * @param {number} screenY - Screen Y
   * @returns {object} {x, y} in graph space
   */
  screenToGraph(t, e) {
    const s = this.container.getBoundingClientRect();
    return {
      x: (t - s.left - this.panX) / this.scale,
      y: (e - s.top - this.panY) / this.scale
    };
  }
  /**
   * Convert graph coordinates to screen coordinates
   * @param {number} graphX - Graph X
   * @param {number} graphY - Graph Y
   * @returns {object} {x, y} in screen space
   */
  graphToScreen(t, e) {
    const s = this.container.getBoundingClientRect();
    return {
      x: t * this.scale + this.panX + s.left,
      y: e * this.scale + this.panY + s.top
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
  setState(t) {
    t.scale !== void 0 && (this.scale = t.scale), t.panX !== void 0 && (this.panX = t.panX), t.panY !== void 0 && (this.panY = t.panY), this._applyTransform();
  }
}
class T {
  /**
   * @param {NodeGraph} graph - Parent graph
   */
  constructor(t) {
    this.graph = t, this.selectedNodes = /* @__PURE__ */ new Set(), this.selectedConnections = /* @__PURE__ */ new Set(), this._isBoxSelecting = !1, this._boxStart = { x: 0, y: 0 }, this._boxElement = null, this._bindEvents();
  }
  /**
   * Bind event listeners
   */
  _bindEvents() {
    this.graph.container.addEventListener("mousedown", (t) => {
      t.button === 0 && (this.graph.viewport.isPanningWithSpace || t.target !== this.graph.container && t.target !== this.graph.nodesLayer && !t.target.classList.contains("ng-viewport") || (!t.ctrlKey && !t.metaKey && this.clearSelection(), this._startBoxSelection(t)));
    }), document.addEventListener("mousemove", (t) => {
      this._isBoxSelecting && this._updateBoxSelection(t);
    }), document.addEventListener("mouseup", () => {
      this._isBoxSelecting && this._endBoxSelection();
    }), document.addEventListener("keydown", (t) => {
      (t.key === "Delete" || t.key === "Backspace") && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA" && this.deleteSelected(), (t.ctrlKey || t.metaKey) && t.key === "a" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA" && (t.preventDefault(), this.selectAll()), t.key === "Escape" && this.clearSelection();
    });
  }
  /**
   * Start box selection
   */
  _startBoxSelection(t) {
    const e = this.graph.viewport.screenToGraph(t.clientX, t.clientY);
    this._boxStart = e, this._isBoxSelecting = !0, this._boxElement = document.createElement("div"), this._boxElement.className = "ng-selection-box", this._boxElement.style.left = `${e.x}px`, this._boxElement.style.top = `${e.y}px`, this._boxElement.style.width = "0", this._boxElement.style.height = "0", this.graph.nodesLayer.appendChild(this._boxElement);
  }
  /**
   * Update box selection
   */
  _updateBoxSelection(t) {
    const e = this.graph.viewport.screenToGraph(t.clientX, t.clientY), s = Math.min(this._boxStart.x, e.x), i = Math.min(this._boxStart.y, e.y), n = Math.abs(e.x - this._boxStart.x), o = Math.abs(e.y - this._boxStart.y);
    this._boxElement.style.left = `${s}px`, this._boxElement.style.top = `${i}px`, this._boxElement.style.width = `${n}px`, this._boxElement.style.height = `${o}px`;
  }
  /**
   * End box selection
   */
  _endBoxSelection() {
    if (!this._boxElement) return;
    const t = {
      left: parseFloat(this._boxElement.style.left),
      top: parseFloat(this._boxElement.style.top),
      width: parseFloat(this._boxElement.style.width),
      height: parseFloat(this._boxElement.style.height)
    };
    t.right = t.left + t.width, t.bottom = t.top + t.height, this.graph.nodes.forEach((e) => {
      const s = e.getBounds();
      this._rectsIntersect(t, {
        left: s.x,
        top: s.y,
        right: s.x + s.width,
        bottom: s.y + s.height
      }) && this.addToSelection(e);
    }), this._boxElement.remove(), this._boxElement = null, this._isBoxSelecting = !1;
  }
  /**
   * Check if two rectangles intersect
   */
  _rectsIntersect(t, e) {
    return !(t.right < e.left || t.left > e.right || t.bottom < e.top || t.top > e.bottom);
  }
  /**
   * Select a node
   * @param {Node} node - Node to select
   * @param {boolean} additive - Add to selection instead of replacing
   */
  selectNode(t, e = !1) {
    e || this.clearSelection(), this.addToSelection(t);
  }
  /**
   * Add a node to selection
   * @param {Node} node - Node to add
   */
  addToSelection(t) {
    this.selectedNodes.has(t) || (this.selectedNodes.add(t), t.select(), this.graph.emit("selection:change", { nodes: Array.from(this.selectedNodes) }));
  }
  /**
   * Remove a node from selection
   * @param {Node} node - Node to remove
   */
  removeFromSelection(t) {
    this.selectedNodes.has(t) && (this.selectedNodes.delete(t), t.deselect(), this.graph.emit("node:deselect", t), this.graph.emit("selection:change", { nodes: Array.from(this.selectedNodes) }));
  }
  /**
   * Toggle node selection
   * @param {Node} node - Node to toggle
   */
  toggleSelection(t) {
    this.selectedNodes.has(t) ? this.removeFromSelection(t) : this.addToSelection(t);
  }
  /**
   * Select a connection
   * @param {Connection} connection - Connection to select
   * @param {boolean} additive - Add to selection instead of replacing
   */
  selectConnection(t, e = !1) {
    e || this.clearSelection(), this.selectedConnections.has(t) || (this.selectedConnections.add(t), t.select());
  }
  /**
   * Clear connection selection
   */
  clearConnectionSelection() {
    this.selectedConnections.forEach((t) => t.deselect()), this.selectedConnections.clear();
  }
  /**
   * Clear all selection
   */
  clearSelection() {
    this.selectedNodes.forEach((t) => {
      t.deselect(), this.graph.emit("node:deselect", t);
    }), this.selectedNodes.clear(), this.clearConnectionSelection(), this.graph.emit("selection:change", { nodes: [], connections: [] });
  }
  /**
   * Select all nodes
   */
  selectAll() {
    this.graph.nodes.forEach((t) => {
      this.addToSelection(t);
    });
  }
  /**
   * Delete selected nodes and connections
   */
  deleteSelected() {
    this.selectedConnections.forEach((t) => {
      this.graph.disconnect(t.id);
    }), this.selectedConnections.clear(), this.selectedNodes.forEach((t) => {
      this.graph.removeNode(t.id);
    }), this.selectedNodes.clear(), this.graph.emit("selection:change", { nodes: [], connections: [] });
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
  isSelected(t) {
    return this.selectedNodes.has(t);
  }
}
class $ {
  /**
   * @param {object} config - Configuration
   * @param {SVGElement} config.svgLayer - SVG layer to draw on
   * @param {object} config.options - Grid options
   */
  constructor(t) {
    var e, s, i, n, o;
    this.svgLayer = t.svgLayer, this.options = {
      enabled: ((e = t.options) == null ? void 0 : e.enabled) !== !1,
      step: ((s = t.options) == null ? void 0 : s.step) || 20,
      color: ((i = t.options) == null ? void 0 : i.color) || "rgba(255,255,255,0.05)",
      majorLineEvery: ((n = t.options) == null ? void 0 : n.majorLineEvery) || 5,
      majorColor: ((o = t.options) == null ? void 0 : o.majorColor) || "rgba(255,255,255,0.1)",
      ...t.options
    }, this._gridGroup = null, this._pattern = null, this.options.enabled && this._createGrid();
  }
  /**
   * Create the grid pattern
   */
  _createGrid() {
    let t = this.svgLayer.querySelector("defs");
    t || (t = document.createElementNS("http://www.w3.org/2000/svg", "defs"), this.svgLayer.insertBefore(t, this.svgLayer.firstChild));
    const e = this.options.step, s = e * this.options.majorLineEvery;
    this._pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern"), this._pattern.setAttribute("id", "ng-grid-pattern"), this._pattern.setAttribute("width", s), this._pattern.setAttribute("height", s), this._pattern.setAttribute("patternUnits", "userSpaceOnUse");
    for (let n = 0; n <= this.options.majorLineEvery; n++) {
      const o = n * e, a = n * e, h = document.createElementNS("http://www.w3.org/2000/svg", "line");
      h.setAttribute("x1", o), h.setAttribute("y1", 0), h.setAttribute("x2", o), h.setAttribute("y2", s), h.setAttribute("stroke", n === 0 ? this.options.majorColor : this.options.color), h.setAttribute("stroke-width", n === 0 ? 1 : 0.5), this._pattern.appendChild(h);
      const r = document.createElementNS("http://www.w3.org/2000/svg", "line");
      r.setAttribute("x1", 0), r.setAttribute("y1", a), r.setAttribute("x2", s), r.setAttribute("y2", a), r.setAttribute("stroke", n === 0 ? this.options.majorColor : this.options.color), r.setAttribute("stroke-width", n === 0 ? 1 : 0.5), this._pattern.appendChild(r);
    }
    t.appendChild(this._pattern), this._gridGroup = document.createElementNS("http://www.w3.org/2000/svg", "g"), this._gridGroup.classList.add("ng-grid");
    const i = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    i.setAttribute("x", -1e4), i.setAttribute("y", -1e4), i.setAttribute("width", 2e4), i.setAttribute("height", 2e4), i.setAttribute("fill", "url(#ng-grid-pattern)"), this._gridGroup.appendChild(i), this.svgLayer.insertBefore(this._gridGroup, this.svgLayer.firstChild.nextSibling);
  }
  /**
   * Show the grid
   */
  show() {
    this.options.enabled = !0, this._gridGroup ? this._gridGroup.style.display = "" : this._createGrid();
  }
  /**
   * Hide the grid
   */
  hide() {
    this.options.enabled = !1, this._gridGroup && (this._gridGroup.style.display = "none");
  }
  /**
   * Toggle grid visibility
   */
  toggle() {
    this.options.enabled ? this.hide() : this.show();
  }
  /**
   * Set grid step size
   * @param {number} step - Step size in pixels
   */
  setStep(t) {
    this.options.step = t, this._destroyGrid(), this._createGrid();
  }
  /**
   * Snap a position to the grid
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {object} Snapped position {x, y}
   */
  snap(t, e) {
    const s = this.options.step;
    return {
      x: Math.round(t / s) * s,
      y: Math.round(e / s) * s
    };
  }
  /**
   * Destroy the grid
   */
  _destroyGrid() {
    this._gridGroup && (this._gridGroup.remove(), this._gridGroup = null), this._pattern && (this._pattern.remove(), this._pattern = null);
  }
  /**
   * Destroy the grid manager
   */
  destroy() {
    this._destroyGrid();
  }
}
class B {
  /**
   * @param {NodeGraph} graph - Parent graph
   */
  constructor(t) {
    this.graph = t, this.menuElement = null, this.isOpen = !1, this.menuItems = {
      canvas: [],
      node: [],
      group: [],
      connection: []
    }, this._registerDefaultItems(), this._bindEvents();
  }
  /**
   * Register default menu items
   */
  _registerDefaultItems() {
    this.addItem("canvas", {
      id: "add-node",
      label: "Add Node",
      icon: "➕",
      action: (t) => {
        this.graph.emit("canvas:add-node", t.position);
      }
    }), this.addItem("canvas", {
      id: "add-group",
      label: "Add Group",
      icon: "📁",
      action: (t) => {
        this.graph.addGroup({
          label: "New Group",
          position: t.position,
          size: { width: 300, height: 200 }
        });
      }
    }), this.addItem("canvas", { type: "separator" }), this.addItem("canvas", {
      id: "paste",
      label: "Paste",
      icon: "📋",
      shortcut: "Ctrl+V",
      action: () => {
        var t;
        return (t = this.graph.clipboard) == null ? void 0 : t.paste();
      },
      enabled: () => {
        var t;
        return (t = this.graph.clipboard) == null ? void 0 : t.hasData();
      }
    }), this.addItem("canvas", {
      id: "select-all",
      label: "Select All",
      icon: "☑️",
      shortcut: "Ctrl+A",
      action: () => {
        var t;
        return (t = this.graph.selection) == null ? void 0 : t.selectAll();
      }
    }), this.addItem("canvas", { type: "separator" }), this.addItem("canvas", {
      id: "toggle-grid",
      label: "Toggle Grid",
      icon: "⊞",
      action: () => {
        var t;
        return (t = this.graph.grid) == null ? void 0 : t.toggle();
      }
    }), this.addItem("canvas", {
      id: "arrange",
      label: "Arrange Nodes",
      icon: "🏗️",
      action: () => this.graph.arrange()
    }), this.addItem("canvas", {
      id: "reset-view",
      label: "Reset View",
      icon: "🏠",
      action: () => {
        var t;
        return (t = this.graph.viewport) == null ? void 0 : t.reset();
      }
    }), this.addItem("node", {
      id: "copy",
      label: "Copy",
      icon: "📄",
      shortcut: "Ctrl+C",
      action: (t) => {
        var e;
        return (e = this.graph.clipboard) == null ? void 0 : e.copy();
      }
    }), this.addItem("node", {
      id: "cut",
      label: "Cut",
      icon: "✂️",
      shortcut: "Ctrl+X",
      action: () => {
        var t;
        return (t = this.graph.clipboard) == null ? void 0 : t.cut();
      }
    }), this.addItem("node", {
      id: "duplicate",
      label: "Duplicate",
      icon: "⧉",
      shortcut: "Ctrl+D",
      action: () => {
        var t;
        return (t = this.graph.clipboard) == null ? void 0 : t.duplicate();
      }
    }), this.addItem("node", { type: "separator" }), this.addItem("node", {
      id: "connect",
      label: "Connect",
      icon: "🔗",
      action: (t) => this.graph.autoConnect(t.node),
      enabled: (t) => {
        const e = t.node, s = Math.min(e.element.offsetWidth, e.element.offsetHeight) / 2, i = e.getBounds();
        for (const n of this.graph.nodes.values()) {
          if (n === e) continue;
          const o = n.getBounds(), a = Math.max(0, Math.abs(i.x + i.width / 2 - (o.x + o.width / 2)) - (i.width + o.width) / 2), h = Math.max(0, Math.abs(i.y + i.height / 2 - (o.y + o.height / 2)) - (i.height + o.height) / 2);
          if (Math.sqrt(a * a + h * h) < s) return !0;
        }
        return !1;
      }
    }), this.addItem("node", { type: "separator" }), this.addItem("node", {
      id: "disconnect",
      label: "Disconnect",
      icon: "🔌",
      // Plugin/Disconnect icon
      action: (t) => {
        const e = t.node, s = [];
        e.inputSlots.forEach((i) => {
          i.connections.forEach((n) => s.push(n.id));
        }), e.outputSlots.forEach((i) => {
          i.connections.forEach((n) => s.push(n.id));
        }), e.connections && e.connections.forEach((i) => s.push(i.id)), s.forEach((i) => this.graph.disconnect(i));
      },
      enabled: (t) => {
        let e = !1;
        return t.node.inputSlots.forEach((s) => {
          s.connections.size > 0 && (e = !0);
        }), !!(e || (t.node.outputSlots.forEach((s) => {
          s.connections.size > 0 && (e = !0);
        }), e) || t.node.connections && t.node.connections.size > 0);
      }
    }), this.addItem("node", { type: "separator" }), this.addItem("node", {
      id: "delete",
      label: "Delete",
      icon: "🗑️",
      shortcut: "Del",
      action: () => {
        var t;
        return (t = this.graph.selection) == null ? void 0 : t.deleteSelected();
      },
      className: "ng-context-menu-item--danger"
    }), this.addItem("group", {
      id: "rename",
      label: "Rename Group",
      icon: "✎",
      action: (t) => t.group._startEditLabel()
    }), this.addItem("group", {
      id: "color",
      label: "Change Color",
      icon: "🎨",
      action: (t) => {
        const e = document.createElement("input");
        e.type = "color", e.value = "#667eea", e.style.position = "absolute", e.style.opacity = "0", e.style.pointerEvents = "none", document.body.appendChild(e), e.addEventListener("input", (s) => {
          const i = s.target.value, n = parseInt(i.slice(1, 3), 16), o = parseInt(i.slice(3, 5), 16), a = parseInt(i.slice(5, 7), 16);
          t.group.setColor(`rgba(${n}, ${o}, ${a}, 0.1)`);
        }), e.addEventListener("change", () => {
          e.remove();
        }), e.click();
      }
    }), this.addItem("group", { type: "separator" }), this.addItem("group", {
      id: "delete-group",
      label: "Delete Group",
      icon: "🗑️",
      action: (t) => this.graph.removeGroup(t.group.id),
      className: "ng-context-menu-item--danger"
    }), this.addItem("connection", {
      id: "delete-connection",
      label: "Delete Connection",
      icon: "🗑️",
      action: (t) => {
        t.connection && this.graph.disconnect(t.connection.id);
      },
      className: "ng-context-menu-item--danger"
    });
  }
  /**
   * Bind event listeners
   */
  _bindEvents() {
    document.addEventListener("click", (t) => {
      var e;
      this.isOpen && !((e = this.menuElement) != null && e.contains(t.target)) && this.close();
    }), document.addEventListener("keydown", (t) => {
      t.key === "Escape" && this.isOpen && this.close();
    }), this.graph.container.addEventListener("wheel", () => {
      this.isOpen && this.close();
    });
  }
  /**
   * Add a menu item
   * @param {string} menuType - Menu type (canvas, node, group, connection)
   * @param {object} item - Menu item configuration
   */
  addItem(t, e) {
    if (this.menuItems[t] || (this.menuItems[t] = []), e.id) {
      const s = this.menuItems[t].findIndex((i) => i.id === e.id);
      if (s !== -1) {
        this.menuItems[t][s] = e;
        return;
      }
    }
    this.menuItems[t].push(e);
  }
  /**
   * Remove a menu item
   * @param {string} menuType - Menu type
   * @param {string} itemId - Item ID
   */
  removeItem(t, e) {
    this.menuItems[t] && (this.menuItems[t] = this.menuItems[t].filter((s) => s.id !== e));
  }
  /**
   * Open context menu
   * @param {string} menuType - Menu type
   * @param {number} x - X position (screen)
   * @param {number} y - Y position (screen)
   * @param {object} context - Context data (node, connection, etc.)
   */
  open(t, e, s, i = {}) {
    this.close();
    const n = this.menuItems[t];
    if (!n || n.length === 0) return;
    this.menuElement = document.createElement("div"), this.menuElement.className = "ng-context-menu", n.forEach((a) => {
      if (a.type === "separator") {
        const c = document.createElement("div");
        c.className = "ng-context-menu-separator", this.menuElement.appendChild(c);
        return;
      }
      const h = a.enabled ? a.enabled(i) : !0, r = document.createElement("div");
      if (r.className = "ng-context-menu-item", a.className && r.classList.add(a.className), h || r.classList.add("ng-context-menu-item--disabled"), a.icon) {
        const c = document.createElement("span");
        c.className = "ng-context-menu-icon", c.textContent = a.icon, r.appendChild(c);
      }
      const p = document.createElement("span");
      if (p.className = "ng-context-menu-label", p.textContent = a.label, r.appendChild(p), a.shortcut) {
        const c = document.createElement("span");
        c.className = "ng-context-menu-shortcut", c.textContent = a.shortcut, r.appendChild(c);
      }
      h && a.action && r.addEventListener("click", (c) => {
        c.stopPropagation(), a.action(i), this.close();
      }), this.menuElement.appendChild(r);
    }), this.menuElement.style.left = `${e}px`, this.menuElement.style.top = `${s}px`, document.body.appendChild(this.menuElement), this.isOpen = !0;
    const o = this.menuElement.getBoundingClientRect();
    o.right > window.innerWidth && (this.menuElement.style.left = `${e - o.width}px`), o.bottom > window.innerHeight && (this.menuElement.style.top = `${s - o.height}px`);
  }
  /**
   * Close context menu
   */
  close() {
    this.menuElement && (this.menuElement.remove(), this.menuElement = null), this.isOpen = !1;
  }
  /**
   * Destroy the context menu manager
   */
  destroy() {
    this.close();
  }
}
class R {
  /**
   * @param {NodeGraph} graph - Parent graph
   */
  constructor(t) {
    this.graph = t, this._clipboardData = null, this._bindEvents();
  }
  /**
   * Bind keyboard event listeners
   */
  _bindEvents() {
    document.addEventListener("keydown", (t) => {
      if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")
        return;
      const s = navigator.platform.toUpperCase().indexOf("MAC") >= 0 ? t.metaKey : t.ctrlKey;
      s && t.key === "c" ? (t.preventDefault(), this.copy()) : s && t.key === "x" ? (t.preventDefault(), this.cut()) : s && t.key === "v" ? (t.preventDefault(), this.paste()) : s && t.key === "d" && (t.preventDefault(), this.duplicate());
    });
  }
  /**
   * Copy selected nodes to clipboard
   */
  copy() {
    var a;
    const t = ((a = this.graph.selection) == null ? void 0 : a.getSelectedNodes()) || [];
    if (t.length === 0) return;
    let e = 1 / 0, s = 1 / 0;
    t.forEach((h) => {
      e = Math.min(e, h.position.x), s = Math.min(s, h.position.y);
    });
    const i = t.map((h) => {
      const r = h.serialize();
      return r.position.x -= e, r.position.y -= s, r;
    }), n = new Set(t.map((h) => h.id)), o = [];
    this.graph.connections.forEach((h) => {
      const r = (l) => l.node ? l.node.id : l.id, p = r(h.outputSlot), c = r(h.inputSlot);
      n.has(p) && n.has(c) && o.push(h.serialize());
    }), this._clipboardData = {
      nodes: i,
      connections: o
    }, this.graph.emit("clipboard:copy", { nodes: t });
  }
  /**
   * Cut selected nodes
   */
  cut() {
    var t;
    this.copy(), (t = this.graph.selection) == null || t.deleteSelected(), this.graph.emit("clipboard:cut", {});
  }
  /**
  * Paste nodes from clipboard
  */
  paste() {
    var n, o;
    if (!this._clipboardData) return;
    let t, e;
    if (this.graph.lastMousePos) {
      const a = this.graph.viewport.screenToGraph(this.graph.lastMousePos.x, this.graph.lastMousePos.y);
      t = a.x, e = a.y;
    } else {
      const a = ((n = this.graph.viewport) == null ? void 0 : n.getState()) || { panX: 0, panY: 0, scale: 1 }, h = this.graph.container.getBoundingClientRect();
      t = (h.width / 2 - a.panX) / a.scale, e = (h.height / 2 - a.panY) / a.scale;
    }
    const s = /* @__PURE__ */ new Map();
    (o = this.graph.selection) == null || o.clearSelection();
    const i = [];
    this._clipboardData.nodes.forEach((a) => {
      var l;
      const h = a.id, r = JSON.parse(JSON.stringify(a));
      r.position = {
        x: t + a.position.x,
        y: e + a.position.y
      }, delete r.id;
      const p = {
        data: r,
        originalId: h,
        cancel: !1
      };
      if (this.graph.emit("clipboard:pasting", p), p.cancel) return;
      const c = this.graph.addNode(r);
      s.set(h, c.id), i.push(c), (l = this.graph.selection) == null || l.addToSelection(c);
    }), this._clipboardData.connections.forEach((a) => {
      const h = s.get(a.outputNodeId), r = s.get(a.inputNodeId);
      if (h && r) {
        const p = this.graph.getNode(h), c = this.graph.getNode(r);
        if (p && c) {
          const l = p.getOutput(a.outputSlotId), d = c.getInput(a.inputSlotId);
          l && d && this.graph.connect(l, d, a.style);
        }
      }
    }), this.graph.emit("clipboard:paste", { nodes: i });
  }
  /**
   * Duplicate selected nodes (copy + paste in place)
   */
  duplicate() {
    var i;
    if ((((i = this.graph.selection) == null ? void 0 : i.getSelectedNodes()) || []).length === 0) return;
    const e = this._clipboardData, s = this.graph.lastMousePos;
    this.copy(), this.paste(), this._clipboardData = e, this.graph.lastMousePos = s;
  }
  /**
   * Check if clipboard has data
   * @returns {boolean}
   */
  hasData() {
    return this._clipboardData !== null && this._clipboardData.nodes.length > 0;
  }
  /**
   * Clear clipboard
   */
  clear() {
    this._clipboardData = null;
  }
}
class k extends I {
  /**
   * @param {string|HTMLElement} container - Container element or selector
   * @param {object} options - Graph options
   */
  constructor(t, e = {}) {
    if (super(), typeof t == "string" ? this.container = document.querySelector(t) : this.container = t, !this.container)
      throw new Error("NodeGraph: Container element not found");
    this.options = {
      grid: {
        enabled: !0,
        step: 20,
        ...e.grid
      },
      zoom: {
        min: 0.1,
        max: 4,
        speed: 0.1,
        ...e.zoom
      },
      snapToGrid: e.snapToGrid !== !1,
      bidirectional: e.bidirectional !== !1,
      ...e
    }, this.nodes = /* @__PURE__ */ new Map(), this.connections = /* @__PURE__ */ new Map(), this.groups = /* @__PURE__ */ new Map(), this._connectionDrag = null, this._tempPath = null, this._createLayers(), this._initManagers(), this._bindEvents();
  }
  /**
   * Create the DOM layers
   */
  _createLayers() {
    this.container.classList.add("ng-container"), this.viewportElement = document.createElement("div"), this.viewportElement.className = "ng-viewport", this.groupsLayer = document.createElement("div"), this.groupsLayer.className = "ng-groups-layer", this.viewportElement.appendChild(this.groupsLayer), this.svgLayer = document.createElementNS("http://www.w3.org/2000/svg", "svg"), this.svgLayer.classList.add("ng-svg-layer"), this.svgLayer.setAttribute("width", "100%"), this.svgLayer.setAttribute("height", "100%"), this.viewportElement.appendChild(this.svgLayer), this.connectionsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g"), this.connectionsGroup.classList.add("ng-connections"), this.svgLayer.appendChild(this.connectionsGroup), this.nodesLayer = document.createElement("div"), this.nodesLayer.className = "ng-nodes-layer", this.viewportElement.appendChild(this.nodesLayer), this.container.appendChild(this.viewportElement);
  }
  /**
   * Initialize managers
   */
  _initManagers() {
    this.viewport = new D({
      container: this.container,
      content: this.viewportElement,
      options: this.options.zoom
    }), this.selection = new T(this), this.grid = new $({
      svgLayer: this.svgLayer,
      options: this.options.grid
    }), this.contextMenu = new B(this), this.clipboard = new R(this);
  }
  /**
   * Bind global event listeners
   */
  _bindEvents() {
    this.nodesLayer.addEventListener("node:select", (e) => {
      const { node: s, event: i } = e.detail;
      i.ctrlKey || i.metaKey ? this.selection.toggleSelection(s) : this.selection.isSelected(s) || this.selection.selectNode(s), this.emit("node:select", s);
    }), this.nodesLayer.addEventListener("node:drag", (e) => {
      const { node: s } = e.detail;
      this.selection.isSelected(s) && this.selection.selectedNodes.size > 1, this.emit("node:drag", s);
    }), this.nodesLayer.addEventListener("node:dragend", (e) => {
      this.emit("node:dragend", e.detail.node);
    }), this.nodesLayer.addEventListener("node:resize", (e) => {
      this.emit("node:resize", e.detail.node);
    }), this.nodesLayer.addEventListener("node:contextmenu", (e) => {
      const { node: s, event: i } = e.detail;
      this.selection.isSelected(s) || this.selection.selectNode(s), this.contextMenu.open("node", i.clientX, i.clientY, { node: s });
    }), this.nodesLayer.addEventListener("slot:dragstart", (e) => {
      const { slot: s, event: i } = e.detail;
      this._startConnectionDrag(s, i);
    }), this.container.addEventListener("contextmenu", (e) => {
      if (e.target === this.container || e.target === this.viewportElement || e.target === this.nodesLayer || e.target.classList.contains("ng-viewport")) {
        e.preventDefault();
        const s = this.viewport.screenToGraph(e.clientX, e.clientY);
        this.contextMenu.open("canvas", e.clientX, e.clientY, { position: s });
      }
    }), this.groupsLayer.addEventListener("group:contextmenu", (e) => {
      const { group: s, event: i } = e.detail;
      this.contextMenu.open("group", i.clientX, i.clientY, { group: s });
    }), this.connectionsGroup.addEventListener("connection:contextmenu", (e) => {
      const { connection: s, event: i } = e.detail;
      this.contextMenu.open("connection", i.clientX, i.clientY, { connection: s });
    }), document.addEventListener("mousemove", (e) => {
      this.lastMousePos = { x: e.clientX, y: e.clientY }, this._connectionDrag && this._updateConnectionDrag(e);
    }), document.addEventListener("mouseup", (e) => {
      this._connectionDrag && this._endConnectionDrag(e);
    }), [
      "node:add",
      "node:remove",
      "node:dragend",
      "node:resize",
      // Nodes
      "connection:create",
      "connection:remove",
      // Connections
      "group:add",
      "group:remove",
      // Groups
      "graph:arrange",
      "graph:clear",
      // Graph
      "clipboard:paste",
      "clipboard:cut",
      "clipboard:duplicate"
      // Clipboard (redundant but explicit?)
      // Note: paste/cut/duplicate already trigger add/remove events, but specific event might be useful.
      // User requested "change" with details.
      // If we emit change for 'clipboard:paste', we duplicate events for the nodes added.
      // User asked: "nuovo nodo aggiunto... duplicato...".
      // If I duplicate, I get 'node:add'. That satisfies "nuovo nodo aggiunto" AND "duplicato" implicitly.
      // But maybe explicit is better?
      // "il tipo di cambiamento e se possibile l'oggetto".
      // Let's stick to primitive changes for data consistency, and maybe high-level generic ones if needed.
      // Stick to data changes: add, remove, move (dragend), resize, connect, disconnect, group add/remove, arrange, clear.
    ].forEach((e) => {
      e.startsWith("clipboard") || this.on(e, (s) => {
        let i = e;
        e === "node:dragend" && (i = "node:move"), this.emit("change", {
          type: i,
          item: s,
          // The object (node, connection, group) or ID
          timestamp: Date.now()
        });
      });
    });
  }
  /**
       * Start dragging a connection from a slot
       */
  _startConnectionDrag(t, e) {
    !this.options.bidirectional && t.type === "input" || (this._connectionDrag = {
      sourceSlot: t,
      startPos: t.getConnectionPoint()
    }, this._tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path"), this._tempPath.classList.add("ng-connection", "ng-connection--temp"), this._tempPath.setAttribute("stroke", t.color), this._tempPath.setAttribute("stroke-width", "2"), this._tempPath.setAttribute("fill", "none"), this._tempPath.setAttribute("stroke-dasharray", "5,5"), this._tempPath.style.pointerEvents = "none", this.svgLayer.appendChild(this._tempPath), this._updateConnectionDrag(e));
  }
  /**
   * Update connection drag path
   */
  _updateConnectionDrag(t) {
    if (!this._connectionDrag || !this._tempPath) return;
    const e = this.viewport.screenToGraph(t.clientX, t.clientY), s = this._connectionDrag.startPos, i = this._connectionDrag.sourceSlot.orientation, n = e.x - s.x, o = Math.max(Math.abs(n) / 2, 50);
    let a;
    i === "horizontal" ? a = `M ${s.x} ${s.y} C ${s.x + o} ${s.y}, ${e.x - o} ${e.y}, ${e.x} ${e.y}` : a = `M ${s.x} ${s.y} C ${s.x} ${s.y + o}, ${e.x} ${e.y - o}, ${e.x} ${e.y}`, this._tempPath.setAttribute("d", a);
    const h = document.elementFromPoint(t.clientX, t.clientY), r = h == null ? void 0 : h.closest(".ng-slot-click-area"), p = r == null ? void 0 : r.closest(".ng-slot");
    let c = null;
    if (p) {
      const d = p.closest(".ng-node");
      if (d) {
        const u = d.dataset.nodeId, m = this.nodes.get(u);
        if (m) {
          const f = p.dataset.slotId, y = p.dataset.slotType;
          y === "input" ? c = m.inputSlots.get(f) : y === "output" ? c = m.outputSlots.get(f) : c = m.inputSlots.get(f) || m.outputSlots.get(f);
        }
      }
    }
    const l = this._connectionDrag.targetSlot;
    if (c !== l) {
      if (l) {
        const d = l.element.querySelector(".ng-slot-connector");
        d && d.classList.remove("ng-slot-connector--invalid", "ng-slot-connector--highlight");
      }
      if (c)
        if (c === this._connectionDrag.sourceSlot) {
          const d = c.element.querySelector(".ng-slot-connector");
          d && d.classList.add("ng-slot-connector--highlight");
        } else {
          const d = {
            source: this._connectionDrag.sourceSlot,
            target: c,
            valid: !0
            // Assume valid initially
          };
          (c.node === this._connectionDrag.sourceSlot.node || c.type === this._connectionDrag.sourceSlot.type) && (d.valid = !1), this.emit("connection:validate", d), this._connectionDrag.isValid = d.valid;
          const u = c.element.querySelector(".ng-slot-connector");
          u && (d.valid ? u.classList.add("ng-slot-connector--highlight") : u.classList.add("ng-slot-connector--invalid"));
        }
      this._connectionDrag.targetSlot = c;
    }
  }
  /**
   * End connection drag
   */
  _endConnectionDrag(t) {
    if (!this._connectionDrag) return;
    const e = this._connectionDrag.targetSlot;
    if (e) {
      const s = e.element.querySelector(".ng-slot-connector");
      s && s.classList.remove("ng-slot-connector--invalid", "ng-slot-connector--highlight");
    }
    if (e && this._connectionDrag.isValid) {
      const s = this._connectionDrag.sourceSlot;
      let i, n;
      if (s.type === "output" && e.type === "input" ? (i = s, n = e) : s.type === "input" && e.type === "output" && (i = e, n = s), i && n) {
        if (n.connections.size >= n.maxConnections) {
          const o = n.connections.size - n.maxConnections + 1, a = Array.from(n.connections);
          for (let h = 0; h < o; h++)
            this.disconnect(a[h].id);
        }
        if (i.connections.size >= i.maxConnections) {
          const o = i.connections.size - i.maxConnections + 1, a = Array.from(i.connections);
          for (let h = 0; h < o; h++)
            this.disconnect(a[h].id);
        }
        this.connect(i, n);
      }
    }
    this._tempPath && (this._tempPath.remove(), this._tempPath = null), this._connectionDrag = null;
  }
  /**
   * Find a slot by ID across all nodes
   */
  _findSlotById(t) {
    for (const e of this.nodes.values()) {
      if (e.inputSlots.has(t))
        return e.inputSlots.get(t);
      if (e.outputSlots.has(t))
        return e.outputSlots.get(t);
    }
    return null;
  }
  /**
   * Add a node to the graph
   * @param {object} config - Node configuration
   * @returns {Node} Created node
   */
  addNode(t) {
    const e = new M({
      ...t,
      graph: this
    });
    return this.nodes.set(e.id, e), this.nodesLayer.appendChild(e.element), this.emit("node:add", e), e;
  }
  /**
   * Remove a node from the graph
   * @param {string} nodeId - Node ID
   */
  removeNode(t) {
    const e = this.nodes.get(t);
    e && (this.selection.removeFromSelection(e), e.destroy(), this.nodes.delete(t), this.emit("node:remove", t));
  }
  /**
   * Get a node by ID
   * @param {string} nodeId - Node ID
   * @returns {Node|undefined}
   */
  getNode(t) {
    return this.nodes.get(t);
  }
  /**
   * Connect two slots
   * @param {Slot} outputSlot - Output slot
   * @param {Slot} inputSlot - Input slot
   * @param {object} style - Connection style
   * @returns {Connection} Created connection
   */
  connect(t, e, s = {}) {
    if (t.type !== "output" || e.type !== "input")
      return console.warn("NodeGraph: Invalid connection - must be output to input"), null;
    for (const n of this.connections.values())
      if (n.outputSlot === t && n.inputSlot === e)
        return n;
    const i = new N({
      outputSlot: t,
      inputSlot: e,
      svgLayer: this.connectionsGroup,
      style: s
    });
    return t.connections.add(i), e.connections.add(i), this.connections.set(i.id, i), this.emit("connection:create", i), i;
  }
  /**
  * Create a symbolic (dashed) connection between two nodes
  * @param {Node} fromNode - Source node
  * @param {Node} toNode - Target node
  * @param {object} style - Connection style
  * @returns {Connection} Created connection
  */
  connectSymbolic(t, e, s = {}) {
    const i = new N({
      outputSlot: t,
      // Using node as slot
      inputSlot: e,
      // Using node as slot
      svgLayer: this.connectionsGroup,
      style: { dashed: !0, ...s }
    });
    return this.connections.set(i.id, i), t.connections && t.connections.add(i), e.connections && e.connections.add(i), this.emit("connection:create", i), i;
  }
  /**
   * Disconnect (remove) a connection
   * @param {string} connectionId - Connection ID
   */
  disconnect(t) {
    const e = this.connections.get(t);
    e && (e.destroy(), this.connections.delete(t), this.emit("connection:remove", t));
  }
  /**
   * Remove all symbolic connections between two nodes
   * @param {Node} nodeA 
   * @param {Node} nodeB 
   */
  disconnectSymbolic(t, e) {
    const s = [];
    this.connections.forEach((i) => {
      const n = i.outputSlot === t && i.inputSlot === e, o = i.outputSlot === e && i.inputSlot === t;
      (n || o) && s.push(i.id);
    }), s.forEach((i) => this.disconnect(i));
  }
  /**
   * Add a group to the graph
   * @param {object} config - Group configuration
   * @returns {Group} Created group
   */
  addGroup(t) {
    const e = new A({
      ...t,
      graph: this
    });
    return this.groups.set(e.id, e), this.groupsLayer.appendChild(e.element), this.emit("group:add", e), e;
  }
  /**
   * Remove a group from the graph
   * @param {string} groupId - Group ID
   */
  removeGroup(t) {
    const e = this.groups.get(t);
    e && (e.destroy(), this.groups.delete(t), this.emit("group:remove", t));
  }
  /**
   * Clear all nodes, connections, and groups
   */
  clear() {
    this.connections.forEach((t) => t.destroy()), this.connections.clear(), this.nodes.forEach((t) => t.destroy()), this.nodes.clear(), this.groups.forEach((t) => t.destroy()), this.groups.clear(), this.selection.clearSelection(), this.emit("graph:clear");
  }
  /**
   * Serialize the graph state
   * @returns {object} Serialized data
   */
  serialize() {
    return {
      nodes: Array.from(this.nodes.values()).map((t) => t.serialize()),
      connections: Array.from(this.connections.values()).map((t) => t.serialize()),
      groups: Array.from(this.groups.values()).map((t) => t.serialize()),
      viewport: this.viewport.getState()
    };
  }
  /**
   * Deserialize and restore graph state
   * @param {object} data - Serialized data
   */
  deserialize(t) {
    this.clear(), t.nodes && t.nodes.forEach((e) => {
      this.addNode(e);
    }), t.connections && t.connections.forEach((e) => {
      const s = this.nodes.get(e.outputNodeId), i = this.nodes.get(e.inputNodeId);
      if (s && i) {
        const n = s.getOutput(e.outputSlotId), o = i.getInput(e.inputSlotId);
        n && o && this.connect(n, o, e.style);
      }
    }), t.groups && t.groups.forEach((e) => {
      const s = this.addGroup(e);
      e.nodeIds && e.nodeIds.forEach((i) => {
        const n = this.nodes.get(i);
        n && s.addNode(n);
      });
    }), t.viewport && this.viewport.setState(t.viewport), this.emit("graph:deserialize", t);
  }
  /**
   * Smartly connect this node to nearby compatible nodes
   * @param {Node} node - The source node
   * @returns {number} Number of connections made
   */
  autoConnect(t) {
    const e = Math.min(t.element.offsetWidth, t.element.offsetHeight) / 2, s = t.getBounds();
    let i = 0;
    return this.nodes.forEach((n) => {
      if (n === t) return;
      const o = n.getBounds(), a = Math.max(0, Math.abs(s.x + s.width / 2 - (o.x + o.width / 2)) - (s.width + o.width) / 2), h = Math.max(0, Math.abs(s.y + s.height / 2 - (o.y + o.height / 2)) - (s.height + o.height) / 2);
      if (Math.sqrt(a * a + h * h) < e) {
        let p = null, c = 1 / 0;
        if (t.outputSlots.forEach((l) => {
          n.inputSlots.forEach((d) => {
            const u = this._getSlotDistance(l, d);
            u < c && (c = u, p = { from: l, to: d });
          });
        }), n.outputSlots.forEach((l) => {
          t.inputSlots.forEach((d) => {
            const u = this._getSlotDistance(l, d);
            u < c && (c = u, p = { from: l, to: d });
          });
        }), p) {
          const { from: l, to: d } = p;
          d.connections.size >= d.maxConnections && Array.from(d.connections).forEach((u) => this.disconnect(u.id)), this.connect(l, d) && i++;
        }
      }
    }), i;
  }
  /**
   * Calculate screen distance between two slots
   */
  _getSlotDistance(t, e) {
    const s = t.getConnectionPoint(), i = e.getConnectionPoint(), n = s.x - i.x, o = s.y - i.y;
    return Math.sqrt(n * n + o * o);
  }
  /**
   * Auto-arrange nodes using Island Component Packing (16:9 Aspect Ratio)
   */
  arrange() {
    const t = Array.from(this.nodes.values());
    if (t.length === 0) return;
    const e = 250, s = 120, i = 80, n = 100, o = 100, a = /* @__PURE__ */ new Set(), h = [];
    t.forEach((m) => {
      if (a.has(m.id)) return;
      const f = [], y = [m];
      a.add(m.id), f.push(m);
      let E = 0;
      for (; E < y.length; ) {
        const b = y[E++], _ = /* @__PURE__ */ new Set();
        b.inputSlots.forEach((v) => v.connections.forEach((x) => x.outputSlot.node && _.add(x.outputSlot.node))), b.outputSlots.forEach((v) => v.connections.forEach((x) => x.inputSlot.node && _.add(x.inputSlot.node))), _.forEach((v) => {
          a.has(v.id) || (a.add(v.id), f.push(v), y.push(v));
        });
      }
      h.push(this._layoutIsland(f, e, s));
    });
    let r = 0;
    h.forEach((m) => {
      r += (m.width + i) * (m.height + i);
    });
    const p = 16 / 9, c = Math.max(1e3, Math.sqrt(r * p));
    let l = 0, d = 0, u = 0;
    h.sort((m, f) => f.height - m.height), h.forEach((m) => {
      l + m.width > c && l > 0 && (l = 0, d += u + i, u = 0);
      const f = n + l, y = o + d;
      m.placements.forEach((E) => {
        E.node.moveTo(f + E.x, y + E.y);
      }), l += m.width + i, u = Math.max(u, m.height);
    }), this.emit("graph:arrange");
  }
  /**
   * Helper to layout a single connected component (Island)
   * Returns { width, height, placements: [{node, x, y}] }
   */
  _layoutIsland(t, e, s) {
    if (t.length === 0) return { width: 0, height: 0, placements: [] };
    const i = /* @__PURE__ */ new Map(), n = t.filter((l) => {
      let d = !1;
      return l.inputSlots.forEach((u) => {
        u.connections.forEach((m) => {
          t.includes(m.outputSlot.node) && (d = !0);
        });
      }), !d;
    });
    n.length === 0 && n.push(t[0]);
    const o = [], a = /* @__PURE__ */ new Set();
    for (n.forEach((l) => {
      i.set(l.id, 0), o.push(l), a.add(l.id);
    }); o.length > 0; ) {
      const l = o.shift(), d = i.get(l.id);
      l.outputSlots.forEach((u) => {
        u.connections.forEach((m) => {
          const f = m.inputSlot.node;
          t.includes(f) && (!a.has(f.id) || i.get(f.id) < d + 1) && (i.set(f.id, d + 1), a.add(f.id), o.push(f));
        });
      });
    }
    t.forEach((l) => {
      i.has(l.id) || i.set(l.id, 0);
    });
    const h = [];
    let r = 0;
    i.forEach((l, d) => {
      h[l] || (h[l] = []), h[l].push(this.nodes.get(d)), l > r && (r = l);
    });
    const p = [];
    let c = 0;
    return h.forEach((l) => {
      if (!l) return;
      l.sort((u, m) => u.position.y - m.position.y);
      let d = 0;
      l.forEach((u) => {
        const m = u.getBounds();
        d += (m.height || 100) + s;
      }), d > c && (c = d);
    }), c > 0 && (c -= s), h.forEach((l, d) => {
      if (!l) return;
      let u = 0;
      l.forEach((m) => {
        const y = m.getBounds().height || 100;
        p.push({
          node: m,
          x: d * e,
          y: u
        }), u += y + s;
      });
    }), {
      width: (r + 1) * e,
      // Approx width
      height: c,
      placements: p
    };
  }
  /**
   * Destroy the graph
   */
  destroy() {
    var t, e, s, i;
    this.clear(), (t = this.grid) == null || t.destroy(), (e = this.contextMenu) == null || e.destroy(), (s = this.viewportElement) == null || s.remove(), (i = this.container) == null || i.classList.remove("ng-container"), this.emit("graph:destroy");
  }
}
export {
  R as ClipboardManager,
  N as Connection,
  B as ContextMenuManager,
  I as EventEmitter,
  $ as GridManager,
  A as Group,
  M as Node,
  k as NodeGraph,
  T as SelectionManager,
  L as Slot,
  C as SlotOrientation,
  w as SlotShape,
  D as ViewportManager,
  P as calculateBezierPath,
  X as debounce,
  G as getBezierMidpoint,
  z as throttle,
  S as uid
};
