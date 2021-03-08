import { Draggable } from './draggable';
import { ConstrainLocationFunction } from './constrain-location-function';

export class SpaceObject extends Draggable {

  constructor(public size: number,
              label: string, imageUrl: string,
              constrainLocation: ConstrainLocationFunction) {
    super(label, `url(${imageUrl}) 0 0`, constrainLocation);
  }

}
