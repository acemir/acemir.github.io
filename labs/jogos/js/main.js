/***
sine-waves.js
https://github.com/isuttell/sine-waves
 ***/

var waves = new SineWaves({
  el: document.getElementById('waves'),
  
  speed: 6,
  
  // width: 394,
  
  // height: 394,
  
  ease: 'SineInOut',

  rotate: 180,
  
  wavesWidth: '100%',
  
  waves: [
    {
      timeModifier: 0,
      lineWidth: 2,
      amplitude: -150,
      wavelength: 80
    }
  ],
 
  // Resize
  resizeEvent: function() {
    var gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
    gradient.addColorStop(0,"rgba(255,255,255,1)");
    
    var index = -1;
    var length = this.waves.length;
    while(++index < length){
      this.waves[index].strokeStyle = gradient;
    }
    
    // Clean Up
    index = void 0;
    length = void 0;
    gradient = void 0;
  }
});

function updateRotation(r){
  waves.rotation = r * Math.PI / 180;
};

var r = 180;
var rotateSlider = document.getElementById("rotateSlider");
rotateSlider.step = 1;
rotateSlider.min = 0;
rotateSlider.max = 360;
rotateSlider.value = r;
rotateSlider.addEventListener("input", function (event) {
  r = parseInt(this.value);
  //waves.el.style['transform'] = "rotateZ("+r+"deg)";
  updateRotation(r);
});


function bindWheel(element, eventType, callback) {
  var mousewheel = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
           document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
           "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox
  var _this = this;


  //callback.call(this, event, $);
  if(element.addEventListener) {
    if( eventType === "mousewheel" ) {
      element.addEventListener(mousewheel, function(event) {
        callback.call(_this, event, this);
      }, false);
    } else {
      element.addEventListener(eventType, function(event) {
        callback.call(_this, event, this);
      }, false);
    }
  } else if (element.attachEvent) {
    element.attachEvent('on' + eventType, function(event) {
      callback.call(_this, event, this);
    });
  } else {
    element['on' + eventType] = function(event) {
      callback.call(_this, event, this);
    };
  }
};

bindWheel(document,'mousewheel',function(event){
    event = event ? event : window.event;

    // if (!this.preventScrolling) this.stopEvent(event);

    var orgEvent = event || window.event,
      args = [].slice.call(arguments, 1),
      delta = 0,
      returnValue = true,
      deltaX = 0,
      deltaY = 0,
      finalDelta;

    // Old school scrollwheel delta
    if (orgEvent.wheelDelta) {
      delta = orgEvent.wheelDelta/120;
    }

    if (orgEvent.detail) {
      delta = -orgEvent.detail/3;
    }

    // New school multidimensional scroll (touchpads) deltas
    deltaY = delta;
    deltaX = delta;

    // Gecko (17 and above)
    if (!!orgEvent.deltaMode) {
        deltaY = -orgEvent.deltaY/3;
        deltaX = -orgEvent.deltaX/3;
    }

    // Gecko (16 and earlier)
    if (orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS) {
        deltaY = 0;
        deltaX = -1 * delta;
    }

    // Webkit
    if (orgEvent.wheelDeltaY !== undefined) {
      deltaY = orgEvent.wheelDeltaY / 120;
    }

    if (orgEvent.wheelDeltaX !== undefined) {
      deltaX = -1 * orgEvent.wheelDeltaX / 120;
    }

    //console.log(deltaX,deltaY);
    var newValue = parseInt(rotateSlider.value) + deltaY*10;
    console.log(newValue);
    rotateSlider.value = newValue > 360 ? newValue - 360 : newValue < 0 ? newValue + 360 : parseInt(rotateSlider.value) + deltaY*10;
    rotateSlider.dispatchEvent(new Event('input'));
});
