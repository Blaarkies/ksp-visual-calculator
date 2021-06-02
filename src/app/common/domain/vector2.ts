export class Vector2 {

  constructor(public x: number = null,
              public y: number = null) {
  }

  set(xy: number[]): Vector2 {
    [this.x, this.y] = xy;
    return this;
  }

  setVector2(other: Vector2): Vector2 {
    this.x = other.x;
    this.y = other.y;
    return this;
  }

  distance(other: Vector2): number {
    return Math.hypot(this.x - other.x, this.y - other.y);
  }

  add(x: number, y: number): Vector2 {
    this.x += x;
    this.y += y;
    return this;
  }

  addVector2(other: Vector2): Vector2 {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  multiply(factor: number): Vector2 {
    this.x *= factor;
    this.y *= factor;
    return this;
  }

  multiplyVector2(factor: Vector2): Vector2 {
    this.x *= factor.x;
    this.y *= factor.y;
    return this;
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  lerp(other: Vector2, ratio: number = .5): Vector2 {
    this.x = this.x.lerp(other.x, ratio);
    this.y = this.y.lerp(other.y, ratio);
    return this;
  }

  lerpClone(other: Vector2, ratio: number = .5): Vector2 {
    return this.clone().lerp(other, ratio);
  }

  toString(): string {
    return `${this.x} ${this.y}`;
  }

  direction(other: Vector2): number {
    return Math.atan2(other.y - this.y, other.x - this.x);
  }

  static fromDirection(angle: number, distance: number = 1): Vector2 {
    return new Vector2(Math.cos(angle) * distance, Math.sin(angle) * distance);
  }
}
