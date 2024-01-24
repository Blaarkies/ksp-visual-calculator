import {
  Observable,
  Subject,
} from 'rxjs';
import { merge } from 'rxjs';
import { Group } from '../../../common/domain/group';
import { Craft } from '../../../common/domain/space-objects/craft';
import { Planetoid } from '../../../common/domain/space-objects/planetoid';
import { Vector2 } from '../../../common/domain/vector2';
import { Memoize } from '../../../common/memoize.decorator';
import { Antenna } from './antenna';

export type CanCommunicate = Planetoid | Craft;

export class AntennaSignal {

  id: string;
  change$: Observable<void>;
  relayChange$ = new Subject<void>();

  private hasRelayStrength: boolean;

  constructor(public nodes: CanCommunicate[],
              private getRangeModifier: () => number) {
    this.id = Math.random().toString().slice(2);
    this.change$ = merge(...nodes.map(n => n.change$));
  }

  destroy() {
    this.relayChange$.complete();
  }

  get textLocation(): Vector2 {
    return this.memoizeTextLocation(
      this.nodes[0].location.x,
      this.nodes[0].location.y,
      this.nodes[1].location.x,
      this.nodes[1].location.y);
  }

  @Memoize()
  private memoizeTextLocation(...rest: number[]): Vector2 {
    return this.nodes[0].location
      .lerpClone(this.nodes[1].location);
  }

  get displayDistance(): string {
    return this.memoizeDisplayDistance(
      this.nodes[0].location.x,
      this.nodes[0].location.y,
      this.nodes[1].location.x,
      this.nodes[1].location.y,
    );
  }

  @Memoize()
  private memoizeDisplayDistance(...rest: number[]): string {
    let distance = this.nodes[0].location
      .distance(this.nodes[1].location)
      .toSi(3);
    return `${distance}m`;
  }

  get offsetVector(): Vector2 {
    return this.memoizeOffsetVector(
      this.nodes[0].location.x,
      this.nodes[0].location.y,
      this.nodes[1].location.x,
      this.nodes[1].location.y);
  }

  @Memoize()
  private memoizeOffsetVector(...rest: number[]): Vector2 {
    let a = this.nodes[0].location;
    let b = this.nodes[1].location;
    let direction = a.direction(b);
    let perpendicular = direction + Math.PI * .5;

    return Vector2.fromDirection(perpendicular, 1);
  }

  get angleDeg(): number {
    return this.memoizeAngleDeg(
      this.nodes[0].location.x,
      this.nodes[0].location.y,
      this.nodes[1].location.x,
      this.nodes[1].location.y);
  }

  @Memoize()
  private memoizeAngleDeg(...rest: number[]): number {
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

  @Memoize()
  private memoizeColor(strength: number): string {
    let power = Math.round(strength * 15);
    let red = (31 - power * 2).coerceAtMost(15);
    let green = (power * 2).coerceAtMost(15);
    return `#${red.toString(16)}${green.toString(16)}0`;
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

  @Memoize({strategy: 'variadic'})
  private memoizeStrengthTotal(hasRelay1: boolean,
                               hasRelay2: boolean,
                               ...rest: (number | Group<Antenna>[])[])
    : number {
    return this.getSignalStrength(hasRelay1, hasRelay2,
      node => node.communication.powerRatingTotal());
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

  @Memoize({strategy: 'variadic'})
  private memoizeStrengthRelay(hasRelay1: boolean,
                               hasRelay2: boolean,
                               ...rest: (number | Group<Antenna>[])[])
    : number {
    let relayStrength = this.getSignalStrength(hasRelay1, hasRelay2,
      node => node.communication.powerRatingRelay());
    let hasRelayStrength = !!relayStrength;
    let hasRelayTurnedOnOrOff = this.hasRelayStrength === undefined
      || hasRelayStrength !== this.hasRelayStrength;
    if (hasRelayTurnedOnOrOff) {
      this.hasRelayStrength = hasRelayStrength;
      this.relayChange$.next();
    }
    return relayStrength;
  }

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

  getHostToClientSignalStrength(hostNode: CanCommunicate): number {
    let client = this.nodes.find(n => n !== hostNode);

    return this.getRelayToTotalSignalStrength(
      hostNode,
      client,
      this.nodes[0].communication.containsRelay(),
      this.nodes[1].communication.containsRelay(),
      this.nodes[0].location.x,
      this.nodes[0].location.y,
      this.nodes[1].location.x,
      this.nodes[1].location.y,
      this.nodes[0].communication.antennaeFull,
      this.nodes[1].communication.antennaeFull);
  }

  // SpaceObjects (host/client) contain properties that trip up the default serializer
  @Memoize({
    serializer: args => args[0].id
      + args[1].id
      + JSON.stringify(args.slice(2)),
  })
  private getRelayToTotalSignalStrength(
    hostNode: CanCommunicate,
    clientNode: CanCommunicate,
    ...rest: (boolean | number | Group<Antenna>[])[]
  ): number {
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
