const nodes = [];
const hitboxes = [];

const connect = function(origin, target) {
  if (target instanceof ConstantSource) {
    throw new Error('OperatorError: Cannot connect a node to a ConstantSource');
    
  } else if (target instanceof Oscillator) {
    throw new Error('OperatorError: Cannot connect a node to an Oscillator');
    
  } else if (target instanceof Destination) {
    if (origin.outwardConnections.indexOf(0) !== -1) throw new Error('OperatorError: Node is already connected to the audioContext.destination');
    // else...
    origin.node.connect(audioContext.destination);
    origin.outwardConnections.push(0);
    target.inwardConnections.push(origin.id);
    return;
    
  } else if (target instanceof Parameter) {
    if (origin.outwardConnections.indexOf(target.id) !== -1) return;
    // else...
    origin.node.connect(target.param);
    origin.outwardConnections.push(target.id);
    target.inwardConnections.push(origin.id);
    return;
    
  } else {
    if (origin.outwardConnections.indexOf(target.id) !== -1) return;
    // else...
    origin.node.connect(target.node);
    origin.outwardConnections.push(target.id);
    target.inwardConnections.push(origin.id);
    return;
  }
};
const isConnected = function(origin, target) {
  return (!!(origin.outwardConnections.indexOf(target.id)+1) && !!(target.inwardConnections.indexOf(origin.id)+1));
};
const disconnect = function(origin, _target) {
  if ((_target ?? true)===true) {

  } else {
    
  }
};

class Destination {
  constructor(x, y) {
    this.center = [x, y];
    this.bounds = [x-160, y-100, 260, 200];
    this.innerBounds = [x-100, y-100, 200, 200];
    this.id = 0;
    this.node = audioContext.destination;
    this.inwardConnections = [];
    nodes.push(this);
  };
};
class Parameter {
  constructor(parent, param, relativeX, relativeY) {
    this.center = [parent.center[0]+relativeX , parent.center[1]+relativeY];
    // All parameters are drawn the same way
    this.color = parent.color;
    this.param = param;
    this.id = parent.params.length + (parent.id * 1000);
    this.inwardConnections = [];
    parent.params.push(this);
    hitboxes.splice(0, 0, [this.center[0]-20, this.center[1]-20, 40, 40, this.id]);
  };
};


class Analyser {
  constructor(x, y) {
    this.inwardConnections = [];
    this.outwardConnections = [];
    this.bounds = [x-80, y-50, 160, 100];
    this.innerBounds = [x-50, y-50, 100, 100];
    this.center = [x, y];
    this.color = '#FF0000';

    confirmExit = true;
    this.id = nodes.length;
    this.node = new AnalyserNode(audioContext);
    nodes.push(this);
    hitboxes.splice(0, 0, [this.innerBounds[0], this.innerBounds[1], this.innerBounds[2], this.innerBounds[3], this.id]);
  };
};
class BiquadFilter {
  constructor(x, y) {
    this.bounds = [x-155, y-70, 310, 140];
    this.innerBounds = [x-125, y-50, 250, 100];
    this.center = [x, y];
    this.color = '#FF9200';
    // Visual

    this.id = nodes.length;
    confirmExit = true;
    // Both
    this.inwardConnections = [];
    this.outwardConnections = [];

    // Functional
    hitboxes.splice(0, 0, [this.innerBounds[0], this.innerBounds[1], this.innerBounds[2], this.innerBounds[3], this.id]);
    this.node = new BiquadFilterNode(audioContext);
    this.params = [];
    new Parameter(this, this.node.frequency, 25, -50);
    new Parameter(this, this.node.detune,   -25,  50);
    new Parameter(this, this.node.Q,        -75, -50);
    new Parameter(this, this.node.gain,      75,  50);
    nodes.push(this);
  };
}
class ConstantSource {
  constructor(x, y) {
    this.bounds = [x-70, y-50, 150, 100];
    this.innerBounds = [x-50, y-50, 100, 100];
    this.center = [x, y];
    this.color = '#FFD300';
    // Visual //

    this.id = nodes.length;       //
    confirmExit = true;           // Both
    this.outwardConnections = []; //

    // Functional //
    hitboxes.splice(0, 0, [this.innerBounds[0], this.innerBounds[1], this.innerBounds[2], this.innerBounds[3], this.id]);
    this.node = new ConstantSourceNode(audioContext);
    this.params = [];
    new Parameter(this, this.node.offset, -50, 0);
    nodes.push(this);
  };
}
class Delay {
  constructor(x, y) {
    confirmExit = true;
    this.node = new DelayNode(audioContext);
    this.id = nodes.length;
    this.inwardConnections = [];
    this.outwardConnections = [];
    this.params = [];
    new Parameter(this, this.node.delayTime);
    this.bounds = [x, y, undefined, undefined];
    this.color = '#66A302';
    nodes.push(this);
  };
}
class DynamicsCompressor {
  constructor(x, y) {
    confirmExit = true;
    this.node = new DynamicsCompressorNode(audioContext);
    this.id = nodes.length;
    this.inwardConnections = [];
    this.outwardConnections = [];
    this.params = [];
    new Parameter(this, this.node.threshold);
    new Parameter(this, this.node.knee);
    new Parameter(this, this.node.ratio);
    new Parameter(this, this.node.attack);
    new Parameter(this, this.node.release);
    this.bounds = [x, y, undefined, undefined];
    this.color = '#00FD00';
    nodes.push(this);
  };
}
class Gain {
  constructor(x, y) {
    confirmExit = true;
    this.node = new GainNode(audioContext);
    this.id = nodes.length;
    this.inwardConnections = [];
    this.outwardConnections = [];
    this.params = [];
    new Parameter(this, this.node.gain);
    this.bounds = [x, y, undefined, undefined];
    this.color = '#0288FB';
    nodes.push(this);
  };
}
class Oscillator {
  constructor(x, y) {
    confirmExit = true;
    this.node = new OscillatorNode(audioContext);
    this.id = nodes.length;
    this.inwardConnections = [];
    this.outwardConnections = [];
    this.params = [];
    new Parameter(this, this.node.frequency);
    new Parameter(this, this.node.detune);
    this.bounds = [x, y, undefined, undefined];
    this.color = '#3E03FB';
    nodes.push(this);
  };
}
class StereoPanner {
  constructor(x, y) {
    confirmExit = true;
    this.node = new StereoPannerNode(audioContext);
    this.id = nodes.length;
    this.inwardConnections = [];
    this.outwardConnections = [];
    this.params = [];
    new Parameter(this, this.node.pan);
    this.bounds = [x, y, undefined, undefined];
    this.color = '#FB00FB';
    nodes.push(this);
  };
}

const kNodeConstructorList = [
  Analyser, BiquadFilter, ConstantSource, Delay, 
  DynamicsCompressor, Gain, Oscillator, StereoPanner
];