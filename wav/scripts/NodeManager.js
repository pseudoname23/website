function isScheduledSourceNode(node) {
  return (
    node.constructor === AudioBufferSourceNode ||
    node.constructor === OscillatorNode        ||
    node.constructor === ConstantSourceNode
  );
}

function onScheduledSourceEnded() {
  // typeof this == AudioScheduledSourceNode
  ++mgmt.node.scheduledSourceEndedCount;
  if (mgmt.node.scheduledSourceEndedCount === mgmt.node.scheduledSourceNodes.length) {
    mgmt.node.scheduledSourceEndedCount = 0;
    mgmt.node.refreshScheduledSourceNodes();
  }
}

function initializeParams(node) {
  if (node.params !== undefined) throw new Error(
    "Tried to initialize params of a node whose params are already initialized"
  )
  node.params = [];
  for (const k in kHashStore) {
    if (node[k] && node[k].constructor == AudioParam) {
      const param = node[k];
      node.params.push(param);
      param.parent = node;
      param.id = node.id + kHashStore[k];
    }
  }
}

class NodeManager {
  constructor() {
    this.registry = {};
    this.scheduledSourceNodes = [];
    this.scheduledSourceEndedCount = 0;
    this.ready = true;
  }

  register(nodelike, overwrite=false) {
    if (nodelike.constructor === AudioParam) {
      const param = nodelike; // For clarity

      // Register the param
      if (!overwrite && this.registry[param.id]) {
        throw new Error(`Tried to register a param whose ID ${param.id} was already registered`);
      } else {
        this.registry[param.id] = param;
      }
      mgmt.automation.events[param.id] = [];

    } else { // If given a node:
      const node = nodelike; // For clarity

      // Give the node its own unique ID
      if (!node.id) {
        const nodeTypeKey = kHashStore[node.constructor.name];
        const numNodesSameType = Object.values(this.registry).filter(
          n => (node.constructor === n.constructor)
        ).length;
        node.id = nodeTypeKey + (numNodesSameType+1);
      }

      // Register the node
      if (!overwrite && this.registry[node.id]) {
        throw new Error("Tried to register a node whose ID was already registered");
      } else {
        this.registry[node.id] = node;
      }

      // Find and register the node's params
      initializeParams(node);
      for (const p of node.params) this.register(p, overwrite);

      // If the node is a ScheduledSourceNode, set up extra stuff
      if (isScheduledSourceNode(node)) {
        this.scheduledSourceNodes.push(node.id);
        node.addEventListener("ended", onScheduledSourceEnded);
      }

      // Interact with other managers
      mgmt.connection.network[node.id] = [];
      mgmt.canvas.addNode(node.id);
    }
  }

  refresh(id) {
    const oldNode = this.registry[id];
    const newNode = new (oldNode.constructor)(ctx);
    newNode.id = id;
    this.register(newNode, true);
  }

  refreshScheduledSourceNodes() {
    // we assume that all scheduled source nodes have been started and stopped

    this.ready = false;
    mgmt.connection.disconnectAll();
    for (const ssnid of this.scheduledSourceNodes) this.refresh(ssnid);
    mgmt.connection.connectAll();
    this.ready = true;
  }
}
