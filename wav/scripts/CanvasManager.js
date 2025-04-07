class CanvasManager {
  constructor() {
    this.canvases = {};
    this.canvasContainer = $("container");
    this.newCanvas("grid");
    this.newCanvas("node");
    this.newCanvas("cursor");
    this.nodes = {};
    this.selectedNodes = {};
    this.mouseState = {
      down: false,
      hovering: null,
      dragging: null
    }

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
    //tabinator.leaves[4].addEventListener("pointerup", () => {
    //  mgmt.canvas.onresize();
    //}, {once: true})

    this.canvases.cursor.dom.addEventListener("pointermove", e => {
      this.onpointermove(e);
    });

    this.canvases.cursor.dom.addEventListener("wheel", e => {
      this.onwheel(e);
    });

    this.canvases.cursor.dom.addEventListener("pointerdown", e => {
      this.onpointerdown(e);
    });

    this.canvases.cursor.dom.addEventListener("pointerup", e => {
      this.onpointerup(e);
    });

    this.canvases.cursor.dom.addEventListener("contextmenu", e => e.preventDefault());
  }


  newCanvas(name) {
    this.canvases[name] = {};
    this.canvases[name].dom = document.createElement("canvas");
    this.canvases[name].ctx = this.canvases[name].dom.getContext("2d");
    this.canvasContainer.appendChild(this.canvases[name].dom);
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



  drawGrid() {
    this.canvases.grid.ctx.strokeStyle = "rgba(0,0,0,0.5)";
    this.canvases.grid.ctx.lineWidth = 0.5;
    this.canvases.grid.ctx.beginPath();
    const lineInterval = this.pixelsPerUnit * 25;

    const hStartOffset = Math.sign(this.su.top) === 1 ? Math.ceil(this.su.top/25)*25 - this.su.top : Math.abs(this.su.top % 25);
    let hLineTarget = Math.floor((this.canvases.node.dom.height - hStartOffset * this.pixelsPerUnit) / lineInterval);
    while (hLineTarget > -1) {
      let lineHeight = hStartOffset * this.pixelsPerUnit + hLineTarget * lineInterval;
      this.canvases.grid.ctx.moveTo(0, lineHeight);
      this.canvases.grid.ctx.lineTo(this.canvases.node.dom.width, lineHeight);
      --hLineTarget;
    }

    const vStartOffset = Math.sign(this.su.left) === 1 ? Math.ceil(this.su.left/25)*25 - this.su.left : Math.abs(this.su.left % 25);
    let vLineTarget = Math.floor((this.canvases.node.dom.width - vStartOffset * this.pixelsPerUnit) / lineInterval);
    while (vLineTarget > -1) {
      let linePos = vStartOffset * this.pixelsPerUnit + vLineTarget * lineInterval;
      this.canvases.grid.ctx.moveTo(linePos, 0);
      this.canvases.grid.ctx.lineTo(linePos, this.canvases.node.dom.height);
      --vLineTarget;
    }

    this.canvases.grid.ctx.stroke();
  }
  clearGrid() {
    this.canvases.grid.ctx.clearRect(0, 0, this.canvases.node.dom.width, this.canvases.node.dom.height);
  }



  addNode(id) {
    this.clearAll();
    this.nodes[id] = {
      node: mgmt.node.registry[id],
      su: { x: this.pixelXToUnitX(0), y: this.pixelYToUnitY(0) },
      px: { x: 0, y: 0 },
      selected: false
    }
    this.drawAll();
  }

  selectNode(id) {
    if (this.selectedNodes[id]) return;
    if (!this.nodes[id]) {
      throw Error(`Tried to select a node with ID ${id} that, according to CanvasManager, does not exist`);
    }
    const node = this.nodes[id];
    node.selected = true;
    this.selectedNodes[id] = node;
  }

  deselectNode(id) {
    if (!this.nodes[id]) {
      throw Error(`Tried to deselect a node with ID ${id} that, according to CanvasManager, does not exist`);
    }
    delete this.selectedNodes[id];
    this.nodes[id].selected = false;
  }

  deselectAllNodes() {
    for (const id in this.selectedNodes) {
      this.deselectNode(id);
    }
  }

  drawNode(id) {
    const node = this.nodes[id];
    if (!node) return;
    if (!this.images[node.node.constructor.name]) return;
    this.canvases.node.ctx.drawImage(
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
    if (!this.images[node.node.constructor.name]) return;
    this.canvases.node.ctx.clearRect(
      node.px.x-1, node.px.y-1,
      (100 * this.pixelsPerUnit) + 2,
      (100 * this.pixelsPerUnit) + 2
    )
  }

  drawAllNodes() {
    for (const id in this.nodes) this.drawNode(id);
  }

  clearAllNodes() {
    for (const id in this.nodes) this.clearNode(id);
  }





  //drawCursorTracker() {
  //  this.canvases.cursor.ctx.fillRect(
  //    this.px.mouseX, 
  //    this.px.mouseY, 
  //    10 * this.pixelsPerUnit, 
  //    10 * this.pixelsPerUnit
  //  );
  //}

  //clearCursorTracker() {
  //  this.canvases.cursor.ctx.clearRect(
  //    this.px.mouseX - 1, 
  //    this.px.mouseY - 1, 
  //    (10 * this.pixelsPerUnit) + 2, 
  //    (10 * this.pixelsPerUnit) + 2
  //  );
  //}





  drawCenterTracker() {
    this.canvases.grid.ctx.fillRect(
      this.unitXToPixelX(-2), 
      this.unitYToPixelY(-10), 
      this.pixelsPerUnit * 4,
      this.pixelsPerUnit * 20
    );
    this.canvases.grid.ctx.fillRect(
      this.unitXToPixelX(-10), 
      this.unitYToPixelY(-2), 
      this.pixelsPerUnit * 20,
      this.pixelsPerUnit * 4
    );
  }

  clearCenterTracker() {
    this.canvases.grid.ctx.clearRect(
      this.unitXToPixelX(-2) - 1,
      this.unitYToPixelY(-10) - 1, 
      this.pixelsPerUnit * 4 + 2,
      this.pixelsPerUnit * 20 + 2
    );
    this.canvases.grid.ctx.clearRect(
      this.unitXToPixelX(-10) - 1,
      this.unitYToPixelY(-2) - 1,
      this.pixelsPerUnit * 20 + 2,
      this.pixelsPerUnit * 4 + 2
    );
  }





  clearAll() {
    this.canvases.node.ctx.clearRect(0, 0, this.canvases.node.dom.width, this.canvases.node.dom.height);
    this.canvases.cursor.ctx.clearRect(0, 0, this.canvases.node.dom.width, this.canvases.node.dom.height);
    this.clearGrid();
  }

  drawAll() {
    //this.drawCursorTracker();
    this.drawCenterTracker();
    this.drawAllNodes();
    this.drawGrid();
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
    const parentRect = this.canvases.node.dom.parentElement.getBoundingClientRect();
    this.canvases.node.dom.height = parentRect.height;
    this.canvases.node.dom.width = parentRect.width;
    this.canvases.cursor.dom.height = parentRect.height;
    this.canvases.cursor.dom.width = parentRect.width;
    this.canvases.grid.dom.height = parentRect.height;
    this.canvases.grid.dom.width = parentRect.width;
    this.drawAll();
  }

  setCursorStyle(style) {
    this.canvases.cursor.dom.style.cursor = style;
  }

  onpointermove(e) {
    //this.clearCursorTracker();
    const pxDX = this.px.mouseX - e.offsetX;
    const pxDY = this.px.mouseY - e.offsetY;

    this.px.mouseX = e.offsetX;
    this.px.mouseY = e.offsetY;
    this.su.mouseX = this.pixelXToUnitX(e.offsetX);
    this.su.mouseY = this.pixelYToUnitY(e.offsetY);

    // If the mouse went down and a drag isn't started, try to start a drag
    // Drag start may fail if no nodes are selected
    if (this.mouseState.down && this.mouseState.hovering) {
      this.mouseState.hovering = null;
      this.mouseState.dragging = this.selectedNodes;
      this.setCursorStyle("grabbing");
    }

    // Continue an ongoing drag (overrides hover checking)
    if (this.mouseState.dragging) {
      this.clearAllNodes();
      for (const node of Object.values(this.selectedNodes)) {
        node.px.x -= pxDX;
        node.px.y -= pxDY;
        node.su.x = this.pixelXToUnitX(node.px.x);
        node.su.y = this.pixelYToUnitY(node.px.y);
      }
      this.drawAllNodes();
      return;
    }

    // Check for a hovered node
    this.mouseState.hovering = null;
    for (const node of Object.values(this.nodes)) {
      if (this.mouseIntersects(node)) {
        this.mouseState.hovering = node;
        break;
      }
    }
    if (this.mouseState.hovering) {
      this.setCursorStyle("grab");
    } else {
      this.setCursorStyle("");
    }

    //this.drawCursorTracker();
  }

  mouseIntersects(node) {
    if (this.px.mouseX < node.px.x) return false;
    if (this.px.mouseY < node.px.y) return false;
    if (this.px.mouseX > node.px.x + 100 * this.pixelsPerUnit) return false;
    if (this.px.mouseY > node.px.y + 100 * this.pixelsPerUnit) return false;
    return true;
  }

  onpointerdown(e){
    this.mouseState.down = true;
    // Check what node the cursor is over, if any
    // Select the node if it exists and prepare it to be dragged
    if (this.mouseState.hovering) {
      const hoveredNode = this.mouseState.hovering;
      if (!hoveredNode.selected && !e.shiftKey) {
        this.deselectAllNodes();
      }
      this.selectNode(hoveredNode.node.id);
    } else {
      this.deselectAllNodes();
    }
  }

  onpointerup(e){
    this.mouseState.down = false;
    this.mouseState.dragging = null;
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
 