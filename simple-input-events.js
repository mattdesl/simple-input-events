const { EventEmitter } = require('events');

module.exports = function createInputEvents (opt) {
  if (opt == null) opt = window;
  if (isDOMNode(opt)) opt = { target: opt };

  const {
    target = window,
    parent = window,
    tapDistanceThreshold = 10,
    tapDelay = 300,
    preventDefault = false,
    filtered = true,
    passive = true
  } = opt;
  
  const eventOpts = passive ? { passive: true } : undefined;

  const emitter = new EventEmitter();

  let initialIdentifier;
  let dragging = false;
  let lastTime;
  let lastPosition;
  let attached = false;

  attach();

  emitter.enable = attach;
  emitter.disable = detach;

  Object.defineProperties(emitter, {
    target: {
      get () { return target }
    },
    parent: {
      get () { return parent }
    }
  });

  return emitter;

  function mousedown (event) {
    // mark the drag event as having started
    dragging = true;
    const touch = getCurrentEvent(event);
    const result = createEvent(event, touch, target);
    lastPosition = result.position.slice();
    lastTime = Date.now();
    emitter.emit('down', result);
  }

  function mouseup (event) {
    const wasDragging = dragging;
    const touch = getCurrentEvent(event);
    let valid = true;
    if (filtered && event.changedTouches && (!touch || touch.identifier !== initialIdentifier)) {
      // skip entirely if this touch doesn't match expected
      valid = false;
    }
    if (touch && valid) {
      const result = createEvent(event, touch, target);
      initialIdentifier = null;
      if (wasDragging || result.inside) {
        // If the interaction was or is inside, emit an event
        emitter.emit('up', result);
      }
      if (lastPosition != null) {
        const nowTime = Date.now();
        const delta = nowTime - lastTime;
        const dist = distance(result.position, lastPosition);
        if (delta <= tapDelay && dist < tapDistanceThreshold) {
          emitter.emit('tap', result);
        }
        lastPosition = null;
      }
      dragging = false;
    }
  }

  function mousemove (event) {
    const touch = getCurrentEvent(event);
    if (touch) {
      // we didn't have an identifier and now we do
      if (filtered && event.changedTouches && touch.identifier != null) {
        const bounds = getElementBounds(target);
        if (isInsideBounds(touch, bounds)) {
          // ensure dragging is set to true
          dragging = true;
        }
      }
      const result = createEvent(event, touch, target);
      if (dragging || result.inside) {
        emitter.emit('move', result);
      }
    }
  }

  function attach () {
    if (attached) return;
    attached = true;
    target.addEventListener('touchstart', mousedown, eventOpts);
    parent.addEventListener('touchend', mouseup, eventOpts);
    parent.addEventListener('touchmove', mousemove, eventOpts);

    target.addEventListener('mousedown', mousedown, eventOpts);
    parent.addEventListener('mouseup', mouseup, eventOpts);
    parent.addEventListener('mousemove', mousemove, eventOpts);

    if (preventDefault) {
      window.addEventListener('dragstart', preventDefaultEvent, {
        passive: false
      });
      document.addEventListener('touchmove', preventDefaultEvent, {
        passive: false
      });
    }
  }

  function detach () {
    if (!attached) return;
    attached = false;
    target.removeEventListener('touchstart', mousedown);
    parent.removeEventListener('touchend', mouseup);
    parent.removeEventListener('touchmove', mousemove);

    target.removeEventListener('mousedown', mousedown);
    parent.removeEventListener('mouseup', mouseup);
    parent.removeEventListener('mousemove', mousemove);

    if (preventDefault) {
      window.removeEventListener('dragstart', preventDefaultEvent);
      document.removeEventListener('touchmove', preventDefaultEvent);
    }
  }

  function preventDefaultEvent (ev) {
    ev.preventDefault();
    return false;
  }

  function getCurrentEvent (event) {
    if (event.changedTouches) {
      const list = event.changedTouches;
      if (filtered) {
        if (initialIdentifier == null) {
          // first time tracking, mark identifier
          const first = getFirstTargetTouch(list) || list[0];
          initialIdentifier = first.identifier;
          return first;
        } else {
          // identifier exists, try to get it
          return getTouch(list, initialIdentifier);
        }
      } else {
        return list[0];
      }
    } else {
      return event;
    }
  }

  function getFirstTargetTouch (touches) {
    for (let i = 0; i < touches.length; i++) {
      const t = touches[i];
      if (t.target === target) return t;
    }
    return null;
  }

  function getTouch (touches, id) {
    for (let i = 0; i < touches.length; i++) {
      const t = touches[i];
      if (t.identifier === id) {
        return t;
      }
    }
    return null;
  }

  function createEvent (event, touch, target) {
    const bounds = getElementBounds(target);
    const position = getPosition(touch, target, bounds);
    const uv = getNormalizedPosition(position, bounds);
    return {
      dragging,
      touch,
      inside: isInsideBounds(touch, bounds),
      position,
      uv,
      event,
      bounds
    };
  }
};

function distance (a, b) {
  const x = b[0] - a[0];
  const y = b[1] - a[1];
  return Math.sqrt(x * x + y * y);
}

function isInsideBounds (event, bounds) {
  const { clientX, clientY } = event;
  return clientX >= bounds.left && clientX < bounds.right &&
    clientY >= bounds.top && clientY < bounds.bottom;
}

function getNormalizedPosition (position, bounds) {
  return [
    position[0] / bounds.width,
    position[1] / bounds.height
  ];
}

function getPosition (event, target, bounds) {
  const { clientX, clientY } = event;
  const x = clientX - bounds.left;
  const y = clientY - bounds.top;
  return [ x, y ];
}

function getElementBounds (element) {
  if (element === window ||
      element === document ||
      element === document.body) {
    return {
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      width: window.innerWidth,
      height: window.innerHeight
    };
  } else {
    return element.getBoundingClientRect();
  }
}

function isDOMNode (obj) {
  if (!obj || obj == null) return false;
  const winEl = typeof window !== 'undefined' ? window : null;
  return obj === winEl || (typeof obj.nodeType === 'number' && typeof obj.nodeName === 'string');
}
