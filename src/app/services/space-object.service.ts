import { Injectable } from '@angular/core';
import { Orbit } from '../common/domain/space-objects/orbit';
import { SpaceObject, SpaceObjectType } from '../common/domain/space-objects/space-object';
import { Group } from '../common/domain/group';
import { Antenna } from '../common/domain/antenna';
import { Craft } from '../common/domain/space-objects/craft';
import { TransmissionLine } from '../common/domain/transmission-line';
import { CraftType } from '../common/domain/space-objects/craft-type';
import { CameraService } from './camera.service';
import { Vector2 } from '../common/domain/vector2';
import { BehaviorSubject } from 'rxjs';
import { OrbitParameterData } from '../common/domain/space-objects/orbit-parameter-data';
import { CraftDetails } from '../dialogs/craft-details-dialog/craft-details';
import { HttpClient } from '@angular/common/http';
import { CelestialBody, KerbolSystemCharacteristics } from './kerbol-system-characteristics';

@Injectable({
  providedIn: 'root',
})
export class SpaceObjectService {

  orbits$: BehaviorSubject<Orbit[]> = new BehaviorSubject(null);
  transmissionLines$: BehaviorSubject<TransmissionLine[]> = new BehaviorSubject(null);
  celestialBodies$: BehaviorSubject<SpaceObject[]> = new BehaviorSubject(null);
  crafts$: BehaviorSubject<Craft[]> = new BehaviorSubject(null);

  constructor(private cameraService: CameraService, http: HttpClient) {
    http.get<KerbolSystemCharacteristics>('assets/stock/kerbol-system-characteristics.json')
      .subscribe(data => {

        // Setup abstract celestial bodies
        let bodyToJsonMap = new Map<CelestialBody, SpaceObject>(
          data.bodies.map(b => [
            /*key  */ b,
            /*value*/ new SpaceObject(
              Math.log(b.equatorialRadius) * 4,
              b.name, b.imageUrl,
              b.type === SpaceObjectType.Star ? 'noMove' : 'orbital',
              SpaceObjectType.fromString(b.type)),
          ]));

        // Setup SOI hierarchies
        bodyToJsonMap.forEach((parentSo, parentCb, map) => {
          let moons = Array.from(map.entries())
            .filter(([cb]) => cb.parent === parentCb.id)
            .map(([, so]) => so);

          parentSo.draggableHandle.setChildren(moons);
        });

        // Setup movement rules
        let bodyToJsonMapEntries = Array.from(bodyToJsonMap.entries());
        let bodyOrbitMap = new Map<SpaceObject, Orbit>(
          bodyToJsonMapEntries
            .filter(([cb]) => cb.type !== SpaceObjectType.Star)
            .map(([cb, so]) => [
              /*key  */so,
              /*value*/new Orbit(OrbitParameterData.fromRadius(cb.semiMajorAxis), cb.orbitLineColor),
            ]));
        bodyOrbitMap.forEach((orbit, body) => {
          body.draggableHandle.addOrbit(orbit);
          orbit.type = body.type;
        });

        // Done setup, call first location init
        bodyToJsonMapEntries
          .find(([, so]) => so.type === SpaceObjectType.Star)[1]
          .draggableHandle.updateConstrainLocation({xy: [0, 0]});
        let listOrbits = Array.from(bodyOrbitMap.values());

        this.orbits$.next(listOrbits);
        this.celestialBodies$.next(bodyToJsonMapEntries.map(([, so]) => so));
        this.crafts$.next([]);
        this.transmissionLines$.next([]);

        this.addCraft(new CraftDetails(
          'Untitled Craft 1', CraftType.Relay, [new Group(Antenna.Communotron16, 1)]),
          this.celestialBodies$.value[2].location.lerpClone(
            this.celestialBodies$.value[4].location)
        );

        this.addCraft(new CraftDetails(
          'Untitled Craft 2', CraftType.Relay, [new Group(Antenna.HG5HighGainAntenna, 15)]),
          this.celestialBodies$.value[4].location.lerpClone(
            this.celestialBodies$.value[7].location)
        );

        this.updateTransmissionLines();
      });
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

  editCelestialBody(body: SpaceObject) {
    console.log('body edit');
  }

  editCraft(oldCraft: Craft, craftDetails: CraftDetails) {
    let newCraft = new Craft(craftDetails.name, craftDetails.craftType, craftDetails.antennae);
    newCraft.draggableHandle.updateConstrainLocation(OrbitParameterData.fromVector2(oldCraft.location));
    this.crafts$.next(this.crafts$.value.replace(oldCraft, newCraft));
    this.updateTransmissionLines();
  }

}
