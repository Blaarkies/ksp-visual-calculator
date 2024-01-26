import { merge } from 'rxjs';
import { PlanetoidDto } from '../dtos/planetoid-dto';
import { Group } from '../group';
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
    id: string,
    label: string,
    imageUrl: string,
    moveType: MoveType,
    antennaeGroups: Group<string>[],
    public planetoidType: PlanetoidType,
    public size: number,
    public sphereOfInfluence: number,
    public equatorialRadius: number,
  ) {
    super(id, size, label, imageUrl, moveType, SpaceObjectType.Planetoid);
    if (antennaeGroups?.length) {
      this.communication = new Communication(antennaeGroups.slice());
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

  static fromJson(json: PlanetoidDto): Planetoid {
    let communication = json.communication ? Communication.fromJson(json.communication) : undefined;
    let planetoidType = PlanetoidType.fromString(json.planetoidType);

    let object = new Planetoid(
      json.id,
      json.draggable.label,
      json.draggable.imageUrl,
      json.draggable.moveType,
      communication?.antennae ?? [],
      planetoidType,
      json.size,
      json.sphereOfInfluence,
      json.equatorialRadius,
    );

    object.draggable.location.set(json.draggable.location);
    object.draggable.lastAttemptLocation = json.draggable.lastAttemptLocation;

    return object;
  }

}
