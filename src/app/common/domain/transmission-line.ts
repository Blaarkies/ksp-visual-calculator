import { SpaceObject } from './space-objects/space-object';
import { SetupService } from '../../services/setup.service';
import memoize from 'fast-memoize';
import { Vector2 } from './vector2';

export class TransmissionLine {

  get textLocation(): Vector2 {
    return this.memoizeTextLocation(
      this.nodes[0].location.x,
      this.nodes[0].location.y,
      this.nodes[1].location.x,
      this.nodes[1].location.y);
  }

  get displayDistance(): string {
    return this.memoizeDisplayDistance(
      this.nodes[0].location.x,
      this.nodes[0].location.y,
      this.nodes[1].location.x,
      this.nodes[1].location.y,
    );
  }

  get offsetVector(): Vector2 {
    return this.memoizeOffsetVector(
      this.nodes[0].location.x,
      this.nodes[0].location.y,
      this.nodes[1].location.x,
      this.nodes[1].location.y);
  }

  get angleDeg(): number {
    let radians = this.nodes[0].location.direction(
      this.nodes[1].location);
    return radians * 57.295779513;
  }

  get colorTotal(): string {
    return this.memoizeColor(this.strengthTotal);
  }

  get colorRelay(): string {
    return this.memoizeColor(this.strengthRelay);
  }

  get strengthTotal(): number {
    return this.memoizeStrengthTotal(
      this.nodes[0].hasRelay,
      this.nodes[1].hasRelay,
      this.nodes[0].location.x,
      this.nodes[0].location.y,
      this.nodes[1].location.x,
      this.nodes[1].location.y,
      this.nodes[0].antennae,
      this.nodes[1].antennae,
    );
  }

  get strengthRelay(): number {
    return this.memoizeStrengthRelay(
      this.nodes[0].hasRelay,
      this.nodes[1].hasRelay,
      this.nodes[0].location.x,
      this.nodes[0].location.y,
      this.nodes[1].location.x,
      this.nodes[1].location.y,
      this.nodes[0].antennae,
      this.nodes[1].antennae,
    );
  }

  private memoizeTextLocation = memoize((x1, y1, x2, y2) => {
    return this.nodes[0].location
      .lerpClone(this.nodes[1].location);
  });

  private memoizeDisplayDistance = memoize((x1, y1, x2, y2) => {
    let distance = this.nodes[0].location
      .distance(this.nodes[1].location)
      .toSi(3);
    return `${distance}m`;
  });

  private memoizeOffsetVector = memoize((x1, y1, x2, y2) => {
    let a = this.nodes[0].location;
    let b = this.nodes[1].location;
    let direction = a.direction(b);
    let perpendicular = direction + Math.PI * .5;

    return Vector2.fromDirection(perpendicular, 2);
  });

  private memoizeColor = memoize(strength => {
    let power = Math.round(strength * 15);
    let red = (31 - power * 2).coerceAtMost(15);
    let green = (power * 2).coerceAtMost(15);
    return `#${red.toString(16)}${green.toString(16)}0`;
  });

  private memoizeStrengthTotal = memoize((hasRelay1, hasRelay2, ...rest) =>
      this.getSignalStrength(hasRelay1, hasRelay2, node => node.powerRatingTotal),
    {strategy: memoize.strategies.variadic});

  private memoizeStrengthRelay = memoize((hasRelay1, hasRelay2, ...rest) =>
      this.getSignalStrength(hasRelay1, hasRelay2, node => node.powerRatingRelay),
    {strategy: memoize.strategies.variadic});

  private getSignalStrength(hasRelay1: boolean,
                            hasRelay2: boolean,
                            powerRatingCallback: (node: SpaceObject) => number) {
    if (!hasRelay1 && !hasRelay2) {
      return 0;
    }

    let distance = this.nodes[0].location.distance(this.nodes[1].location);
    let maxRange = (this.setupService.difficultySetting.rangeModifier
      * powerRatingCallback(this.nodes[0])
      * powerRatingCallback(this.nodes[1]))
      .sqrt();

    if (distance > maxRange) {
      return 0;
    }
    let x = 1 - distance / maxRange; // relativeDistance
    let signalStrength = (3 - 2 * x) * x.pow(2);
    return signalStrength;
  }

  constructor(public nodes: SpaceObject[],
              /*todo: use a better reference to an up to date difficulty setting*/
              private setupService: SetupService) {
  }


}
