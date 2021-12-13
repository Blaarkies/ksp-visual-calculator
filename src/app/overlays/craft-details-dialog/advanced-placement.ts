import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { Vector2 } from '../../common/domain/vector2';

export class AdvancedPlacement {

  get location(): Vector2 {
    let relativeLocation = Vector2.fromDirection(-this.angle, this.altitude + this.orbitParent.equatorialRadius);
    return this.orbitParent.location.addVector2Clone(relativeLocation);
  }

  constructor(public orbitParent: SpaceObject,
              public altitude: number,
              public angle: number) {
  }

  static fromObject(object: { orbitParent, altitude, angle },
                    angleConvert?: AngleConvertType): AdvancedPlacement {
    return new AdvancedPlacement(object.orbitParent, object.altitude,
      angleConvert === 'deg->rad'
        ? object.angle * .017453293
        : angleConvert === 'rad->deg'
          ? object.angle * 57.295779513
          : object.angle);
  }

}

export type AngleConvertType = 'deg->rad' | 'rad->deg';
