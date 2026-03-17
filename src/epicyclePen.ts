import { type EpicycleState, type Coord } from "./types";
import { Pen } from "./pen";
import { getCoordsDistance } from "./utils";
import { DISTANCE_BETWEEN_STROKE_COORDS } from "./main";

export class EpicyclePen {
  private pen: Pen;
  private progressT: number = 0;

  private readonly pathCoords: Coord[] = [];
  private getEpicycleAtTime: (t: number) => EpicycleState;

  constructor(
    pen: Pen,
    getEpicycleAtTime: typeof this.getEpicycleAtTime,
  ) {
    this.pen = pen;
    this.getEpicycleAtTime = getEpicycleAtTime;
  }

  public resetCounter() {
    this.progressT = 0
    this.pathCoords.length = 0;
  }

  public draw() {
    // get content to draw
    const { circles, drawCoord, suggestedNextT } = this.getEpicycleAtTime(this.progressT);
    const isFirstIteration = this.progressT <= 1;
    this.progressT = suggestedNextT;

    // only save coords once in a while
    if (isFirstIteration && (
      this.pathCoords.length == 0 ||
      getCoordsDistance(this.pathCoords.at(-1)!, drawCoord) > DISTANCE_BETWEEN_STROKE_COORDS
    )) this.pathCoords.push(drawCoord);

    //* drawing
    // result (what the user is drawing)
    this.pen.line(...this.pathCoords).stroke('#FFF', 1);
    // circles/vectors
    for (const circle of circles) {
      this.pen.circle(circle[0], circle[1]).stroke('#666', 1);
    }
    // line connecting center of circles/vectors
    this.pen.line(...circles.map(([coord]) => coord)).stroke('#666', 1);
  }
}
