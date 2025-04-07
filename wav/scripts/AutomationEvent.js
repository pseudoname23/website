class AutomationEvent {
  constructor(eventType, offsetTime, value=0, thirdArg=0) {
    this.eventType = eventType;
    this.time = offsetTime;
    this.value = value;
    this.thirdArg = thirdArg;
  }
  schedule(paramID) {
    const hasSecondArg = this.eventType < 2;
    const hasThirdArg = this.eventType == 5;
    mgmt.node.registry[paramID][kAutomationTypes[this.eventType]](
      (hasSecondArg ? this.value : this.time),
      (hasSecondArg ? this.time  : undefined),
      (hasThirdArg ? this.thirdArg : undefined)
    ) // if this doesn't work i'm ****ed
  }
}

// setValueAtTime               ( value, time )
// linearRampToValueAtTime      ( value, endTime )
// exponentialRampToValueAtTime ( value, endTime )
// setTargetAtTime              ( target, startTime, timeConstant )
// setValueCurveAtTime(!)       ( values, startTime, duration )
// cancelScheduledValues        ( time )
// cancelAndHoldAtTime          ( time )
