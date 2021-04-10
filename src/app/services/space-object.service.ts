import { Injectable } from '@angular/core';
import { Orbit } from '../common/domain/space-objects/orbit';
import { SpaceObject } from '../common/domain/space-objects/space-object';
import { Group } from '../common/domain/group';
import { Antenna } from '../common/domain/antenna';
import { Craft } from '../common/domain/space-objects/craft';
import { TransmissionLine } from '../common/domain/transmission-line';
import { CraftType } from '../common/domain/space-objects/craft-type';
import { CameraService } from './camera.service';
import { Vector2 } from '../common/domain/vector2';
import { BehaviorSubject, concat } from 'rxjs';
import { OrbitParameterData } from '../common/domain/space-objects/orbit-parameter-data';
import { CraftDetails } from '../dialogs/craft-details-dialog/craft-details';
import { SetupService } from './setup.service';
import { filter, tap } from 'rxjs/operators';
import { A } from '@angular/cdk/keycodes';
import { CelestialBodyDetails } from '../dialogs/celestial-body-details-dialog/celestial-body-details';

@Injectable({
  providedIn: 'root',
})
export class SpaceObjectService {

  orbits$ = new BehaviorSubject<Orbit[]>(null);
  transmissionLines$ = new BehaviorSubject<TransmissionLine[]>(null);
  celestialBodies$ = new BehaviorSubject<SpaceObject[]>(null);
  crafts$ = new BehaviorSubject<Craft[]>(null);

  constructor(private cameraService: CameraService, setupService: SetupService) {
    let setupPlanets$ = setupService.stockPlanets$
      .pipe(tap(({listOrbits, celestialBodies}) => {
        this.orbits$.next(listOrbits);
        this.celestialBodies$.next(celestialBodies);
        this.crafts$.next([]);
        this.transmissionLines$.next([]);
      }));

    let setupCraft$ = setupService.availableAntennae$
      .pipe(
        filter(a => !!a.length),
        tap(() => {
          this.addCraft(new CraftDetails(
            'Craft Communotron16', CraftType.Relay, [new Group(setupService.getAntenna('Communotron 16'), 1)]),
            this.celestialBodies$.value[4].location.lerpClone(
              this.celestialBodies$.value[5].location),
          );

          this.addCraft(new CraftDetails(
            'Relay sat 15', CraftType.Relay, [new Group(setupService.getAntenna('HG-5 High Gain Antenna'), 1)]),
            this.celestialBodies$.value[4].location.lerpClone(
              this.celestialBodies$.value[6].location),
          );

          this.celestialBodies$.value.find(cb => cb.hasDsn).antennae.push(
            new Group<Antenna>(setupService.getAntenna('Tracking Station 1')));

          this.updateTransmissionLines();
        }));

    concat(setupPlanets$, setupCraft$).subscribe();
  }

  private static getIndexOfSameCombination = (parentItem, list) => list.findIndex(item => item.every(so => parentItem.includes(so)));

  private getFreshTransmissionLines() {
    return [...this.celestialBodies$.value, ...this.crafts$.value]
      .filter(so => so.antennae?.length)
      .joinSelf()
      .distinct(SpaceObjectService.getIndexOfSameCombination)
      .distinct(SpaceObjectService.getIndexOfSameCombination) // opposing permutations are still similar as combinations
      .map(pair => this.transmissionLines$.value.find(t => pair.every(n => t.nodes.includes(n)))
        ?? new TransmissionLine(pair))
      .filter(tl => tl.strength);
  }

  updateTransmissionLines() {
    this.transmissionLines$.next(this.getFreshTransmissionLines());
  }

  private addCraft(details: CraftDetails, location?: Vector2) {
    location = location ?? this.cameraService.location.clone().addVector2(
      this.cameraService.screenCenterOffset);
    let craft = new Craft(details.name, details.craftType, details.antennae);
    craft.draggableHandle.updateConstrainLocation(OrbitParameterData.fromVector2(location));
    this.crafts$.next([...this.crafts$.value, craft]);
  }

  addCraftToUniverse(details: CraftDetails, location?: Vector2) {
    this.addCraft(details, location);
    this.updateTransmissionLines();
  }

  editCelestialBody(body: SpaceObject, details: CelestialBodyDetails) {
    body.draggableHandle.label = details.name;
    body.type = details.celestialBodyType;
    body.size = details.size;
    body.draggableHandle.orbit.color = details.orbitColor;
    body.hasDsn = details.hasDsn;
  }

  editCraft(oldCraft: Craft, craftDetails: CraftDetails) {
    let newCraft = new Craft(craftDetails.name, craftDetails.craftType, craftDetails.antennae);
    newCraft.draggableHandle.updateConstrainLocation(OrbitParameterData.fromVector2(oldCraft.location));
    this.crafts$.next(this.crafts$.value.replace(oldCraft, newCraft));
    this.updateTransmissionLines();
  }

}
