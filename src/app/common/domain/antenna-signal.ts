import memoize from 'fast-memoize';
import { Subject } from 'rxjs';
import { Craft } from './space-objects/craft';
import { Planetoid } from './space-objects/planetoid';
import { Vector2 } from './vector2';

export type CanCommunicate = Planetoid | Craft;

export class AntennaSignal {

  id: string;

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
      this.nodes[0].communication.containsRelay(),
      this.nodes[1].communication.containsRelay(),
      this.nodes[0].location.x,
      this.nodes[0].location.y,
      this.nodes[1].location.x,
      this.nodes[1].location.y,
      this.nodes[0].communication.antennaeFull,
      this.nodes[1].communication.antennaeFull,
    );
  }

  get strengthRelay(): number {
    return this.memoizeStrengthRelay(
      this.nodes[0].communication.containsRelay(),
      this.nodes[1].communication.containsRelay(),
      this.nodes[0].location.x,
      this.nodes[0].location.y,
      this.nodes[1].location.x,
      this.nodes[1].location.y,
      this.nodes[0].communication.antennaeFull,
      this.nodes[1].communication.antennaeFull,
    );
  }

  relayChange$ = new Subject<void>();

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

    return Vector2.fromDirection(perpendicular, 1);
  });

  private memoizeColor = memoize(strength => {
    let power = Math.round(strength * 15);
    let red = (31 - power * 2).coerceAtMost(15);
    let green = (power * 2).coerceAtMost(15);
    return `#${red.toString(16)}${green.toString(16)}0`;
  });

  private memoizeStrengthTotal = memoize((hasRelay1, hasRelay2, ...rest) =>
      this.getSignalStrength(hasRelay1, hasRelay2,
          node => node.communication.powerRatingTotal()),
    {strategy: memoize.strategies.variadic});

  private hasRelayStrength: boolean;

  private memoizeStrengthRelay = memoize((hasRelay1, hasRelay2, ...rest) => {
      let relayStrength = this.getSignalStrength(hasRelay1, hasRelay2,
        node => node.communication.powerRatingRelay());
      let hasRelayStrength = !!relayStrength;
      if (this.hasRelayStrength === undefined || hasRelayStrength !== this.hasRelayStrength) {
        this.hasRelayStrength = hasRelayStrength;
        this.relayChange$.next();
      }
      return relayStrength;
    },
    {strategy: memoize.strategies.variadic});

  private getSignalStrength(hasRelay1: boolean,
                            hasRelay2: boolean,
                            powerRatingCallback: (node: CanCommunicate) => number)
    : number {
    if (!hasRelay1 && !hasRelay2) {
      return 0;
    }

    let distance = this.nodes[0].location.distance(this.nodes[1].location);
    let maxRange = (this.getRangeModifier()
      * powerRatingCallback(this.nodes[0])
      * powerRatingCallback(this.nodes[1]))
      .sqrt();

    if (distance > maxRange) {
      return 0;
    }
    let x = 1 - distance / maxRange; // relative distance
    let signalStrength = (3 - 2 * x) * x.pow(2);
    return signalStrength;
  }

  constructor(public nodes: CanCommunicate[],
              private getRangeModifier: () => number) {
    this.id = Math.random().toString().slice(2);
  }

  destroy() {
    this.relayChange$.complete();
  }

  getHostToClientSignalStrength(hostNode: CanCommunicate,
                                clientNode: CanCommunicate): number {
    if (!hostNode.communication.containsRelay()) {
      return 0;
    }

    let distance = hostNode.location.distance(clientNode.location);
    let maxRange = (this.getRangeModifier()
      * hostNode.communication.powerRatingRelay()
      * clientNode.communication.powerRatingTotal())
      .sqrt();

    if (distance > maxRange) {
      return 0;
    }
    let x = 1 - distance / maxRange; // relative distance
    let signalStrength = (3 - 2 * x) * x.pow(2);
    return signalStrength;
  }

}
