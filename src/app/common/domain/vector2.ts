export class Vector2 {

  constructor(public x: number = null,
              public y: number = null) {
  }

  set(xy: number[]) {
    [this.x, this.y] = xy;
  }

  distance(other: Vector2) {
    return Math.hypot(this.x - other.x, this.y - other.y);
  }

  add(x: number, y: number) {
    this.x += x;
    this.y += y;
  }

}
