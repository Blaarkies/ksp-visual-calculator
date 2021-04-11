import { SpaceObject, SpaceObjectType } from './space-object';
import { Vector2 } from '../vector2';
import { ImageUrls } from '../image-urls';
import { CraftType } from './craft-type';
import { Antenna } from '../antenna';
import { Group } from '../group';

export class Craft extends SpaceObject {

  spriteLocation: Vector2;

  constructor(label: string,
              public craftType: CraftType,
              antennae: Group<Antenna>[] = []) {
    super(30, label, ImageUrls.CraftIcons, 'freeMove', SpaceObjectType.Craft, antennae);
    this.spriteLocation = craftType.iconLocation;
  }

}
