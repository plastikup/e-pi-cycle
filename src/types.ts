export type Coord = [number, number];

export interface FillOption {
  fill: (fillStyle?: string) => void;
}
export interface StrokeOption {
  stroke: (strokeStyle?: string, lineWidth?: number) => void;
}
export interface DrawOptions extends FillOption, StrokeOption { }


export type EpicycleCircle = [Coord, number];
export interface EpicycleState {
  circles: EpicycleCircle[];
  drawCoord: Coord;
  suggestedNextT: number;
}


export interface SvgTemplate {
  name: string;
  path: string;
  data: string;
}

export type AtPoint = (atPoint: number) => DOMPoint;
