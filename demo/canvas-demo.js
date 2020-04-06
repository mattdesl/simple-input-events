const canvasSketch = require('canvas-sketch');
const createInput = require('../');

const settings = {
  dimensions: [ 2048, 2048 ]
};

const sketch = ({ render, canvas }) => {
  const input = createInput({
    target: canvas,
    preventDefault: true
  });

  let mouse = null;
  let isInside = false;
  let isDragging = false;
  let color = 'white';
  let tapped = false;

  let start, end;

  input.on('down', ({ uv, bounds, dragging, inside }) => {
    console.log('Pointer down');
    mouse = uv;
    start = uv.slice();
    end = null;
    isInside = inside;
    isDragging = dragging;
    render();
  });

  input.on('up', ({ uv, dragging, inside }) => {
    console.log('Pointer up');
    mouse = uv;
    end = uv.slice();
    isInside = inside;
    isDragging = false;
    tapped = false;
    render();
  });

  input.on('move', ({ uv, dragging, inside }) => {
    mouse = uv;
    isInside = inside;
    isDragging = dragging;
    render();
  });

  input.on('tap', ({ uv, dragging, inside }) => {
    console.log('Pointer tapped');
    tapped = true;
    randomize();
    render();
  });

  randomize();

  return {
    render (props) {
      const { context, width, height, styleWidth, styleHeight } = props;
      context.fillStyle = color;
      context.fillRect(0, 0, width, height);

      const tapColor = tapped ? 'green' : 'tomato';
      if (start) drawCircle(props, start, 0.01, tapColor);
      if (end) drawCircle(props, end, 0.01, tapColor);
      if (start && end) {
        context.beginPath();
        [ start, end ].forEach(p => {
          const [ u, v ] = p;
          const tx = u * width;
          const ty = v * height;
          context.lineTo(tx, ty);
        });
        context.lineWidth = 0.005 * width;
        context.strokeStyle = tapColor;
        context.stroke();
      }

      if (mouse != null) {
        const color = isInside ? 'black' : 'tomato';
        context.lineWidth = 0.005 * width;
        context.strokeStyle = color;
        drawCircle(props, mouse, (isDragging ? 0.1 : 0.05), color, true);
      }
    },
    unload () {
      input.dispose();
    }
  };

  function drawCircle (props, pos, radius, color, stroke) {
    const { context, width, height, styleWidth, styleHeight } = props;
    context.fillStyle = color;
    context.beginPath();
    const [ u, v ] = pos;
    const x = u * width;
    const y = v * height;
    context.arc(x, y, width * radius, 0, Math.PI * 2, false);
    if (stroke) context.stroke();
    else context.fill();
  }

  function randomize () {
    color = `hsl(
      ${Math.floor(Math.random() * 360)},
      50%,
      80%
    )`;
  }
};

canvasSketch(sketch, settings);
