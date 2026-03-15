import './style.css';
import { Pen } from './pen';
import { EpicyclePen } from './epicyclePen';
import { Dft } from './dft';
import { InputCapturer } from './inputCapturer';
import { Ui } from './ui';

export const DISTANCE_BETWEEN_STROKE_COORDS = 16; // the minimum distance required between two points to be registered and drawn


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <canvas width=768 height=768></canvas>
  </div>
`;


const canvas = document.querySelector('canvas')!;
const ctx = canvas.getContext('2d')!;
ctx.font = '21px Arial';

// initialize classes and capturers
const pen           = new Pen(canvas, ctx);
const dft           = new Dft([canvas.width / 2, canvas.height / 2]);
const epicyclePen   = new EpicyclePen(pen, dft.getStateAtTime.bind(dft));
const inputCapturer = new InputCapturer(canvas);
const ui            = new Ui(pen);

// capture mouseup event to initialize DFT calculations
canvas.addEventListener('mouseup', () => {
  dft.computeDftFromNewCoords(inputCapturer.coords);
  // reset or prep other modules
  epicyclePen.resetCounter();
  inputCapturer.empty();
});


// main loop
let last_t = Date.now();
function main(t: number) {
  const dt = t - last_t;
  const framerate = 1000 / dt;
  last_t = t;

  pen.clear();

  if (inputCapturer.nonempty) {
    // input has content; draw user's drawing
    pen.line(...inputCapturer.coords, inputCapturer.coords.at(0)!).stroke('white', 1);
  } else if (dft.nonempty) {
    // dft has content; draw epicycles
    epicyclePen.draw();
  }
  ui.main(framerate);

  requestAnimationFrame(main);
}
requestAnimationFrame(main);
