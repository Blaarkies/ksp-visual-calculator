import { SpaceObject } from './space-object';
import { Vector2 } from './vector2';
import { ConstrainLocationFunction } from './constrain-location-function';
import { ImageUrls } from './image-urls';
import { CraftType } from './craft-type';
import { Antenna } from './antenna';

export class Craft extends SpaceObject {

  spriteLocation: Vector2;

  constructor(label: string,
              public craftType: CraftType,
              constrainLocation: ConstrainLocationFunction,
              antennae: Antenna[] = []) {
    super(30, label, ImageUrls.CraftIcons, constrainLocation, antennae);
    this.spriteLocation = craftType.spriteLocation;
  }

}
