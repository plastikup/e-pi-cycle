import { type EpicycleState, type Coord } from "./types";
import { Pen } from "./pen";
import { getCoordsDistance } from "./utils";
import { DISTANCE_BETWEEN_STROKE_COORDS } from "./main";

export class EpicyclePen {
  private pen: Pen;
  private firstStrokeTimestamp: number = 0;
  private queueFirstStrokeTimestampReset: boolean = false;
  private static DFT_ANIMATION_LENGTH_TS = 7_000;

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
    this.queueFirstStrokeTimestampReset = true;
    this.pathCoords.length = 0;
  }

  public draw() {
    // reset counter if new path
    if (this.queueFirstStrokeTimestampReset) {
      this.firstStrokeTimestamp = Date.now();
      this.queueFirstStrokeTimestampReset = false;
    }

    // get content to draw
    const progress = ((Date.now() - this.firstStrokeTimestamp) / EpicyclePen.DFT_ANIMATION_LENGTH_TS) % 1;
    const isFirstIteration = Date.now() - this.firstStrokeTimestamp <= EpicyclePen.DFT_ANIMATION_LENGTH_TS;
    const { circles, drawCoord } = this.getEpicycleAtTime(progress);

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
