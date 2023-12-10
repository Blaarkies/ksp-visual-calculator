import { Antenna } from '../antenna';
import { Group } from '../group';
import { Vector2 } from '../vector2';
import { Communication } from './communication';
import { Draggable } from './draggable';
import { MoveType } from './move-type';
import { SpaceObjectType } from './space-object-type';

export class SpaceObject {

  draggableHandle: Draggable;
  showSoi?: boolean;
  communication?: Communication;

  get label(): string {
    return this.draggableHandle.label;
  }

  get location(): Vector2 {
    return this.draggableHandle.location;
  }

  get antennae(): Group<Antenna>[] {
    return this.communication?.antennae ?? [];
  }

  constructor(public size: number,
              label: string,
              imageUrl: string,
              moveType: MoveType,
              public type: SpaceObjectType,
              antennae: Group<Antenna>[] = [],
              public hasDsn?: boolean,
              public sphereOfInfluence?: number,
              public equatorialRadius?: number) {
    this.draggableHandle = new Draggable(label, `url(${imageUrl}) 0 0`, moveType);
    this.communication = antennae.length
      ? new Communication(antennae.slice(), hasDsn)
      : undefined;
  }

  toJson(): {} {
    return {
      draggableHandle: this.draggableHandle.toJson(),
      size: this.size,
      type: this.type.name,
      trackingStation: this.communication?.antennae?.[0]?.item?.label,
      hasDsn: this.hasDsn,
      sphereOfInfluence: this.sphereOfInfluence,
      equatorialRadius: this.equatorialRadius,
      communication: this.communication?.toJson(),
    };
  }

  static fromJson(json: any, getAntenna: (name: string) => Antenna): SpaceObject {
    let dsnAntenna = getAntenna(json.trackingStation);
    let antennae = dsnAntenna
      ? [new Group(dsnAntenna)]
      : [];

    let object = new SpaceObject(
      json.size,
      json.draggableHandle.label,
      '',
      json.draggableHandle.moveType,
      SpaceObjectType.fromString(json.type),
      antennae,
      json.hasDsn,
      json.sphereOfInfluence,
      json.equatorialRadius,
    );

    object.draggableHandle.imageUrl = json.draggableHandle.imageUrl;
    object.draggableHandle.location = Vector2.fromList(json.draggableHandle.location);
    object.draggableHandle.lastAttemptLocation = json.draggableHandle.lastAttemptLocation;

    return object;
  }

}
