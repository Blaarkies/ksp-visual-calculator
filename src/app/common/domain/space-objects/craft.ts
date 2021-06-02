import { SpaceObject, SpaceObjectType } from './space-object';
import { Vector2 } from '../vector2';
import { ImageUrls } from '../image-urls';
import { CraftType } from './craft-type';
import { Antenna } from '../antenna';
import { Group } from '../group';
import { BehaviorSubject } from 'rxjs';

export class Craft extends SpaceObject {

  spriteLocation: Vector2;

  get displayAltitude(): string {
    // performance impact on this function seems minimal, since its called from inside an *ngIf
    let soiParent = this.celestialBodies$.value
      .filter(cb => !cb.sphereOfInfluence || this.location.distance(cb.location) <= cb.sphereOfInfluence)
      .sort((a, b) => a.location.distance(this.location) - b.location.distance(this.location))
      .first();

    let distance = this.location.distance(soiParent.location) - soiParent.equatorialRadius;

    return `${distance.coerceAtLeast(0).toSi(3)}m`;
  }

  constructor(label: string,
              public craftType: CraftType,
              antennae: Group<Antenna>[] = [],
              private celestialBodies$: BehaviorSubject<SpaceObject[]>) {
    super(30, label, ImageUrls.CraftIcons, 'freeMove', SpaceObjectType.Craft, antennae);
    this.spriteLocation = craftType.iconLocation;
  }

}
