import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SpaceObject } from '../common/domain/space-objects/space-object';
import { Craft } from '../common/domain/space-objects/craft';
import { Vector2 } from '../common/domain/vector2';

@Injectable({
  providedIn: 'root',
})
export class UniverseContainerInstance {

  // Removes the circular dependency from Craft <-> SpaceObjectService
  static instance: UniverseContainerInstance;

  planets$ = new BehaviorSubject<SpaceObject[]>(null);
  crafts$ = new BehaviorSubject<Craft[]>(null);

  constructor() {
    UniverseContainerInstance.instance = this;
  }

  getSoiParent(location: Vector2): SpaceObject {
    return this.planets$.value
      .filter(cb => !cb.sphereOfInfluence || location.distance(cb.location) <= cb.sphereOfInfluence)
      .sort((a, b) => a.location.distance(location) - b.location.distance(location))
      .first();
  }

}
