import { UniverseContainerInstance } from '../../../services/universe-container-instance.service';
import { Antenna } from '../antenna';
import { Group } from '../group';
import { ImageUrls } from '../image-urls';
import { Vector2 } from '../vector2';
import { Communication } from './communication';
import { CraftType } from './craft-type';
import { SpaceObject } from './space-object';
import { SpaceObjectType } from './space-object-type';

export class Craft extends SpaceObject {

  spriteLocation: Vector2;

  get displayAltitude(): string {
    // performance impact on this function seems minimal, since it's called from inside an *ngIf
    // TODO: remove UniverseContainerInstance usages
    let soiParent = UniverseContainerInstance.instance
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
      location: this.location.toList(),
    };
  }

  static fromJson(json: any, getAntenna: (name: string) => Antenna): Craft {
    let communication = Communication.fromJson(json.communication, getAntenna);
    let craftType = CraftType.fromString(json.craftType);

    let object = new Craft(
      json.label,
      craftType,
      communication.antennae,
    );

    object.draggableHandle.location = Vector2.fromList(json.draggableHandle.location);
    object.draggableHandle.lastAttemptLocation = json.draggableHandle.lastAttemptLocation;

    return object;
  }

}
