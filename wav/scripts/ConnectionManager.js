// don't even bother with channelwise connections yet

class ConnectionManager {
  constructor(ctx) {
    this.network = {};
    this.ready = true;
  }

  addConnection(origin, destination) {
    // if (!this.network[origin]) this.network[origin] = [];
    if (this.network[origin].includes(destination)) return;
    this.network[origin].push(destination);
    if (this.ready) mgmt.node.registry[origin].connect(mgmt.node.registry[destination]);
  }

  removeConnection(origin, destination) {
    if (!this.network[origin]) return;
    if (!this.network[origin].includes(destination)) return;
    const idx = this.network[origin].indexOf(destination);
    this.network[origin].splice(idx, 1);
    if (this.ready) mgmt.node.registry[origin].disconnect(mgmt.node.registry[destination]);
  }

  disconnectAll() {
    if (!this.ready) throw new Error("Not ready to disconnect yet");
    this.ready = false;
    for (const origin in this.network) {
      for (const destination of this.network[origin]) {
        mgmt.node.registry[origin].disconnect(mgmt.node.registry[destination]);
      }
    }
  }

  connectAll() {
    if (this.ready) throw new Error("Tried to reconnect before disconnecting");
    for (const origin in this.network) {
      for (const destination of this.network[origin]) {
        mgmt.node.registry[origin].connect(mgmt.node.registry[destination]);
      }
    }
    this.ready = true;
  }
}
