// don't implement ValueCurve yet

class AutomationManager {
  constructor(ctx) {
    this.events = {};
    this.initialValues = {};
    this.ready = true;
  }

  addEvent(paramID, eventType, offsetTime, value=0, thirdArg=0) {
    // if (!this.events[paramID]) this.events[paramID] = [];
    const event = new AutomationEvent(eventType, offsetTime, value, thirdArg);
    this.events[paramID].push(event);
  }

  removeEvent(paramID, event) {
    if (!this.events[paramID].includes(event)) return;
    const idx = this.events[paramID].indexOf(event);
    this.events[paramID].splice(idx, 1);
  }

  scheduleAll(time=0) {
    this.ready = false;
    const soon = ctx.currentTime + 1;
    for (const pID in this.events) {
      for (const ev of this.events[pID]) {
        if (ev.time >= time) ev.schedule(pID, soon);
      }
    }
    this.ready = true;
  }

  descheduleAll() {
    this.ready = false;
    for (const pID in this.events) {
      mgmt.node.registry[pID].cancelAndHoldAtTime(0);
      mgmt.node.registry[pID].setValueAtTime(this.initialValues[pID], ctx.currentTime+0.1);
    }
    this.ready = true;
  }
}
