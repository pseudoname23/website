class CanvasManager {
  constructor() {
    this.canvases = {};
    this.newCanvas("background");
    this.newCanvas("node");
    this.newCanvas("cursor");
    this.nodes = {};

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
    this.canvases[name].dom = genericElem("canvas");
    this.canvases[name].ctx = this.canvases[name].dom.getContext("2d");
    tabinator.tabs[4].appendChild(this.canvases[name].dom);
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
    // if this is broken consider the helper functions above
    this.canvases.background.ctx.strokeStyle = "rgba(0,0,0,0.3)";
    this.canvases.background.ctx.lineWidth = 0.5;
    this.canvases.background.ctx.beginPath();
    const lineInterval = this.pixelsPerUnit * 10;

    const hStartOffset = Math.sign(this.su.top) === 1 ? Math.ceil(this.su.top/10)*10 - this.su.top : Math.abs(this.su.top % 10);
    let hLineTarget = Math.floor((this.canvases.node.height - hStartOffset * this.pixelsPerUnit) / lineInterval);
    while (hLineTarget > 0) {
      let lineHeight = hStartOffset * this.pixelsPerUnit + hLineTarget * lineInterval;
      this.canvases.background.ctx.moveTo(0, lineHeight);
      this.canvases.background.ctx.lineTo(this.canvases.node.width, lineHeight);
      --hLineTarget;
    }

    this.canvases.background.ctx.stroke();
  }
  clearGrid() {

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
    // TODO
  }

  drawAllNodes() {
    for (const id in this.nodes) this.drawNode(id);
  }

  clearAllNodes() {
    for (const id in this.nodes) this.clearNode(id);
  }





  drawCursorTracker() {
    this.canvases.cursor.ctx.fillRect(
      this.px.mouseX, 
      this.px.mouseY, 
      10 * this.pixelsPerUnit, 
      10 * this.pixelsPerUnit
    );
  }

  clearCursorTracker() {
    this.canvases.cursor.ctx.clearRect(
      this.px.mouseX - 1, 
      this.px.mouseY - 1, 
      (10 * this.pixelsPerUnit) + 2, 
      (10 * this.pixelsPerUnit) + 2
    );
  }





  drawCenterTracker() {
    this.canvases.node.ctx.fillRect(
      this.unitXToPixelX(-2), 
      this.unitYToPixelY(-10), 
      this.pixelsPerUnit * 4,
      this.pixelsPerUnit * 20
    );
    this.canvases.node.ctx.fillRect(
      this.unitXToPixelX(-10), 
      this.unitYToPixelY(-2), 
      this.pixelsPerUnit * 20,
      this.pixelsPerUnit * 4
    );
  }

  clearCenterTracker() {
    this.canvases.node.ctx.clearRect(
      this.unitXToPixelX(-2) - 1,
      this.unitYToPixelY(-10) - 1, 
      this.pixelsPerUnit * 4 + 2,
      this.pixelsPerUnit * 20 + 2
    );
    this.canvases.node.ctx.clearRect(
      this.unitXToPixelX(-10) - 1,
      this.unitYToPixelY(-2) - 1,
      this.pixelsPerUnit * 20 + 2,
      this.pixelsPerUnit * 4 + 2
    );
  }





  clearAll() {
    this.canvases.node.ctx.clearRect(0, 0, this.canvases.node.dom.width, this.canvases.node.dom.height);
    this.canvases.cursor.ctx.clearRect(0, 0, this.canvases.node.dom.width, this.canvases.node.dom.height);
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
    const parentRect = this.canvases.node.dom.parentElement.getBoundingClientRect();
    this.canvases.node.dom.height = parentRect.height + 10;
    this.canvases.node.dom.width = parentRect.width + 10;
    this.canvases.cursor.dom.height = parentRect.height + 10;
    this.canvases.cursor.dom.width = parentRect.width + 10;
    this.canvases.background.dom.height = parentRect.height + 10;
    this.canvases.background.dom.width = parentRect.width + 10;
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

  onpointerup(e){

  }

  onpointerdown(e){

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
