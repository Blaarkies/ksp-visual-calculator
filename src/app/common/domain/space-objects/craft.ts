import { SpaceObject, SpaceObjectType } from './space-object';
import { Vector2 } from '../vector2';
import { ImageUrls } from '../image-urls';
import { CraftType } from './craft-type';
import { Antenna } from '../antenna';
import { Group } from '../group';
import { SpaceObjectContainerService } from '../../../services/space-object-container.service';

export class Craft extends SpaceObject {

  spriteLocation: Vector2;

  get displayAltitude(): string {
    // performance impact on this function seems minimal, since its called from inside an *ngIf
    let soiParent = SpaceObjectContainerService.instance
      .getSoiParent(this.location);

    let distance = this.location.distance(soiParent.location) - soiParent.equatorialRadius;

    return `${distance.coerceAtLeast(0).toSi(3)}m`;
  }

  constructor(label: string,
              public craftType: CraftType,
              antennae: Group<Antenna>[] = []) {
    super(30, label, ImageUrls.CraftIcons, 'soiLock', SpaceObjectType.Craft, antennae);
    this.spriteLocation = craftType.iconLocation;
  }

}
