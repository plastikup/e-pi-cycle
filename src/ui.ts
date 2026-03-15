import { Pen } from './pen';

export class Ui {
  private pen: Pen;

  constructor(pen: Pen) {
    this.pen = pen;
  }

  public main(framerate: number) {
    this.pen.text(framerate.toFixed(0), [0, 0], ['left', 'top']).fill('white');
  }
}
