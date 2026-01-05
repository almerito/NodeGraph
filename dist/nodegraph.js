class C {
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
function L(c, t) {
  let e;
  return function(...s) {
    e || (c.apply(this, s), e = !0, setTimeout(() => e = !1, t));
  };
}
function D(c, t) {
  let e;
  return function(...s) {
    clearTimeout(e), e = setTimeout(() => c.apply(this, s), t);
  };
}
function g(c = "") {
  const t = Date.now().toString(36), e = Math.random().toString(36).substring(2, 9);
  return c ? `${c}-${t}-${e}` : `${t}-${e}`;
}
const f = {
  CIRCLE: "circle",
  SQUARE: "square",
  ARROW: "arrow",
  DIAMOND: "diamond",
  CUSTOM: "custom"
}, v = {
  HORIZONTAL: "horizontal",
  VERTICAL: "vertical"
};
class b {
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
    this.id = t.id || g("slot"), this.node = t.node, this.type = t.type, this.label = t.label || "", this.shape = t.shape || f.CIRCLE, this.side = t.side || (t.type === "input" ? "left" : "right"), this.align = t.align, this.edge = t.edge || !1, t.orientation ? this.orientation = t.orientation : this.orientation = this.side === "top" || this.side === "bottom" ? v.VERTICAL : v.HORIZONTAL, this.color = t.color || "#667eea", this.size = t.size || 12, this.clickAreaSize = t.clickAreaSize || this.size + 10, this.highlightOnHover = t.highlightOnHover !== !1, this.customIcon = t.customIcon || null, this.connections = /* @__PURE__ */ new Set(), this._createElement(), this._bindEvents();
  }
  /**
   * Create the slot DOM element
   */
  _createElement() {
    this.element = document.createElement("div"), this.element.className = `ng-slot ng-slot--${this.side} ng-slot--${this.orientation}`, this.edge && this.element.classList.add("ng-slot--edge"), this.element.dataset.slotId = this.id, this.element.dataset.slotType = this.type, this.element.style.setProperty("--ng-slot-size", `${this.size}px`), this.element.style.setProperty("--ng-slot-color", this.color), this.connectorElement = document.createElement("div"), this.connectorElement.className = `ng-slot-connector ng-slot-connector--${this.shape}`, this.clickAreaElement = document.createElement("div"), this.clickAreaElement.className = "ng-slot-click-area", this.clickAreaElement.style.width = `${this.clickAreaSize}px`, this.clickAreaElement.style.height = `${this.clickAreaSize}px`, this.label && (this.labelElement = document.createElement("span"), this.labelElement.className = "ng-slot-label", this.labelElement.textContent = this.label), this.shape === f.CUSTOM && this.customIcon && (this.connectorElement.innerHTML = this.customIcon), this.connectorElement.appendChild(this.clickAreaElement), this.element.appendChild(this.connectorElement), this.labelElement && this.element.appendChild(this.labelElement);
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
    const t = this.connectorElement.getBoundingClientRect(), e = this.node.element.getBoundingClientRect(), s = t.left - e.left + t.width / 2, i = t.top - e.top + t.height / 2;
    return {
      x: this.node.position.x + s,
      y: this.node.position.y + i
    };
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
class N {
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
    this.id = t.id || g("node"), this.graph = t.graph, this.position = { x: ((e = t.position) == null ? void 0 : e.x) || 0, y: ((s = t.position) == null ? void 0 : s.y) || 0 }, this.draggable = t.draggable !== !1, this.selected = !1, this.resizable = t.resizable || !1, this.inputSlots = /* @__PURE__ */ new Map(), this.outputSlots = /* @__PURE__ */ new Map(), this.connections = /* @__PURE__ */ new Set(), this._createElement(t), this._createSlots(t.inputs, t.outputs), this._bindEvents(), this._updatePosition();
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
    const s = /* @__PURE__ */ new Map(), i = (n) => {
      var h;
      if (n.target.closest(".ng-slot-click-area") || n.target.closest("input") || n.target.closest("button") || n.target.closest("select") || n.target.closest("textarea") || n.button !== 0 || (n.stopPropagation(), this.element.dispatchEvent(new CustomEvent("node:select", {
        bubbles: !0,
        detail: { node: this, event: n }
      })), !this.draggable)) return;
      t = !0, e = { x: n.clientX, y: n.clientY };
      const l = (h = this.graph) == null ? void 0 : h.selection;
      s.clear(), l && l.isSelected(this) ? l.getSelectedNodes().forEach((d) => {
        s.set(d, { ...d.position }), d.element.classList.add("ng-node--dragging");
      }) : (s.set(this, { ...this.position }), this.element.classList.add("ng-node--dragging")), document.addEventListener("mousemove", a), document.addEventListener("mouseup", o);
    }, a = (n) => {
      var r, p;
      if (!t) return;
      const l = ((p = (r = this.graph) == null ? void 0 : r.viewport) == null ? void 0 : p.scale) || 1, h = (n.clientX - e.x) / l, d = (n.clientY - e.y) / l;
      s.forEach((u, m) => {
        m.moveTo(u.x + h, u.y + d);
      }), this.element.dispatchEvent(new CustomEvent("node:drag", {
        bubbles: !0,
        detail: { node: this }
      }));
    }, o = () => {
      var n, l, h;
      if (t) {
        if (t = !1, s.forEach((d, r) => {
          r.element.classList.remove("ng-node--dragging");
        }), (l = (n = this.graph) == null ? void 0 : n.options) != null && l.snapToGrid) {
          const d = ((h = this.graph.options.grid) == null ? void 0 : h.step) || 20;
          s.forEach((r, p) => {
            p.moveTo(
              Math.round(p.position.x / d) * d,
              Math.round(p.position.y / d) * d
            );
          });
        }
        this.element.dispatchEvent(new CustomEvent("node:dragend", {
          bubbles: !0,
          detail: { node: this }
        })), document.removeEventListener("mousemove", a), document.removeEventListener("mouseup", o), s.clear();
      }
    };
    if (this.element.addEventListener("mousedown", i), this.resizable && this.resizeHandle) {
      let n = !1, l = { width: 0, height: 0 }, h = { x: 0, y: 0 };
      this.resizeHandle.addEventListener("mousedown", (p) => {
        if (p.stopPropagation(), p.button !== 0) return;
        n = !0, h = { x: p.clientX, y: p.clientY };
        const u = this.element.getBoundingClientRect();
        l = { width: u.width, height: u.height }, this.element.style.width = `${u.width}px`, this.element.style.height = `${u.height}px`, this.element.classList.add("ng-node--resizing"), document.addEventListener("mousemove", d), document.addEventListener("mouseup", r);
      });
      const d = (p) => {
        var y, E;
        if (!n) return;
        const u = ((E = (y = this.graph) == null ? void 0 : y.viewport) == null ? void 0 : E.scale) || 1, m = (p.clientX - h.x) / u, x = (p.clientY - h.y) / u, S = Math.max(100, l.width + m), w = Math.max(50, l.height + x);
        this.element.style.width = `${S}px`, this.element.style.height = `${w}px`, this._updateConnections();
      }, r = () => {
        n = !1, this.element.classList.remove("ng-node--resizing"), document.removeEventListener("mousemove", d), document.removeEventListener("mouseup", r);
      };
    }
    this.element.addEventListener("contextmenu", (n) => {
      n.preventDefault(), n.stopPropagation(), this.element.dispatchEvent(new CustomEvent("node:contextmenu", {
        bubbles: !0,
        detail: { node: this, event: n }
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
    const e = new b({
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
    const e = new b({
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
function z(c, t, e = "horizontal", s = "horizontal") {
  const i = t.x - c.x, a = t.y - c.y;
  let o, n, l, h;
  const d = Math.min(Math.abs(i) / 2, Math.abs(a) / 2, 100), p = Math.max(d, 50);
  return e === "horizontal" ? (o = c.x + p, n = c.y) : (o = c.x, n = c.y + p), s === "horizontal" ? (l = t.x - p, h = t.y) : (l = t.x, h = t.y - p), `M ${c.x} ${c.y} C ${o} ${n}, ${l} ${h}, ${t.x} ${t.y}`;
}
function k(c, t) {
  return {
    x: (c.x + t.x) / 2,
    y: (c.y + t.y) / 2
  };
}
class _ {
  /**
   * @param {object} config - Connection configuration
   * @param {Slot} config.outputSlot - Source slot (output)
   * @param {Slot} config.inputSlot - Target slot (input)
   * @param {SVGElement} config.svgLayer - SVG layer to draw on
   * @param {object} config.style - Connection style options
   */
  constructor(t) {
    var e, s, i;
    this.id = t.id || g("conn"), this.outputSlot = t.outputSlot, this.inputSlot = t.inputSlot, this.svgLayer = t.svgLayer, this.style = {
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
    this.pathElement.addEventListener("click", (t) => {
      t.stopPropagation(), this.select();
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
    const t = this.outputSlot.getConnectionPoint(), e = this.inputSlot.getConnectionPoint(), s = this.outputSlot.orientation || "horizontal", i = this.inputSlot.orientation || "horizontal", a = z(t, e, s, i);
    this.pathElement.setAttribute("d", a);
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
class I {
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
    var e, s, i, a;
    this.id = t.id || g("group"), this.graph = t.graph, this.label = t.label || "Group", this.color = t.color || "rgba(102, 126, 234, 0.1)", this.position = { x: ((e = t.position) == null ? void 0 : e.x) || 0, y: ((s = t.position) == null ? void 0 : s.y) || 0 }, this.size = { width: ((i = t.size) == null ? void 0 : i.width) || 200, height: ((a = t.size) == null ? void 0 : a.height) || 150 }, this.padding = t.padding || 20, this.nodes = /* @__PURE__ */ new Set(), this._createElement(), this._bindEvents(), this._updateStyle();
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
    let t = !1, e = !1, s = { x: 0, y: 0 }, i = { x: 0, y: 0 }, a = { width: 0, height: 0 };
    this.headerElement.addEventListener("mousedown", (o) => {
      if (o.button !== 0) return;
      o.stopPropagation(), t = !0, s = { x: o.clientX, y: o.clientY }, i = { ...this.position };
      const n = [], l = this._getGraphRect();
      this.graph.nodes.forEach((h) => {
        const d = h.getBounds();
        this._rectsIntersect(l, d) && n.push(h);
      }), this.collidingNodes = n, this.element.classList.add("ng-group--dragging");
    }), this.resizeHandle.addEventListener("mousedown", (o) => {
      o.button === 0 && (o.stopPropagation(), e = !0, s = { x: o.clientX, y: o.clientY }, a = { ...this.size }, this.element.classList.add("ng-group--resizing"));
    }), document.addEventListener("mousemove", (o) => {
      var l, h;
      const n = ((h = (l = this.graph) == null ? void 0 : l.viewport) == null ? void 0 : h.scale) || 1;
      if (t) {
        const d = (o.clientX - s.x) / n, r = (o.clientY - s.y) / n;
        this.position.x = i.x + d, this.position.y = i.y + r, this._updatePosition(), this.collidingNodes && (this.collidingNodes.forEach((p) => {
          p.moveBy(d - (this.lastDx || 0), r - (this.lastDy || 0));
        }), this.lastDx = d, this.lastDy = r);
      }
      if (e) {
        const d = (o.clientX - s.x) / n, r = (o.clientY - s.y) / n;
        this.size.width = Math.max(100, a.width + d), this.size.height = Math.max(60, a.height + r), this._updateSize(), a = { ...this.size }, s = { x: o.clientX, y: o.clientY };
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
    }, i = (a) => {
      a.key === "Enter" && (a.preventDefault(), s()), a.key === "Escape" && (this.labelElement.textContent = this.label, s());
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
    this.nodes.forEach((a) => {
      const o = a.getBounds();
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
    const s = t.left + t.width, i = t.top + t.height, a = e.x + e.width, o = e.y + e.height;
    return !(t.left > a || s < e.x || t.top > o || i < e.y);
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
class P {
  /**
   * @param {object} config - Configuration
   * @param {HTMLElement} config.container - Container element
   * @param {HTMLElement} config.content - Content element to transform
   * @param {object} config.options - Zoom/pan options
   */
  constructor(t) {
    var e, s, i, a;
    this.container = t.container, this.content = t.content, this.options = {
      minZoom: ((e = t.options) == null ? void 0 : e.minZoom) || 0.1,
      maxZoom: ((s = t.options) == null ? void 0 : s.maxZoom) || 4,
      zoomSpeed: ((i = t.options) == null ? void 0 : i.zoomSpeed) || 0.1,
      panButton: ((a = t.options) == null ? void 0 : a.panButton) || 1,
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
    }), document.addEventListener("mousemove", L((t) => {
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
    const a = i / this.scale;
    this.panX = t - (t - this.panX) * a, this.panY = e - (e - this.panY) * a, this.scale = i, this._applyTransform();
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
class A {
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
    const e = this.graph.viewport.screenToGraph(t.clientX, t.clientY), s = Math.min(this._boxStart.x, e.x), i = Math.min(this._boxStart.y, e.y), a = Math.abs(e.x - this._boxStart.x), o = Math.abs(e.y - this._boxStart.y);
    this._boxElement.style.left = `${s}px`, this._boxElement.style.top = `${i}px`, this._boxElement.style.width = `${a}px`, this._boxElement.style.height = `${o}px`;
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
    this.selectedNodes.has(t) && (this.selectedNodes.delete(t), t.deselect(), this.graph.emit("selection:change", { nodes: Array.from(this.selectedNodes) }));
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
   */
  selectConnection(t) {
    this.clearConnectionSelection(), this.selectedConnections.add(t), t.select();
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
    this.selectedNodes.forEach((t) => t.deselect()), this.selectedNodes.clear(), this.clearConnectionSelection(), this.graph.emit("selection:change", { nodes: [] });
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
    }), this.selectedNodes.clear(), this.graph.emit("selection:change", { nodes: [] });
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
class M {
  /**
   * @param {object} config - Configuration
   * @param {SVGElement} config.svgLayer - SVG layer to draw on
   * @param {object} config.options - Grid options
   */
  constructor(t) {
    var e, s, i, a, o;
    this.svgLayer = t.svgLayer, this.options = {
      enabled: ((e = t.options) == null ? void 0 : e.enabled) !== !1,
      step: ((s = t.options) == null ? void 0 : s.step) || 20,
      color: ((i = t.options) == null ? void 0 : i.color) || "rgba(255,255,255,0.05)",
      majorLineEvery: ((a = t.options) == null ? void 0 : a.majorLineEvery) || 5,
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
    for (let a = 0; a <= this.options.majorLineEvery; a++) {
      const o = a * e, n = a * e, l = document.createElementNS("http://www.w3.org/2000/svg", "line");
      l.setAttribute("x1", o), l.setAttribute("y1", 0), l.setAttribute("x2", o), l.setAttribute("y2", s), l.setAttribute("stroke", a === 0 ? this.options.majorColor : this.options.color), l.setAttribute("stroke-width", a === 0 ? 1 : 0.5), this._pattern.appendChild(l);
      const h = document.createElementNS("http://www.w3.org/2000/svg", "line");
      h.setAttribute("x1", 0), h.setAttribute("y1", n), h.setAttribute("x2", s), h.setAttribute("y2", n), h.setAttribute("stroke", a === 0 ? this.options.majorColor : this.options.color), h.setAttribute("stroke-width", a === 0 ? 1 : 0.5), this._pattern.appendChild(h);
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
class T {
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
          const i = s.target.value, a = parseInt(i.slice(1, 3), 16), o = parseInt(i.slice(3, 5), 16), n = parseInt(i.slice(5, 7), 16);
          t.group.setColor(`rgba(${a}, ${o}, ${n}, 0.1)`);
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
    this.menuItems[t] || (this.menuItems[t] = []), this.menuItems[t].push(e);
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
    const a = this.menuItems[t];
    if (!a || a.length === 0) return;
    this.menuElement = document.createElement("div"), this.menuElement.className = "ng-context-menu", a.forEach((n) => {
      if (n.type === "separator") {
        const r = document.createElement("div");
        r.className = "ng-context-menu-separator", this.menuElement.appendChild(r);
        return;
      }
      const l = n.enabled ? n.enabled(i) : !0, h = document.createElement("div");
      if (h.className = "ng-context-menu-item", n.className && h.classList.add(n.className), l || h.classList.add("ng-context-menu-item--disabled"), n.icon) {
        const r = document.createElement("span");
        r.className = "ng-context-menu-icon", r.textContent = n.icon, h.appendChild(r);
      }
      const d = document.createElement("span");
      if (d.className = "ng-context-menu-label", d.textContent = n.label, h.appendChild(d), n.shortcut) {
        const r = document.createElement("span");
        r.className = "ng-context-menu-shortcut", r.textContent = n.shortcut, h.appendChild(r);
      }
      l && n.action && h.addEventListener("click", (r) => {
        r.stopPropagation(), n.action(i), this.close();
      }), this.menuElement.appendChild(h);
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
class $ {
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
    var n;
    const t = ((n = this.graph.selection) == null ? void 0 : n.getSelectedNodes()) || [];
    if (t.length === 0) return;
    let e = 1 / 0, s = 1 / 0;
    t.forEach((l) => {
      e = Math.min(e, l.position.x), s = Math.min(s, l.position.y);
    });
    const i = t.map((l) => {
      const h = l.serialize();
      return h.position.x -= e, h.position.y -= s, h;
    }), a = new Set(t.map((l) => l.id)), o = [];
    this.graph.connections.forEach((l) => {
      a.has(l.outputSlot.node.id) && a.has(l.inputSlot.node.id) && o.push(l.serialize());
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
    var a, o;
    if (!this._clipboardData) return;
    let t, e;
    if (this.graph.lastMousePos) {
      const n = this.graph.viewport.screenToGraph(this.graph.lastMousePos.x, this.graph.lastMousePos.y);
      t = n.x, e = n.y;
    } else {
      const n = ((a = this.graph.viewport) == null ? void 0 : a.getState()) || { panX: 0, panY: 0, scale: 1 }, l = this.graph.container.getBoundingClientRect();
      t = (l.width / 2 - n.panX) / n.scale, e = (l.height / 2 - n.panY) / n.scale;
    }
    const s = /* @__PURE__ */ new Map();
    (o = this.graph.selection) == null || o.clearSelection();
    const i = [];
    this._clipboardData.nodes.forEach((n) => {
      var d;
      const l = n.id, h = this.graph.addNode({
        ...n,
        id: void 0,
        // Let it generate new ID
        position: {
          x: t + n.position.x,
          y: e + n.position.y
        }
      });
      s.set(l, h.id), i.push(h), (d = this.graph.selection) == null || d.addToSelection(h);
    }), this._clipboardData.connections.forEach((n) => {
      const l = s.get(n.outputNodeId), h = s.get(n.inputNodeId);
      if (l && h) {
        const d = this.graph.getNode(l), r = this.graph.getNode(h);
        if (d && r) {
          const p = d.getOutput(n.outputSlotId), u = r.getInput(n.inputSlotId);
          p && u && this.graph.connect(p, u, n.style);
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
class B extends C {
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
    this.viewport = new P({
      container: this.container,
      content: this.viewportElement,
      options: this.options.zoom
    }), this.selection = new A(this), this.grid = new M({
      svgLayer: this.svgLayer,
      options: this.options.grid
    }), this.contextMenu = new T(this), this.clipboard = new $(this);
  }
  /**
   * Bind global event listeners
   */
  _bindEvents() {
    this.nodesLayer.addEventListener("node:select", (t) => {
      const { node: e, event: s } = t.detail;
      s.ctrlKey || s.metaKey ? this.selection.toggleSelection(e) : this.selection.isSelected(e) || this.selection.selectNode(e), this.emit("node:select", e);
    }), this.nodesLayer.addEventListener("node:drag", (t) => {
      const { node: e } = t.detail;
      this.selection.isSelected(e) && this.selection.selectedNodes.size > 1, this.emit("node:drag", e);
    }), this.nodesLayer.addEventListener("node:dragend", (t) => {
      this.emit("node:dragend", t.detail.node);
    }), this.nodesLayer.addEventListener("node:contextmenu", (t) => {
      const { node: e, event: s } = t.detail;
      this.selection.isSelected(e) || this.selection.selectNode(e), this.contextMenu.open("node", s.clientX, s.clientY, { node: e });
    }), this.nodesLayer.addEventListener("slot:dragstart", (t) => {
      const { slot: e, event: s } = t.detail;
      this._startConnectionDrag(e, s);
    }), this.container.addEventListener("contextmenu", (t) => {
      if (t.target === this.container || t.target === this.viewportElement || t.target === this.nodesLayer || t.target.classList.contains("ng-viewport")) {
        t.preventDefault();
        const e = this.viewport.screenToGraph(t.clientX, t.clientY);
        this.contextMenu.open("canvas", t.clientX, t.clientY, { position: e });
      }
    }), this.groupsLayer.addEventListener("group:contextmenu", (t) => {
      const { group: e, event: s } = t.detail;
      this.contextMenu.open("group", s.clientX, s.clientY, { group: e });
    }), document.addEventListener("mousemove", (t) => {
      this.lastMousePos = { x: t.clientX, y: t.clientY }, this._connectionDrag && this._updateConnectionDrag(t);
    }), document.addEventListener("mouseup", (t) => {
      this._connectionDrag && this._endConnectionDrag(t);
    });
  }
  /**
   * Start dragging a connection from a slot
   */
  _startConnectionDrag(t, e) {
    this._connectionDrag = {
      sourceSlot: t,
      startPos: t.getConnectionPoint()
    }, this._tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path"), this._tempPath.classList.add("ng-connection", "ng-connection--temp"), this._tempPath.setAttribute("stroke", t.color), this._tempPath.setAttribute("stroke-width", "2"), this._tempPath.setAttribute("fill", "none"), this._tempPath.setAttribute("stroke-dasharray", "5,5"), this.svgLayer.appendChild(this._tempPath), this._updateConnectionDrag(e);
  }
  /**
   * Update connection drag path
   */
  _updateConnectionDrag(t) {
    if (!this._connectionDrag || !this._tempPath) return;
    const e = this.viewport.screenToGraph(t.clientX, t.clientY), s = this._connectionDrag.startPos, i = this._connectionDrag.sourceSlot.orientation, a = e.x - s.x, o = Math.max(Math.abs(a) / 2, 50);
    let n;
    i === "horizontal" ? n = `M ${s.x} ${s.y} C ${s.x + o} ${s.y}, ${e.x - o} ${e.y}, ${e.x} ${e.y}` : n = `M ${s.x} ${s.y} C ${s.x} ${s.y + o}, ${e.x} ${e.y - o}, ${e.x} ${e.y}`, this._tempPath.setAttribute("d", n);
    const l = document.elementFromPoint(t.clientX, t.clientY), h = l == null ? void 0 : l.closest(".ng-slot-click-area"), d = h == null ? void 0 : h.closest(".ng-slot");
    let r = null;
    if (d) {
      const u = d.dataset.slotId;
      r = this._findSlotById(u);
    }
    const p = this._connectionDrag.targetSlot;
    if (r !== p) {
      if (p) {
        const u = p.element.querySelector(".ng-slot-connector");
        u && u.classList.remove("ng-slot-connector--invalid", "ng-slot-connector--highlight");
      }
      if (r)
        if (r === this._connectionDrag.sourceSlot) {
          const u = r.element.querySelector(".ng-slot-connector");
          u && u.classList.add("ng-slot-connector--highlight");
        } else {
          const u = {
            source: this._connectionDrag.sourceSlot,
            target: r,
            valid: !0
            // Assume valid initially
          };
          (r.node === this._connectionDrag.sourceSlot.node || r.type === this._connectionDrag.sourceSlot.type) && (u.valid = !1), this.emit("connection:validate", u), this._connectionDrag.isValid = u.valid;
          const m = r.element.querySelector(".ng-slot-connector");
          m && (u.valid ? m.classList.add("ng-slot-connector--highlight") : m.classList.add("ng-slot-connector--invalid"));
        }
      this._connectionDrag.targetSlot = r;
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
      s.type === "output" && e.type === "input" ? this.connect(s, e) : s.type === "input" && e.type === "output" && this.connect(e, s);
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
    const e = new N({
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
    for (const a of this.connections.values())
      if (a.outputSlot === t && a.inputSlot === e)
        return a;
    const i = new _({
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
    const i = new _({
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
   * Add a group to the graph
   * @param {object} config - Group configuration
   * @returns {Group} Created group
   */
  addGroup(t) {
    const e = new I({
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
        const a = s.getOutput(e.outputSlotId), o = i.getInput(e.inputSlotId);
        a && o && this.connect(a, o, e.style);
      }
    }), t.groups && t.groups.forEach((e) => {
      const s = this.addGroup(e);
      e.nodeIds && e.nodeIds.forEach((i) => {
        const a = this.nodes.get(i);
        a && s.addNode(a);
      });
    }), t.viewport && this.viewport.setState(t.viewport), this.emit("graph:deserialize", t);
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
  $ as ClipboardManager,
  _ as Connection,
  T as ContextMenuManager,
  C as EventEmitter,
  M as GridManager,
  I as Group,
  N as Node,
  B as NodeGraph,
  A as SelectionManager,
  b as Slot,
  v as SlotOrientation,
  f as SlotShape,
  P as ViewportManager,
  z as calculateBezierPath,
  D as debounce,
  k as getBezierMidpoint,
  L as throttle,
  g as uid
};
