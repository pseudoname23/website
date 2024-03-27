const kIgnoredArgumentProps = ["classes", "eventHandler", "eventType"];

Array.prototype.remove = function(entry) {
  const idx = this.indexOf(entry);
  if (idx === -1) return;
  this.splice(idx, 1);
  return this;
} // TODO: Remove

/**
 * Creates an HTMLElement with the given type and properties.
 * @param  {String} type  The tag name of the desired element, for example "div" or "p".
 * @param  {Object=} args The properties of the element. Keys indicate properties, values indicate values.
 *                        Classes must be provided as an array of strings with the key "classes".
 *                        Event handlers under the key "eventHandler" must also be given an event type under
 *                        ... the key "eventType", or else they will be ignored, and vice versa.
 * @return {HTMLElement}  An HTMLElement of the given type with the given properties.
 */
function genericElem(type, args={}) {
  const elem = document.createElement(type);
  if (args.classes) {
    args.classes.forEach(clas => elem.classList.add(clas));
  }
  if (args.eventHandler) {
    if (!args.eventType) {
      throw new Error(
        `The 'args' object passed to 'genericElem(${type})' contained an eventHandler with no eventType.`
      );
    } else {
      elem.addEventListener(args.eventType, args.eventHandler);
    }
  } else if (args.eventType) {
    console.warn(`The 'args' object passed to 'genericElem(${type})' contained an eventType with no eventHandler - ignoring.`)
  }
  for (const key in args) {
    if (kIgnoredArgumentProps.includes(key)) continue;
    if (key.indexOf("data_") === 0) {
        elem.dataset[key.substring(5)] = String(args[key]);
    } else {
        elem[key] = args[key];
    }
  }
  return elem;
}

/**
 * A wrapper for genericElem that always returns an input element.
 * @param {Object=} args The properties of the element as described above.
 * @returns {HTMLInputElement} An HTMLInputElement with the given properties.
 */
function inputElem(args) {
  const input = genericElem("input", args);
  input.type = args.type ?? "text";
  return input;
}

function buttonElem(args) {
  const btn = genericElem("button", args);
  btn.type = args.type ?? "button";
  return btn;
}

function selectElem(args, options, initSelected=null) {
  const select = genericElem("select", args);
  if (initSelected) {
    options.remove(initSelected);
    select.add(new Option(initSelected, initSelected, true, true));
  }
  for (const opt of options) select.add(new Option(opt));
  return select;
}

// Appends an HTMLBrElement to a given element.
// HTMLElement -> undefined
function br(parent) {
  parent.appendChild(document.createElement('br'));
}




function startAudioCtx() {
              ctx = new AudioContext();
        mgmt.node = new NodeManager(ctx);
  mgmt.connection = new ConnectionManager(ctx);
  mgmt.automation = new AutomationManager(ctx);
    mgmt.playback = new PlaybackManager(ctx);
  //
  $('ctx').classList.add("hidden");
  tabinator.autoSetup(document.body);
  tabinator.newTab("node");
  tabinator.newTab("connection");
  tabinator.newTab("automation");
  tabinator.newTab("playback");
  tabinator.newTab("test");

  mgmt.canvas = new CanvasManager(ctx);

  tabinator.tabs[0].appendChild(selectElem({
    eventType: "change", eventHandler: createNewNode,
  }, ["New Node..."].concat(kNodeTypes)));

  mgmt.node.register(ctx.destination);
  createNodeMgmtUI(ctx.destination.id);
  createConnectionMgmtUI(ctx.destination.id);

  ctxStarted = true;
}

$('ctx').addEventListener("pointerup", startAudioCtx);

function createNewNode() {
  if (kNodeTypes.indexOf(this.value) == -1) throw new Error();
  const node = new (window[this.value])(ctx);
  mgmt.node.register(node);
  createNodeMgmtUI(node.id);
  createConnectionMgmtUI(node.id);
  for (const p of node.params) {
    createConnectionMgmtUI(p.id);
    createAutomationMgmtUI(p.id);
  }
  this.selectedIndex = 0;
}

// Determines whether the node has extra limitations for no reason
function isLimitedNode(node) {
  return node.constructor == ConvolverNode 
      || node.constructor == DynamicsCompressorNode 
      || node.constructor == PannerNode
      || node.constructor == StereoPannerNode;
}


function updateNodeProp() {
  const id = this.dataset.targetId;
  const node = mgmt.node.registry[id];
  const prop = this.dataset.prop;

  // Clamp channel count to acceptable values
  if (prop === "channelCount") {
    this.value = this.value|0; // Force int
    this.value = clamp(this.value, 1, 32);
    if (isLimitedNode(node) || node.constructor == AudioDestinationNode) {
      this.value = clamp(this.value, 1, 2);
    }
  }

  // Change the value
  node[prop] = this.value;
}

function createNodeMgmtUI(nID) {
  const nodeMgmtTab = tabinator.tabs[0];
  const node = mgmt.node.registry[nID];
  const nMgr = genericElem("div", {
    id: "nmgr_"+nID, classes: ["nmgr"]
  });
  nodeMgmtTab.appendChild(nMgr);


  // Title
  nMgr.appendChild(genericElem("span", {
    innerText: node.constructor.name+" "+nID
  })); br(nMgr);


  // Channel count
  nMgr.appendChild(genericElem("span", {
    innerText: "Channel count: "
  }))
  const channelCountInput = inputElem({
    type: "number", value: node.channelCount,
    data_targetId: nID, data_prop: "channelCount",
    eventType: "input", eventHandler: updateNodeProp
  })
  nMgr.appendChild(channelCountInput);
  br(nMgr);


  // Channel count mode
  nMgr.appendChild(genericElem("span", {
    innerText: "Channel count mode: "
  }))
  const channelCountModeSelect = selectElem({
    data_targetId: nID, data_prop: "channelCountMode",
    eventType: "change", eventHandler: updateNodeProp
  }, ["max", "clamped-max", "explicit"], node.channelCountMode)
  nMgr.appendChild(channelCountModeSelect);
  br(nMgr);


  // Channel interpretation
  nMgr.appendChild(genericElem("span", {
    innerText: "Channel interpretation: "
  }))
  const channelInterpretationSelect = selectElem({
    data_targetId: nID, data_prop: "channelInterpretation",
    eventType: "change", eventHandler: updateNodeProp
  }, ["speakers", "discrete"], node.channelInterpretation);
  nMgr.appendChild(channelInterpretationSelect);


  // Disable some options for channel splitters/mergers
  if (node.constructor == ChannelSplitterNode || node.constructor == ChannelMergerNode) {
    channelCountInput.disabled = true;
    channelCountModeSelect.disabled = true;
    if (node.constructor == ChannelSplitterNode) channelInterpretationSelect.disabled = true;
  }

  // Remove "max" option from limited nodes
  if (isLimitedNode(node)) channelCountModeSelect.options.remove(1);
}

function createConnectionMgmtUI(nID) {
  const connectionMgmtTab = tabinator.tabs[1];
  const node = mgmt.node.registry[nID];
  const isParam = node.constructor === AudioParam;

  let prop;
  if (isParam) {
    for (const key in kHashStore) {
      if (kHashStore[key] === lastCharOf(node.id)) { prop = key;  break; }
    }
  }
  const cMgr = genericElem("div", {
    id: "cmgr_"+nID, classes: ["nmgr"]
  });
  connectionMgmtTab.appendChild(cMgr);


  cMgr.appendChild(genericElem("span", {
    innerText: node.constructor.name + " " + (isParam?prop:nID)
  })); br(cMgr);
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
