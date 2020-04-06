# simple-input-events

Unified mouse & touch event handler for desktop and mobile devices. Filters touch events down to a single finger and offsets the client position so it is relative to the target element.

```js
const createInputEvents = require('simple-input-events');

// create input events with a target element
const event = createInputEvents(canvas);

event.on('down', ({ position, event }) => {
  // mousedown / touchstart
  console.log(position); // [ x, y ]
  console.log(event); // original mouse/touch event 
});

event.on('up', ({ position, event }) => {
  // mouseup / touchend
  console.log(position); // [ x, y ]
  console.log(event); // original mouse/touch event 
});

event.on('move', ({ position, event, inside, dragging }) => {
  // mousemove / touchmove
  console.log(position); // [ x, y ]
  console.log(event); // original mouse/touch event 
  console.log(inside); // true if the mouse/touch is inside the element
  console.log(dragging); // true if the pointer was down/dragging
});

event.on('tap', ({ position, event }) => {
  // mouse / finger was 'clicked'
  console.log(position); // [ x, y ]
});
```

See [./demo.js](./demo.js) for an example.

## Install

Use [npm](https://npmjs.com/) to install.

```sh
npm install simple-input-events --save
```

## Usage

#### `handler = createInputEvents([opt])`

Creates input events with the below options `opt` (also accepts just a DOM element). By default, events are attached to `window`.

- `target` - (default window) the target element to attach events to
- `parent` - (default window) the parent element (usually window) to attach movement events, in order to detect drag events outside the target bounds
- `preventDefault` - (default false) if true, touch events will prevent default actions, typically useful for locking the page in place during tap events
- `filtered` - (default true) if true, finger events will be filtered down to a single finger, instead of allowing multiple fingers
- `passive` - (default true) if true, non-preventing events will use `{ passive: true }` as an option
- `tapDistanceThreshold` - (default 5) a distance threshold in pixels for tap events — if the movement between "down" and "up" is below this threshold, and below the `tapDelay`, it will trigger a "tap" event
- `tapDelay` - (default 300) a delay in milliseconds for tap events — if the time between "down" and "up" is below this delay, and below `tapDistanceThreshold`, it will trigger a "tap" event


#### `handler.on('down', ({ position, event, uv }))`

Handles 'down' / pointer start events on the target.

- `position` is the `[ x, y ]` position relative to the top left of the `target`
- `event` is the original mouse or touch event
- `uv` is a normalized UV (unit) space coordinate between 0..1 i.e. `position.xy / elementSize.xy`

#### `handler.on('up', ({ position, event, inside, uv }))`

Handles 'up' / pointer end events on the target.

- `position` is the `[ x, y ]` position relative to the top left of the `target`
- `event` is the original mouse or touch event
- `inside` is true if the event occurred with the pointer inside the target bounds
- `uv` is a normalized UV (unit) space coordinate between 0..1 i.e. `position.xy / elementSize.xy`

#### `handler.on('move', ({ position, event, inside, dragging, uv }))`

Handles 'move' / drag events on the target.

- `position` is the `[ x, y ]` position relative to the top left of the `target`
- `event` is the original mouse or touch event
- `inside` is true if the event occurred with the pointer inside the target bounds (may be outside in touch drag events)
- `dragging` is true if the pointer is considerd 'down' or in a drag state
- `uv` is a normalized UV (unit) space coordinate between 0..1 i.e. `position.xy / elementSize.xy`

#### `handler.on('tap', ({ position, event, uv }))`

Handles a 'tap' event, which is considered an event where the user pushes and releases quickly (by default below a 300 ms window) with the cursor in the same position (by default within a 10 px radius).

- `position` is the `[ x, y ]` position relative to the top left of the `target`
- `event` is the original mouse or touch event
- `uv` is a normalized UV (unit) space coordinate between 0..1 i.e. `position.xy / elementSize.xy`

#### `handler.disable()`

Detaches events from the target/parent elements.

#### `handler.enable()`

Re-attaches events from the target/parent elements if they had been detached.

#### `handler.target`

The read-only target element for the input handler.

#### `handler.parent`

The read-only parent element for the input handler.

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/simple-input-events/blob/master/LICENSE.md) for details.
