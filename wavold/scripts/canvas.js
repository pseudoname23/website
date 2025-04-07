function line (ctx , x1,y1 , x2,y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    };
  // context.strokeRect(x, y, width, height)
  // context.fillRect  (x, y, width, height)
  // context.clearRect (x, y, width, height)
  function strokeCircle(ctx , centerX,centerY , radius) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI*2);
    ctx.stroke();
  };
  function fillCircle  (ctx , centerX,centerY , radius) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI*2);
    ctx.fill();
  };
  function clearCircle (ctx , centerX,centerY , radius) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  };
  //
  
  
  /////////////////
  // GRID CANVAS //
  /////////////////
  
  const grid = $('grid');
  const gridContext = grid.getContext('2d');
  
  gridImage: {
  let patternCanvas = document.createElement('canvas');
  patternCanvas.width = 20;
  patternCanvas.height = 20;
  
  let patternContext = patternCanvas.getContext('2d');
  patternContext.fillStyle = 'rgb(255, 255, 255)';
  patternContext.fillRect(0, 0, 20, 20);
  patternContext.fillStyle = 'rgba(0, 0, 0, 0.01)';
  patternContext.lineWidth = 1;
  line(patternContext, 0, 0, 20, 0);
  line(patternContext, 0, 0, 0, 20);
  
  gridContext.fillStyle = gridContext.createPattern(patternCanvas, 'repeat');
  gridContext.fillRect(0, 0, grid.width, grid.height);
  }
  //
  
  
  //////////////////
  // NODES CANVAS //
  //////////////////
  
  const nodeMap = $('nodes');
  const nodeMapContext = nodeMap.getContext('2d');
  Destination.prototype.draw = function(context) {
    context.fillStyle = '#000000';
    context.strokeStyle = '#000000';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(this.center[0], this.center[1]+100);
    context.lineTo(this.center[0], this.center[1]-100);
    context.lineTo();   //
    context.lineTo();   //
    context.lineTo();   // Speaker
    context.lineTo();   //
    context.lineTo();   //
    context.fill();     //
    context.beginPath();      //
    context.moveTo();         //
    context.arc();            // Sound lines
    context.arc();            //
    context.arc();            //
    context.stroke();         //
    fillCircle(context); //
    line(context);       // Input
  };
  Parameter.prototype.draw = function(context){
    context.save();
    context.fillStyle = this.color;
    fillCircle(context, this.center[0], this.center[1], 20);
    context.fillStyle = '#000000';
    context.lineWidth = 3;
    context.stroke(); // Uses the leftover path from fillCircle()
    context.lineWidth = 5;
    fillCircle(context, this.center[0], this.center[1], 10);
    line(context, this.center[0],    this.center[1]-14, this.center[0],    this.center[1]+14);
    line(context, this.center[0]-14, this.center[1],    this.center[0]+14, this.center[1]   );
    line(context, this.center[0]-10, this.center[1]-10, this.center[0]+10, this.center[1]+10);
    line(context, this.center[0]+10, this.center[1]-10, this.center[0]-10, this.center[1]+10);
    context.fillStyle = this.color;
    fillCircle(context, this.center[0], this.center[1], 5);
    context.restore();
  };
  Analyser.prototype.draw = function(context){
    // 3 base circles
    context.strokeStyle = '#000000';
    context.fillStyle = this.color;
    fillCircle(context, this.center[0], this.center[1], this.bounds[3]/2);
    fillCircle(context, this.bounds[0]+15, this.center[1], 15);
    fillCircle(context, this.bounds[0]+this.bounds[2]-15, this.center[1], 15);
  
    // Eye
    context.fillStyle = '#FFFFFF';
    context.beginPath();
    context.arc(this.center[0], this.bounds[1]+15, 50, 0.75, 2.35); // These were carefully measured.
    context.arc(this.center[0], this.bounds[1]+this.bounds[3]-15, 50, 3.93, 5.5); // DO NOT TOUCH!!!!
    context.fill(); 
    context.fillStyle = '#000000';
    context.lineWidth = 3;
    context.stroke(); // Border
    fillCircle(context, this.center[0], this.center[1], 15); // Pupil
  
    // In/out text and border
    line(context, this.bounds[0]+15, this.center[1]-9, this.bounds[0]+15, this.center[1]+9);
    strokeCircle(context, this.bounds[0]+this.bounds[2]-15, this.center[1], 8);
    strokeCircle(context, this.center[0], this.center[1], this.bounds[3]/2);
  };
  BiquadFilter.prototype.draw = function(context){
    // Base of node and I/O ports
    context.strokeStyle = '#000000';
    context.fillStyle = this.color;
    context.fillRect(this.innerBounds[0], this.innerBounds[1], this.innerBounds[2], this.innerBounds[3]);
    fillCircle(context, this.bounds[0]+15, this.center[1], 15);
    fillCircle(context, this.bounds[0]+this.bounds[2]-15, this.center[1], 15);
  
    // Node borders and I/O text
    context.fillStyle = '#000000';
    context.lineWidth = 3;
    line(context, this.bounds[0]+15, this.center[1]-9, this.bounds[0]+15, this.center[1]+9);
    strokeCircle(context, this.bounds[0]+this.bounds[2]-15, this.center[1], 8);
    context.strokeRect(this.innerBounds[0], this.innerBounds[1], this.innerBounds[2], this.innerBounds[3]);
  
    // Params
    this.params[0].draw(context);
    this.params[1].draw(context);
    this.params[2].draw(context);
    this.params[3].draw(context);
  
    // Inner
    context.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Channel
    context.fillRect(this.innerBounds[0], this.innerBounds[1]+20, this.innerBounds[2], this.innerBounds[3]-40);
    context.strokeStyle = HEXtoRGBA(this.color, 0.5);
    context.lineWidth = 6; // "Filters"
    line(context, this.center[0]+25, this.center[1]+30, this.center[0]+25, this.center[1]-30);
    line(context, this.center[0]-25, this.center[1]+30, this.center[0]-25, this.center[1]-30);
    line(context, this.center[0]-75, this.center[1]+30, this.center[0]-75, this.center[1]-30);
    line(context, this.center[0]+75, this.center[1]+30, this.center[0]+75, this.center[1]-30);
  };
  ConstantSource.prototype.draw = function(context){
    context.strokeStyle = '#000000';
    context.fillStyle = this.color;
    context.lineWidth = 3;
  
    // Out
    fillCircle(context, this.innerBounds[0]+this.innerBounds[2]+15, this.center[1], 15);
    strokeCircle(context, this.bounds[0]+this.bounds[2]-15, this.center[1], 8);
  
    // Base
    context.fillRect(this.innerBounds[0], this.innerBounds[1], this.innerBounds[2], this.innerBounds[3]);
    context.strokeRect(this.innerBounds[0], this.innerBounds[1], this.innerBounds[2], this.innerBounds[3]);
  
    // Inside
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fillRect(this.innerBounds[0], this.center[1]+20, this.innerBounds[2], -40);
    line(context, this.innerBounds[0], this.center[1], this.innerBounds[0]+this.innerBounds[2], this.center[1]);
    
    this.params[0].draw(context);
  };
  Delay.prototype.draw = function(){};
  DynamicsCompressor.prototype.draw = function(){};
  Gain.prototype.draw = function(){};
  Oscillator.prototype.draw = function(){};
  StereoPanner.prototype.draw = function(){};
  
  
  
  ////////////////////////
  // CONNECTIONS CANVAS //
  ////////////////////////
  
  const connections = $('connections');
  const connectionsContext = connections.getContext('2d');
  
  
  
  ///////////////////////////
  // USER INTERFACE CANVAS //
  ///////////////////////////
  // (note: this canvas is the target of all PointerEvents)
  
  const UI = $('UI');
  const UIContext = UI.getContext('2d');