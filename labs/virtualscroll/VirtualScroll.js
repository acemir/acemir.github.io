// Adapted from https://gist.github.com/paulirish/1579671 which derived from 
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller.
// Fixes from Paul Irish, Tino Zijdel, Andrew Mao, Klemen Slavič, Darius Bacon

// MIT license

if (!Date.now)
    Date.now = function() { return new Date().getTime(); };

(function() {
    'use strict';
    
    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
        window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame']
                                   || window[vp+'CancelRequestAnimationFrame']);
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
        || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        var lastTime = 0;
        window.requestAnimationFrame = function(callback) {
            var now = Date.now();
            var nextTime = Math.max(lastTime + 16, now);
            return setTimeout(function() { callback(lastTime = nextTime); },
                              nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }
}());

var VirtualScroll = function(document) {

	var vs = {};

	var numListeners, listeners = [], initialized = false;

	var touchStartX, touchStartY;

	// [ These settings can be customized with the options() function below ]
	// Mutiply the touch action by two making the scroll a bit faster than finger movement
	var touchMult = 2;
	// Firefox on Windows needs a boost, since scrolling is very slow
	var firefoxMult = 15;
	// How many pixels to move with each key press
	var keyStep = 120;
	// General multiplier for all mousehweel including FF
	var mouseMult = 1;

	var bodyTouchAction;

	var mouseSupport =	"onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
              			document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
              			"DOMMouseScroll"; // let's assume that remaining browsers are older Firefox

    var hasOverflowHidden;

	// var hasWheelEvent = 'onwheel' in document;
	// var hasMouseWheelEvent = 'onmousewheel' in document;
	var hasTouch = 'ontouchstart' in document;
	var hasTouchWin = navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 1;
	var hasPointer = !!window.navigator.msPointerEnabled;
	var hasKeyDown = 'onkeydown' in document;

	var isFirefox = navigator.userAgent.indexOf('Firefox') > -1;

	var event = {
		y: 0,
		x: 0,
		deltaX: 0,
		deltaY: 0,
		pageX: -window.pageXOffset,
		pageY: -window.pageYOffset,
		originalEvent: null
	};

	vs.on = function(f) {
		if(!initialized) initListeners(); 
		listeners.push(f);
		numListeners = listeners.length;
	}

	vs.options = function(opt) {
		keyStep = opt.keyStep || 120;
		firefoxMult = opt.firefoxMult || 15;
		touchMult = opt.touchMult || 2;
		mouseMult = opt.mouseMult || 1;
	}

	vs.off = function(f) {
		listeners.splice(f, 1);
		numListeners = listeners.length;
		if(numListeners <= 0) destroyListeners();
	}

	var notify = function(e) {
		event.x += event.deltaX || event.pageX;
		event.y += event.deltaY || event.pageY;
		event.originalEvent = e;

		// console.log(event);

		for(var i = 0; i < numListeners; i++) {
			listeners[i](event);
		}
	}

	var onWheel = function(e) {
		// In Chrome and in Firefox (at least the new one)
		event.deltaX = e.wheelDeltaX || e.deltaX * -1;
		event.deltaY = e.wheelDeltaY || e.deltaY * -1;

		// for our purpose deltamode = 1 means user is on a wheel mouse, not touch pad 
		// real meaning: https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent#Delta_modes
		if(isFirefox && e.deltaMode == 1) {
			event.deltaX *= firefoxMult;
			event.deltaY *= firefoxMult;
		} 

		event.deltaX *= mouseMult;
		event.deltaY *= mouseMult;

		hasOverflowHidden  && notify(e);
		// notify(e);
	}

	var onMouseWheel = function(e) {
		// In Safari, IE and in Chrome if 'wheel' isn't defined
		event.deltaX = (e.wheelDeltaX) ? e.wheelDeltaX : 0;
		event.deltaY = (e.wheelDeltaY) ? e.wheelDeltaY : e.wheelDelta;

		hasOverflowHidden && notify(e);	
		// notify(e);
	}

	var onTouchStart = function(e) {
		var t = (e.targetTouches) ? e.targetTouches[0] : e;
		touchStartX = t.clientX;	
		touchStartY = t.clientY;
	}

	var onTouchMove = function(e) {
		// e.preventDefault(); // < This needs to be managed externally
		var t = (e.targetTouches) ? e.targetTouches[0] : e;

		event.deltaX = (t.clientX - touchStartX) * touchMult;
		event.deltaY = (t.clientY - touchStartY) * touchMult;

		touchStartX = t.clientX;
		touchStartY = t.clientY;

		document.body.scrollLeft = document.documentElement.scrollLeft = (Math.max(document.body.scrollLeft,document.documentElement.scrollLeft) + (-event.deltaX));
		document.body.scrollTop = document.documentElement.scrollTop = (Math.max(document.body.scrollTop,document.documentElement.scrollTop) + (-event.deltaY));

		hasOverflowHidden && notify(e);
		// notify(e);

	}

	var onKeyDown = function(e) {
		// 37 left arrow, 38 up arrow, 39 right arrow, 40 down arrow
		// event.deltaX = event.deltaY = 0;
		// switch(e.keyCode) {
		// 	case 37:
		// 		event.deltaX = -keyStep;
		// 		break;
		// 	case 39:
		// 		event.deltaX = keyStep;
		// 		break;
		// 	case 38:
		// 		event.deltaY = keyStep;
		// 		break;
		// 	case 40:
		// 		event.deltaY = -keyStep;
		// 		break;
		// }

		// notify(e);
	}

	var onScroll = function(e) {
		event.deltaX = -(window.pageXOffset + event.pageX);
		event.deltaY = -(window.pageYOffset + event.pageY);
		event.pageX = -(window.pageXOffset);
		event.pageY = -(window.pageYOffset);

		notify(e);
	}

	var initListeners = function() {
		document.addEventListener(mouseSupport, mouseSupport == "wheel" ? onWheel : onMouseWheel);
		// if(hasWheelEvent) {console.log('wheel'); document.addEventListener("wheel", onWheel);}
		// if(hasMouseWheelEvent) {console.log('mousewheel'); document.addEventListener("mousewheel", onMouseWheel);}

		if(hasTouch) {
			document.addEventListener("touchstart", onTouchStart);
			document.addEventListener("touchmove", onTouchMove);
		}
		
		if(hasPointer && hasTouchWin) {
			bodyTouchAction = document.body.style.msTouchAction;
			document.body.style.msTouchAction = "none";
			document.addEventListener("MSPointerDown", onTouchStart, true);
			document.addEventListener("MSPointerMove", onTouchMove, true);
		}

		if(hasKeyDown) document.addEventListener("keydown", onKeyDown);

		document.addEventListener("scroll", onScroll);

		hasOverflowHidden = getComputedStyle(document.body).overflowY == "hidden" || getComputedStyle(document.documentElement).overflowY == "hidden";

		initialized = true;
	}

	var destroyListeners = function() {
		document.removeEventListener(mouseSupport, mouseSupport == "wheel" ? onWheel : onMouseWheel);
		// if(hasWheelEvent) document.removeEventListener("wheel", onWheel);
		// if(hasMouseWheelEvent) document.removeEventListener("mousewheel", onMouseWheel);

		if(hasTouch) {
			document.removeEventListener("touchstart", onTouchStart);
			document.removeEventListener("touchmove", onTouchMove);
		}
		
		if(hasPointer && hasTouchWin) {
			document.body.style.msTouchAction = bodyTouchAction;
			document.removeEventListener("MSPointerDown", onTouchStart, true);
			document.removeEventListener("MSPointerMove", onTouchMove, true);
		}

		if(hasKeyDown) document.removeEventListener("keydown", onKeyDown);

		document.removeEventListener("scroll", onScroll);

		hasOverflowHidden = void(0);

		initialized = false;
	}

	return vs;
};





