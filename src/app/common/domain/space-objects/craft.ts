import {
  merge,
  Observable,
} from 'rxjs';
import { SoiManager } from '../../../services/domain/soi-manager';
import { CraftDto } from '../dtos/craft-dto';
import { Group } from '../group';
import { ImageUrls } from '../image-urls';
import { Vector2 } from '../vector2';
import { AntennaeManager } from './antennae-manager';
import { Communication } from './communication';
import { CraftType } from './craft-type';
import { SpaceObject } from './space-object';
import { SpaceObjectType } from './space-object-type';

export class Craft extends SpaceObject {

  spriteLocation: Vector2;
  communication: Communication;

  get displayAltitude(): string {
    let soiParent = this.soiManager.getSoiParent(this.location);
    let distance = this.location.distance(soiParent.location) - soiParent.equatorialRadius;

    return `${distance.coerceAtLeast(0).toSi(3)}m`;
  }

  private readonly spaceObjectChange$: Observable<void>;

  constructor(
    private soiManager: SoiManager,
    antennaeManager: AntennaeManager,
    id: string,
    label: string,
    public craftType: CraftType,
    antennae: Group<string>[] = [],
    location?: Vector2,
    lastAttemptLocation?: number[],
  ) {
    super(soiManager, id, 30, label, ImageUrls.CraftIcons,
      'soiLock', SpaceObjectType.Craft,
      location, lastAttemptLocation);

    this.spriteLocation = craftType.iconLocation;
    this.communication = new Communication(antennaeManager, antennae.slice());
    this.spaceObjectChange$ = this.change$;
    this.change$ = merge(this.spaceObjectChange$, this.communication.change$);
  }

  override destroy() {
    super.destroy();
    this.communication.destroy();
  }

  toJson(): CraftDto {
    let base = super.toJson();
    return {
      ...base,
      craftType: this.craftType.label,
      communication: this.communication.toJson(),
    };
  }

  static fromJson(
    json: CraftDto,
    soiManager: SoiManager,
    antennaeManager: AntennaeManager,
  ): Craft {
    let communication = Communication.fromJson(json.communication, antennaeManager);
    let craftType = CraftType.fromString(json.craftType);

    return new Craft(
      soiManager,
      antennaeManager,
      json.id,
      json.draggable.label,
      craftType,
      communication.stringAntennae,
      Vector2.fromList(json.draggable.location),
      json.draggable.lastAttemptLocation,
    );
  }

}
