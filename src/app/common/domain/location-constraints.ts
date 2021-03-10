import { ConstrainLocationFunction } from './constrain-location-function';
import { Circle } from './circle';

export class LocationConstraints {

  static noMove(oldX: number, oldY: number): ConstrainLocationFunction {
    return (x, y) => [oldX, oldY];
  };

  static circularMove(circle: Circle): ConstrainLocationFunction {
    return (x, y) => {
      let direction = Math.atan2(y - circle.y, x - circle.x);
      return [
        circle.x + circle.r * Math.cos(direction),
        circle.y + circle.r * Math.sin(direction)];
    };
  };

  static anyMove(oldX: number, oldY: number): ConstrainLocationFunction {
    return (x, y) => {
      return (x === null || y === null)
        ? [oldX, oldY]
        : [x, y];
    };
  };

}
