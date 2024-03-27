class CanvasManager {
  constructor() {
    this.nodeDOM = genericElem("canvas");
    this.nodeCtx = this.nodeDOM.getContext("2d");
    tabinator.tabs[4].appendChild(this.nodeDOM);
    this.nodes = {};

    this.cursorDOM = genericElem("canvas");
    this.cursorCtx = this.cursorDOM.getContext("2d");
    tabinator.tabs[4].appendChild(this.cursorDOM);

    // Collection of coordinates measured in pixels
    this.px = {
      mouseX: 0,
      mouseY: 0,
      top: 0, // constant
      left: 0 // constant
    }

    // Collection of coordinates measured in Stored Units
    this.su = {
      mouseX: 0,
      mouseY: 0,
      top: 0,
      left: 0
    }

    this.pixelsPerUnit = 1;

    this.images = {};
    for (const type of kNodeTypes) {
      const svg = document.createElement("img");
      svg.src = `svg/${type}.svg`;
      this.images[type] = svg;
    }
    for (const name of kExtraSVGs) {
      const svg = document.createElement("img");
      svg.src = `svg/${name}.svg`;
      this.images[name] = svg;
    }

    

    // resize canvas to fit screen when first visible
    tabinator.leaves[4].addEventListener("pointerup", () => {
      mgmt.canvas.onresize();
    }, {once: true})

    this.cursorDOM.addEventListener("pointermove", e => {
      this.onpointermove(e);
    });

    this.cursorDOM.addEventListener("wheel", e => {
      this.onwheel(e);
    });

    this.cursorDOM.addEventListener("contextmenu", e => e.preventDefault());
  }





  unitXToPixelX(unitX) {
    return (unitX - this.su.left) * this.pixelsPerUnit;
  }

  unitYToPixelY(unitY) {
    return (unitY - this.su.top) * this.pixelsPerUnit;
  }

  pixelXToUnitX(pixelX) {
    return (pixelX / this.pixelsPerUnit) + this.su.left;
  }
  
  pixelYToUnitY(pixelY) {
    return (pixelY / this.pixelsPerUnit) + this.su.top;
  }





  addNode(id) {
    this.nodes[id] = {
      node: mgmt.node.registry[id],
      su: { x: 0, y: 0 },
      px: { x: 0, y: 0 }
    }
  }

  drawNode(id) {
    const node = this.nodes[id];
    if (!node) return;
    if (!this.images[node.node.constructor.name]) return;
    this.nodeCtx.drawImage(
      this.images[node.node.constructor.name],
      node.px.x,
      node.px.y,
      100 * this.pixelsPerUnit,
      100 * this.pixelsPerUnit
    )
  }

  clearNode(id) {
    const node = this.nodes[id];
    if (!node) return;
    // TODO
  }

  drawAllNodes() {
    for (const id in this.nodes) this.drawNode(id);
  }

  clearAllNodes() {
    for (const id in this.nodes) this.clearNode(id);
  }





  drawCursorTracker() {
    this.cursorCtx.fillRect(
      this.px.mouseX, 
      this.px.mouseY, 
      10 * this.pixelsPerUnit, 
      10 * this.pixelsPerUnit
    );
  }

  clearCursorTracker() {
    this.cursorCtx.clearRect(
      this.px.mouseX - 1, 
      this.px.mouseY - 1, 
      (10 * this.pixelsPerUnit) + 2, 
      (10 * this.pixelsPerUnit) + 2
    );
  }





  drawCenterTracker() {
    this.nodeCtx.fillRect(
      this.unitXToPixelX(-2), 
      this.unitYToPixelY(-10), 
      this.pixelsPerUnit * 4,
      this.pixelsPerUnit * 20
    );
    this.nodeCtx.fillRect(
      this.unitXToPixelX(-10), 
      this.unitYToPixelY(-2), 
      this.pixelsPerUnit * 20,
      this.pixelsPerUnit * 4
    );
  }

  clearCenterTracker() {
    this.nodeCtx.clearRect(
      this.unitXToPixelX(-2) - 1,
      this.unitYToPixelY(-10) - 1, 
      this.pixelsPerUnit * 4 + 2,
      this.pixelsPerUnit * 20 + 2
    );
    this.nodeCtx.clearRect(
      this.unitXToPixelX(-10) - 1,
      this.unitYToPixelY(-2) - 1,
      this.pixelsPerUnit * 20 + 2,
      this.pixelsPerUnit * 4 + 2
    );
  }





  clearAll() {
    this.nodeCtx.clearRect(0, 0, this.nodeDOM.width, this.nodeDOM.height);
    this.cursorCtx.clearRect(0, 0, this.nodeDOM.width, this.nodeDOM.height);
  }

  drawAll() {
    this.drawCursorTracker();
    this.drawCenterTracker();
    this.drawAllNodes();
  }





  scrollByPixels(px, horizontal) {
    const u = px / this.pixelsPerUnit;
    if (horizontal) {
      this.su.mouseX -= u;
      this.su.left -= u;
    } else {
      this.su.mouseY += u;
      this.su.top += u;
    }
    for (const id in this.nodes) {
      const node = this.nodes[id]
      node.px.x = this.unitXToPixelX(node.su.x);
      node.px.y = this.unitYToPixelY(node.su.y);
    }
  }

  zoom(centerPixelX, centerPixelY, zoomAmount) {
    if (Math.sign(zoomAmount) === 0) return;
    const isZoomIn = Math.sign(zoomAmount) === 1;
    const change = 1 - Math.abs(zoomAmount / 1000);
    this.pixelsPerUnit = this.pixelsPerUnit * (isZoomIn ? change : 1/change); 

    // keep the mouse in the same position as before
    const newMouseX = this.pixelXToUnitX(centerPixelX);
    const newMouseY = this.pixelYToUnitY(centerPixelY);
    this.su.left += this.su.mouseX - newMouseX;
    this.su.top += this.su.mouseY - newMouseY;

    for (const id in this.nodes) {
      const node = this.nodes[id]
      node.px.x = this.unitXToPixelX(node.su.x);
      node.px.y = this.unitYToPixelY(node.su.y);
    }
  }
  
  onresize() {
    this.clearAll();
    const parentRect = this.nodeDOM.parentElement.getBoundingClientRect();
    this.nodeDOM.height = parentRect.height + 10;
    this.nodeDOM.width = parentRect.width + 10;
    this.cursorDOM.height = parentRect.height + 10;
    this.cursorDOM.width = parentRect.width + 10;
    this.drawAll();
  }

  onpointermove(e) {
    this.clearCursorTracker();

    this.px.mouseX = e.offsetX;
    this.px.mouseY = e.offsetY;
    this.su.mouseX = this.pixelXToUnitX(e.offsetX);
    this.su.mouseY = this.pixelYToUnitY(e.offsetY);

    this.drawCursorTracker();
  }

  onwheel(e) {
    this.clearAll();

    if (e.ctrlKey) {
      // Zoom
      e.preventDefault();
      this.zoom(this.px.mouseX, this.px.mouseY, e.deltaY);

    } else {
      // Scroll 
      this.scrollByPixels(e.deltaY/2, e.shiftKey);
    }

    this.drawAll();
  }
}

window.addEventListener("resize", function() {
  if (!ctxStarted) return;
  mgmt.canvas.onresize();
});
