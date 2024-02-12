import { ConstrainLocationFunction } from './constrain-location-function';
import { OrbitParameterData } from './space-objects/orbit-parameter-data';
import { MoveType } from './space-objects/move-type';
import { Vector2 } from './vector2';

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

  static soiLock(craft: Vector2, planet: Vector2): ConstrainLocationFunction {
    let {x: dx, y: dy} = craft.subtractVector2Clone(planet);

    return (x, y) => {
      return [x + dx, y + dy];
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

  static fromMoveType(moveType: MoveType,
                      data: OrbitParameterData): ConstrainLocationFunction {
    switch (moveType) {
      case 'noMove':
        return LocationConstraints.noMove(data.xy);
      case 'freeMove':
        return LocationConstraints.anyMove(data.xy);
      case 'soiLock':
        return LocationConstraints.soiLock(Vector2.fromList(data.xy), data.parent?.location ?? Vector2.zero);
      case 'orbital':
        return LocationConstraints.circularMove(data.xy, data.r);
      default:
        throw new Error(`${moveType} is not a valid moveType`);
    }
  }

}
