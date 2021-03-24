import { Injectable } from '@angular/core';
import { Orbit } from '../common/domain/space-objects/orbit';
import { Colors } from '../common/domain/colors';
import { SpaceObject, SpaceObjectType } from '../common/domain/space-objects/space-object';
import { ImageUrls } from '../common/domain/image-urls';
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

@Injectable({
  providedIn: 'root',
})
export class SpaceObjectService {

  orbits$: BehaviorSubject<Orbit[]>;
  transmissionLines$: BehaviorSubject<TransmissionLine[]>;
  celestialBodies$: BehaviorSubject<SpaceObject[]>;
  crafts$: BehaviorSubject<Craft[]>;

  constructor(private cameraService: CameraService) {
    // Setup abstract celestial bodies
    let celestialBodies = {
      kerbol: new SpaceObject(100, 'Kerbol', ImageUrls.Kerbol, 'noMove', SpaceObjectType.Star),
      eve: new SpaceObject(50, 'Eve', ImageUrls.Eve, 'orbital', SpaceObjectType.Planet),
      kerbin: new SpaceObject(50, 'Kerbin', ImageUrls.Kerbin, 'orbital', SpaceObjectType.Planet, [new Group(Antenna.Dsn1, 1)]),
      mun: new SpaceObject(40, 'Mun', ImageUrls.Mun, 'orbital', SpaceObjectType.Moon),
      minmus: new SpaceObject(20, 'Minmus', ImageUrls.Minmus, 'orbital', SpaceObjectType.Moon),
    };

    // Setup SOI hierarchies
    celestialBodies.kerbol.draggableHandle.setChildren([
      celestialBodies.eve,
      celestialBodies.kerbin,
    ]);
    celestialBodies.kerbin.draggableHandle.setChildren([
      celestialBodies.mun,
      celestialBodies.minmus,
    ]);

    // Setup movement rules
    let bodyOrbitMap = new Map<SpaceObject, Orbit>([
      [celestialBodies.eve, new Orbit(OrbitParameterData.fromRadius(150), Colors.OrbitLineEve)],
      [celestialBodies.kerbin, new Orbit(OrbitParameterData.fromRadius(200), Colors.OrbitLineKerbin)],
      [celestialBodies.mun, new Orbit(OrbitParameterData.fromRadius(10), Colors.OrbitLineMun)],
      [celestialBodies.minmus, new Orbit(OrbitParameterData.fromRadius(20), Colors.OrbitLineMinmus)],
    ]);
    bodyOrbitMap.forEach((orbit, body) => {
      body.draggableHandle.addOrbit(orbit);
      orbit.type = body.type;
    });

    // Done setup, call first location init
    celestialBodies.kerbol.draggableHandle.updateConstrainLocation({xy: [500, 500]});
    let listOrbits = Array.from(bodyOrbitMap.values());

    this.orbits$ = new BehaviorSubject(listOrbits);
    this.celestialBodies$ = new BehaviorSubject(Object.values(celestialBodies));
    this.crafts$ = new BehaviorSubject([]);
    this.transmissionLines$ = new BehaviorSubject([]);

    this.addCraft(new CraftDetails(
      'renamed craft', CraftType.Relay, [new Group(Antenna.Communotron16, 1)]),
      new Vector2(300, 300));

    this.addCraft(new CraftDetails(
      'rescue boi', CraftType.Relay, [new Group(Antenna.HG5HighGainAntenna, 15)]),
      new Vector2(500, 300));

    this.updateTransmissionLines();
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
