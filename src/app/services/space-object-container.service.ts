import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SpaceObject } from '../common/domain/space-objects/space-object';
import { Craft } from '../common/domain/space-objects/craft';
import { Vector2 } from '../common/domain/vector2';

@Injectable({
  providedIn: 'root',
})
export class SpaceObjectContainerService {

  static instance: SpaceObjectContainerService;

  // Removes the circular dependency from Craft <-> SpaceObjectService
  celestialBodies$ = new BehaviorSubject<SpaceObject[]>(null);
  crafts$ = new BehaviorSubject<Craft[]>(null);

  constructor() {
    SpaceObjectContainerService.instance = this;
  }

  getSoiParent(location: Vector2): SpaceObject {
    return this.celestialBodies$.value
      .filter(cb => !cb.sphereOfInfluence || location.distance(cb.location) <= cb.sphereOfInfluence)
      .sort((a, b) => a.location.distance(location) - b.location.distance(location))
      .first();
  }

  getState() {
    let state = {
      celestialBodies: this.celestialBodies$.value.map(b => b.toJson()),
      craft: this.crafts$.value.map(b => b.toJson())
    };
    return JSON.stringify(state);
  }

}
