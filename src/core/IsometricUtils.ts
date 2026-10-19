/**
 * 2.5D Perspective and coordinate utility.
 * In 2.5D top-down view, (x, y) are direct world pixels:
 * x = distance along boulevard towards Jantar Mantar (East).
 * y = cross-road position (North to South).
 * Depth is strictly ordered by Y position so characters in front render over background objects.
 */
export class IsometricUtils {
  public static worldToScreen(wx: number, wy: number): { x: number; y: number } {
    return { x: wx, y: wy };
  }

  public static getDepth(_wx: number, wy: number, elevation = 0): number {
    return Math.floor(wy * 10 + elevation);
  }
}
