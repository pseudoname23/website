const $ = id => document.getElementById(id);
const kNodeTypes = [
  "AnalyserNode",
  "AudioBufferSourceNode",
  "BiquadFilterNode",
  "ChannelMergerNode",
  "ChannelSplitterNode",
  "ConstantSourceNode",
  "ConvolverNode",
  "DelayNode",
  "DynamicsCompressorNode",
  "GainNode",
  "OscillatorNode",
  "PannerNode",
  "StereoPannerNode",
  "WaveShaperNode"
];
const kAutomationTypes = [
  "cancelScheduledValues", 
  "cancelAndHoldAtTime",
  "setValueAtTime", 
  "linearRampToValueAtTime", 
  "exponentialRampToValueAtTime",
  "setTargetAtTime"
];
const kHashStore = {
  // AudioNode
  AnalyserNode:'a',
  AudioBufferSourceNode:'b',
  AudioDestinationNode:'c',
  BiquadFilterNode:'d',
  ChannelMergerNode:'e',
  ChannelSplitterNode:'f',
  ConstantSourceNode:'g',
  ConvolverNode:'h',
  DelayNode:'i',
  DynamicsCompressorNode:'j',
  GainNode:'k',
  OscillatorNode:'l',
  PannerNode:'m',
  StereoPannerNode:'n',
  WaveShaperNode:'o',

  // AudioParam
  attack:'A',
  delayTime:'B',
  detune:'C',
  frequency:'D',
  gain:'E',
  knee:'F',
  offset:'G',
  orientationX:'H',
  orientationY:'I',
  orientationZ:'J',
  pan:'K',
  playbackRate:'L',
  positionX:'M',
  positionY:'N',
  positionZ:'O',
  Q:'P', // Yeah, IK. IDC. It's alphabetical.
  ratio:'Q',
  reduction:'R',
  release:'S',
  threshold:'T'
};
const mgmt = {};
const kExtraSVGs = [
  "_arrowcircle"
];

const clamp = (x, lo, hi) => Math.max(Math.min(x, hi), lo);
const lastCharOf = str => str.substring(str.length-1);
const normalize = (x, min, max) => ((x-min) / max-min) * 2 - 1;
let ctx;
let ctxStarted = false;
window.onerror = function(a,b,c,d,e) {
  //alert(e ? e.stack : a);
}

// window.addEventListener("wheel", console.log);

// Things I'm doing for the sake of my sanity:

// 1. Nodes can only connect to other nodes through the default channel (channel 0)
// 2. Scheduled source nodes are started at the beginning of playback and stopped at the end
// 3. setValueCurveAtTime does not exist



// (ID, pID, nID) extends String

// NodeManager
// // nodelikes: (AudioParam | AudioNode){}
// // scheduledSourceNodes: ScheduledSourceNode[]
