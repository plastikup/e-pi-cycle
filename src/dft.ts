import { type AtPoint, type Coord, type EpicycleCircle, type EpicycleState } from './types';

// DFT stands for discrete fourier transform
export class Dft {
  private startCoords: Coord;

  private readonly coefficients: { freq: number, re: number, im: number }[] = [];
  get nonempty() { return !!this.coefficients.length }
  public empty() { this.coefficients.length = 0 }

  private static readonly SAMPLES = 400;

  constructor(startCoords: Coord) {
    this.startCoords = startCoords;
  }

  private interpolateCoords(coords: Coord[]): Coord[] {
    // do not compress data
    if (coords.length > Dft.SAMPLES) return coords;

    const smoothCoords: Coord[] = [];

    for (let i = 0; i < Dft.SAMPLES; i++) {
      // map current sample to a position in the input array
      const mappedIndex = (i / Dft.SAMPLES) * coords.length;

      const i0 = Math.floor(mappedIndex);
      const i1 = (i0 + 1) % coords.length; // allow wrapping back at index 0 when overflowing

      const weight = mappedIndex - i0;

      const p0 = coords[i0];
      const p1 = coords[i1];

      // interpolation
      const x = p0[0] + (p1[0] - p0[0]) * weight;
      const y = p0[1] + (p1[1] - p0[1]) * weight;

      smoothCoords.push([x, y]);
    }

    return smoothCoords;
  }

  public recomputeFromCoords(roughCoords: Coord[]) {
    if (roughCoords.length == 0) throw new Error('Tried computing from an empty array of coordinates.');

    // smooth out coords to be Dft.SAMPLES length or more
    roughCoords.push(roughCoords.at(0)!);
    const coords = this.interpolateCoords(roughCoords);

    this.computeCoefficients(coords);
  }

  public recomputeFromAtPointFunction(atPoint: AtPoint, samplesOverwrite?: number) {
    const coords: Coord[] = Array.from(
      { length: samplesOverwrite ?? Dft.SAMPLES },
      (_, i) => atPoint(i / (samplesOverwrite ?? Dft.SAMPLES)),
    );
    this.computeCoefficients(coords);
  }

  private computeCoefficients(coords: Coord[]) {
    const N = coords.length;

    // empty arrays to build new ones
    this.coefficients.length = 0;

    // define the centered frequency bounds
    const startFreq = -Math.floor(N / 2);
    const endFreq = Math.ceil(N / 2);

    // Loop from -N/2 to N/2
    for (let n = startFreq; n < endFreq; n++) {
      let sumRe = 0;
      let sumIm = 0;

      for (let k = 0; k < N; k++) {
        // compute DFT using basic trigonometry
        const signalRe = coords[k][0] - this.startCoords[0];
        const signalIm = coords[k][1] - this.startCoords[1];

        const theta = -2 * Math.PI * n * k / N;
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);

        // complex multiplication equivalent: (signalRe + i*signalIm) * (cosTheta + i*sinTheta)
        sumRe += signalRe * cosTheta - signalIm * sinTheta;
        sumIm += signalRe * sinTheta + signalIm * cosTheta;
      }

      // add to coef arrays
      this.coefficients.push({
        freq: n, // this allows safely sorting the array
        re: sumRe / N,
        im: sumIm / N
      });
    }

    // sort by magnitude using Math.hypot (which natively calculates sqrt(re^2 + im^2))
    this.coefficients.sort((a, b) => Math.hypot(b.re, b.im) - Math.hypot(a.re, a.im));
  }

  public getStateAtTime(t: number): EpicycleState {
    const N = this.coefficients.length;
    if (N == 0) throw new Error('Tried compiling from an empty array of coefficients.');

    const circles: EpicycleCircle[] = [[this.startCoords, 0]];

    //* compute circles
    for (let i = 0; i < N; i++) {
      const lastCoord = circles.at(-1)![0];
      const { freq, re, im } = this.coefficients[i];

      // maths and etc
      const theta = 2 * Math.PI * freq * t;
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);

      // complex multiplication equivalent
      const circleRe = re * cosTheta - im * sinTheta;
      const circleIm = re * sinTheta + im * cosTheta;

      // circle characteristics
      const nextVector: Coord = [circleRe + lastCoord[0], circleIm + lastCoord[1]];
      const circleRadius = Math.hypot(circleRe, circleIm);

      // update previous circle radius
      circles.at(-1)![1] = circleRadius

      // add new circle center
      circles.push([nextVector, 0]);
    }

    // last circle isn't one; its the drawn pixel
    const drawCoord = circles.pop()![0];

    // suggested next t tries to iterate on every element of the coef list
    const suggestedNextT = t + 1 / N;

    return { circles, drawCoord, suggestedNextT };
  }
}
