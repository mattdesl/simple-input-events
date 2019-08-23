const canvasSketch = require('canvas-sketch');
const createInput = require('./');

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

  input.on('down', ({ position, dragging, inside }) => {
    console.log('Pointer down');
    mouse = position;
    isInside = inside;
    isDragging = dragging;
    render();
  });

  input.on('up', ({ position, dragging, inside }) => {
    console.log('Pointer up');
    mouse = position;
    isInside = inside;
    isDragging = false;
    render();
  });

  input.on('move', ({ position, dragging, inside }) => {
    mouse = position;
    isInside = inside;
    isDragging = dragging;
    render();
  });

  return {
    render ({ context, width, height, styleWidth, styleHeight }) {
      context.fillStyle = 'white';
      context.fillRect(0, 0, width, height);

      if (mouse != null) {
        context.fillStyle = isInside ? 'green' : 'red';
        context.beginPath();
        const [ offsetX, offsetY ] = mouse;
        const x = offsetX / styleWidth * width;
        const y = offsetY / styleHeight * height;
        context.arc(x, y, width * (isDragging ? 0.1 : 0.05), 0, Math.PI * 2, false);
        context.fill();
      }
    },
    unload () {
      input.dispose();
    }
  }
};

canvasSketch(sketch, settings);
