import { type Coord, type StrokeOption, type DrawOptions, type FillOption } from './types';


export class Pen {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  private drawOptions: DrawOptions = {
    stroke: (strokeStyle, lineWidth) => {
      this.ctx.save();
      if (strokeStyle) this.ctx.strokeStyle = strokeStyle;
      if (lineWidth) this.ctx.lineWidth = lineWidth;
      this.ctx.stroke();
      this.ctx.restore();
    },
    fill: (fillStyle) => {
      this.ctx.save();
      if (fillStyle) this.ctx.fillStyle = fillStyle;
      this.ctx.fill();
      this.ctx.restore();
    },
  }

  public clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  public circle(coord: Coord, radius: number): DrawOptions {
    this.ctx.beginPath();
    this.ctx.arc(...coord, radius, 0, 2 * Math.PI);
    return this.drawOptions;
  }
  public line(...coords: Coord[]): StrokeOption {
    if (coords.length == 0) throw new Error('No coordinates were provided.');

    this.ctx.beginPath();
    this.ctx.moveTo(...coords.at(0)!);
    for (const coord of coords) {
      this.ctx.lineTo(...coord);
    }

    return {
      stroke: (strokeStyle, lineWidth) => {
        this.ctx.save();
        if (strokeStyle) this.ctx.strokeStyle = strokeStyle;
        if (lineWidth) this.ctx.lineWidth = lineWidth;
        this.ctx.stroke();
        this.ctx.restore();
      }
    }
  }
  public text(text: string, coord: Coord, align: [CanvasTextAlign, CanvasTextBaseline]): FillOption {
    return {
      fill: (fillStyle) => {
        this.ctx.save();
        if (fillStyle) this.ctx.fillStyle = fillStyle;
        [this.ctx.textAlign, this.ctx.textBaseline] = align;
        this.ctx.fillText(text, ...coord);
        this.ctx.restore();
      },
    }
  }
}
