import { SpaceObject } from '../../../common/domain/space-objects/space-object';

export class TripTrajectory {
  sequence: number;
  a: SpaceObject;
  b?: SpaceObject;
}
