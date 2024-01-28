import { merge } from 'rxjs';
import { SoiManager } from '../../../services/domain/soi-manager';
import { PlanetoidDto } from '../dtos/planetoid-dto';
import { Group } from '../group';
import { Vector2 } from '../vector2';
import { AntennaeManager } from './antennae-manager';
import { Communication } from './communication';
import { MoveType } from './move-type';
import { PlanetoidType } from './planetoid-type';
import { SpaceObject } from './space-object';
import { SpaceObjectType } from './space-object-type';

export class Planetoid extends SpaceObject {

  get communication(): Communication {
    return this._communication;
  }

  set communication(value: Communication) {
    if (this._communication) {
      this._communication.destroy();
    }
    this._communication = value;
    this.change$ = value
      ? merge(this.spaceObjectChange$, value.change$)
      : this.spaceObjectChange$;
  }

  showSoi?: boolean;

  private _communication?: Communication;
  private spaceObjectChange$ = this.change$;

  constructor(
    soiManager: SoiManager,
    antennaeManager: AntennaeManager,
    id: string,
    label: string,
    imageUrl: string,
    moveType: MoveType,
    antennaeGroups: Group<string>[],
    public planetoidType: PlanetoidType,
    public size: number,
    public sphereOfInfluence: number,
    public equatorialRadius: number,
    location?: Vector2,
    lastAttemptLocation?: number[],
  ) {
    super(soiManager, id, size, label, imageUrl,
      moveType, SpaceObjectType.Planetoid,
      location, lastAttemptLocation);
    if (antennaeGroups?.length) {
      this.communication = new Communication(antennaeManager, antennaeGroups.slice());
    }
  }

  override destroy() {
    super.destroy();
    this.communication?.destroy();
  }

  toJson(): PlanetoidDto {
    let base = super.toJson();
    return {
      ...base,
      communication: this._communication?.toJson(),
      planetoidType: this.planetoidType.name,
      size: this.size,
      sphereOfInfluence: this.sphereOfInfluence,
      equatorialRadius: this.equatorialRadius,
    };
  }

  static fromJson(
    json: PlanetoidDto,
    soiManager: SoiManager,
    antennaeManager: AntennaeManager,
  ): Planetoid {
    let communication = json.communication
      ? Communication.fromJson(json.communication, antennaeManager)
      : undefined;
    let planetoidType = PlanetoidType.fromString(json.planetoidType);

    return new Planetoid(
      soiManager,
      antennaeManager,
      json.id,
      json.draggable.label,
      json.draggable.imageUrl,
      json.draggable.moveType,
      communication?.stringAntennae ?? [],
      planetoidType,
      json.size,
      json.sphereOfInfluence,
      json.equatorialRadius,
      Vector2.fromList(json.draggable.location),
      json.draggable.lastAttemptLocation,
    );
  }

}
