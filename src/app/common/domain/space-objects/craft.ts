import { UniverseContainerInstance } from '../../../services/universe-container-instance.service';
import { Antenna } from '../antenna';
import { CraftDto } from '../dtos/craft-dto';
import { Group } from '../group';
import { ImageUrls } from '../image-urls';
import { Vector2 } from '../vector2';
import { Communication } from './communication';
import { CraftType } from './craft-type';
import { SpaceObject } from './space-object';
import { SpaceObjectType } from './space-object-type';

export class Craft extends SpaceObject {

  spriteLocation: Vector2;
  communication: Communication;

  get displayAltitude(): string {
    // performance impact on this function seems minimal, since it's called from inside an *ngIf
    // TODO: remove UniverseContainerInstance usages
    let soiParent = UniverseContainerInstance.instance
      .getSoiParent(this.location);

    let distance = this.location.distance(soiParent.location) - soiParent.equatorialRadius;

    return `${distance.coerceAtLeast(0).toSi(3)}m`;
  }

  constructor(
    id: string,
    label: string,
    public craftType: CraftType,
    antennae: Group<string>[] = [],
  ) {
    super(id, 30, label, ImageUrls.CraftIcons, 'soiLock', SpaceObjectType.Craft);
    this.spriteLocation = craftType.iconLocation;
    this.communication = new Communication(antennae.slice());
  }

  toJson(): CraftDto {
    let base = super.toJson();
    return {
      ...base,
      craftType: this.craftType.label,
      communication: this.communication.toJson(),
    };
  }

  static fromJson(json: CraftDto): Craft {
    let communication = Communication.fromJson(json.communication);
    let craftType = CraftType.fromString(json.craftType);

    let object = new Craft(
      json.id,
      json.draggable.label,
      craftType,
      communication.antennae,
    );

    object.draggable.location = Vector2.fromList(json.draggable.location);
    object.draggable.lastAttemptLocation = json.draggable.lastAttemptLocation;

    return object;
  }

}
