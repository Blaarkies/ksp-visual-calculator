import { SpaceObject } from './space-object';
import { Vector2 } from '../vector2';
import { ImageUrls } from '../image-urls';
import { CraftType } from './craft-type';
import { Antenna } from '../antenna';
import { Group } from '../group';
import { SpaceObjectContainerService } from '../../../services/space-object-container.service';
import { SpaceObjectType } from './space-object-type';

export class Craft extends SpaceObject {

  spriteLocation: Vector2;

  get displayAltitude(): string {
    // performance impact on this function seems minimal, since it's called from inside an *ngIf
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

  toJson(): {} {
    let base = super.toJson();
    return {
      ...base,
      label: this.label,
      craftType: this.craftType.label,
      antennae: this.antennae.map(a => [a.item.label, a.count]),
      location: this.location.toList(),
    };
  }

  static fromJson(json: any, getAntenna: (name) => Antenna): Craft {
    let antennae = json.antennae.map(([label, count]) => new Group<Antenna>(getAntenna(label), count));

    let object = new Craft(
      json.label,
      CraftType.fromString(json.craftType),
      antennae);

    object.draggableHandle.location = Vector2.fromList(json.draggableHandle.location);
    object.draggableHandle.lastAttemptLocation = json.draggableHandle.lastAttemptLocation;

    return object;
  }

}
