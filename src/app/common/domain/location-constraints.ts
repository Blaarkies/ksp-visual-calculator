import { ConstrainLocationFunction } from './constrain-location-function';
import { OrbitParameterData } from './space-objects/orbit-parameter-data';

export class LocationConstraints {

  static noMove([oldX, oldY]: number[]): ConstrainLocationFunction {
    return (x, y) => [oldX, oldY];
  }

  static anyMove([oldX, oldY]: number[]): ConstrainLocationFunction {
    return (x, y) => {
      return (x === null || y === null)
        ? [oldX, oldY]
        : [x, y];
    };
  }

  static circularMove([centerX, centerY]: number[], r: number): ConstrainLocationFunction {
    return (x, y) => {
      let direction = Math.atan2(y - centerY, x - centerX);
      return [
        centerX + r * Math.cos(direction),
        centerY + r * Math.sin(direction)];
    };
  }

  static fromMoveType(moveType: 'noMove' | 'freeMove' | 'orbital',
                      data: OrbitParameterData): ConstrainLocationFunction {
    switch (moveType) {
      case 'noMove':
        return LocationConstraints.noMove(data.xy);
      case 'freeMove':
        return LocationConstraints.anyMove(data.xy);
      case 'orbital':
        return LocationConstraints.circularMove(data.xy, data.r);
      default:
        console.error(`${moveType} is not a valid moveType`);
    }
  }

}
