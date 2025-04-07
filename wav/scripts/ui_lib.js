const kIgnoredArgumentProps = ["classes", "eventHandler", "eventType"];

Array.prototype.remove = function(entry) {
  const idx = this.indexOf(entry);
  if (idx === -1) return;
  this.splice(idx, 1);
  return this;
} // TODO: Remove

function startAudioCtx() {
              ctx = new AudioContext();
        mgmt.node = new NodeManager(ctx);
  mgmt.connection = new ConnectionManager(ctx);
  mgmt.automation = new AutomationManager(ctx);
    mgmt.playback = new PlaybackManager(ctx);
  //
  $("ctx").classList.add("hidden");
  $("node").classList.remove("hidden");

  mgmt.canvas = new CanvasManager(ctx);
  mgmt.node.register(ctx.destination);
  mgmt.canvas.onresize();

  ctxStarted = true;
}

$("ctx").addEventListener("pointerup", startAudioCtx);

function createNewNode() {
  // `this` is the <select> element in the nodes tab with no ID
  if (!kNodeTypes.includes(this.value)) {
    throw Error("Invalid node type passed to createNewNode");
  }
  const node = new (window[this.value])(ctx); // what the fuck
  mgmt.node.register(node);
  this.selectedIndex = 0;
}

$("node").addEventListener("change", createNewNode);

// Determines whether the node has extra limitations for no reason
function isLimitedNode(node) {
  return node.constructor == ConvolverNode 
      || node.constructor == DynamicsCompressorNode 
      || node.constructor == PannerNode
      || node.constructor == StereoPannerNode;
}

function createAutomationMgmtUI(pID) {
  //alert("automationmgmt: "+pID);
}

// splitter + merger nodes cannot change channel count
// splitter + merger nodes cannot change channel count mode
// splitter node cannot change channel interpretation
// convolver node max channels = 2
// dynamics compressor node max channels = 2
// panner node max channels = 2
// stereo panner node max channels = 2
// convolver node cannot have "max" count mode
// dynamics compressor node cannot have "max" count mode
// panner node cannot have "max" count mode
// stereo panner node cannot have "max" count mode
