import './style.css';
import { Pen } from './pen';
import { EpicyclePen } from './epicyclePen';
import { Dft } from './dft';
import { InputCapturer } from './inputCapturer';
import { Ui } from './ui';
import { TemplatesHandler } from './templatesHandler';

export const DISTANCE_BETWEEN_STROKE_COORDS = 16; // the minimum distance required between two points to be registered and drawn


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <canvas width=768 height=768></canvas>
  </div>
  <div id='templatesContainer' style="display: flex; justify-content: space-evenly;"></div>
`;

// initialize drawing board
const canvas = document.querySelector('canvas')!;
const ctx = canvas.getContext('2d')!;
ctx.font = '21px Arial';

// initialize templates
const templatesHandler = new TemplatesHandler('./assets/pi-templates/');
const templatesContainer = document.querySelector('#templatesContainer')!;
const shapeAtPoint = templatesHandler.renderTemplates(templatesContainer, canvas, 128, 128);

// initialize classes and capturers
const pen = new Pen(canvas, ctx);
const dft = new Dft([canvas.width / 2, canvas.height / 2]);
const epicyclePen = new EpicyclePen(pen, dft.getStateAtTime.bind(dft));
const inputCapturer = new InputCapturer(canvas);
const ui = new Ui(pen);

// capture mouseup event to initialize DFT calculations
canvas.addEventListener('mouseup', () => {
  dft.recomputeFromCoords(inputCapturer.coords);
  // reset or prep other modules
  epicyclePen.resetCounter();
  inputCapturer.empty();
});


templatesContainer.querySelectorAll('svg').forEach((svgElement) =>
  svgElement.addEventListener('click', () => {
    const atPoint = shapeAtPoint[svgElement.id];
    if (!atPoint) throw new Error(`Cannot find atPoint function for SVG shape named ${svgElement.id}`);
    dft.recomputeFromAtPointFunction(atPoint, 1200);
    // reset or prep other modules
    epicyclePen.resetCounter();
    inputCapturer.empty();
  })
)


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
