import { type Coord } from "./types";

/**
 * Compute the pythagorean distance betweem two given 2D points
 */
export function getCoordsDistance(coord1: Coord, coord2: Coord): number {
  return Math.hypot(coord1[0] - coord2[0], coord1[1] - coord2[1]);
}
