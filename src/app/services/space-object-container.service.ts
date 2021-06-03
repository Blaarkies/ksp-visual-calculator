import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SpaceObject } from '../common/domain/space-objects/space-object';
import { Craft } from '../common/domain/space-objects/craft';

@Injectable({
  providedIn: 'root'
})
export class SpaceObjectContainerService {

  static instance: SpaceObjectContainerService;

  // Removes the circular dependency from Craft <-> SpaceObjectService
  celestialBodies$ = new BehaviorSubject<SpaceObject[]>(null);
  crafts$ = new BehaviorSubject<Craft[]>(null);

  constructor() {
    SpaceObjectContainerService.instance = this;
  }
}
