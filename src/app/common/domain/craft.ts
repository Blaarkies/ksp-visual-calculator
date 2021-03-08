import { SpaceObject } from './space-object';
import { Vector2 } from './vector2';
import { ConstrainLocationFunction } from './constrain-location-function';
import { ImageUrls } from './image-urls';
import { CraftType } from './craft-type';

export class Craft extends SpaceObject {

    spriteLocation: Vector2;

    constructor(label: string, craftType: CraftType,
                constrainLocation: ConstrainLocationFunction) {
        super(30, label, ImageUrls.CraftIcons, constrainLocation);
        this.spriteLocation = craftType.spriteLocation;
    }

}
