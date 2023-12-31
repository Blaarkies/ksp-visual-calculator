import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Craft } from '../common/domain/space-objects/craft';
import { Planetoid } from '../common/domain/space-objects/planetoid';
import { Vector2 } from '../common/domain/vector2';

@Injectable({
  providedIn: 'root',
})
export class UniverseContainerInstance {

  // Removes the circular dependency from Craft <-> SpaceObjectService
  static instance: UniverseContainerInstance;

  planets$ = new BehaviorSubject<Planetoid[]>(null);
  crafts$ = new BehaviorSubject<Craft[]>(null);

  constructor() {
    UniverseContainerInstance.instance = this;
  }

  getSoiParent(location: Vector2): Planetoid {
    return this.planets$.value
      .filter(p => !p.sphereOfInfluence
        || location.distance(p.location) <= p.sphereOfInfluence)
      .min(p => p.location.distance(location));
  }

}
