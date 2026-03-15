import { type Coord } from './types';
import { DISTANCE_BETWEEN_STROKE_COORDS } from './main';
import { getCoordsDistance } from './utils';


export class InputCapturer {
  private canvas: HTMLCanvasElement;
  private mouseDown: boolean = false;

  public readonly coords: Coord[] = [];
  get nonempty() { return !!this.coords.length }
  public empty() { this.coords.length = 0; }

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.initCanvasListeners();
  }

  private initCanvasListeners() {
    // mouse up and down listeners
    this.canvas.addEventListener('mousedown', (event: MouseEvent) => {
      this.mouseDown = true;

      // add new coord
      const coord: Coord = [event.offsetX, event.offsetY];
      this.coords.push(coord);
    });
    this.canvas.addEventListener('mouseup', () => {
      this.mouseDown = false
    });

    // drawing listener
    this.canvas.addEventListener('mousemove', (event: MouseEvent) => {
      if (!this.mouseDown) return;

      // get coord and check if enough distance between last coord
      const coord: Coord = [event.offsetX, event.offsetY];
      if (
        this.coords.length &&
        getCoordsDistance(this.coords.at(-1)!, coord) < DISTANCE_BETWEEN_STROKE_COORDS
      ) return;

      // add coord
      this.coords.push(coord);
    });
  }
}
