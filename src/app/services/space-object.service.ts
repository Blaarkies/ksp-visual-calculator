import { Injectable } from '@angular/core';
import { Orbit } from '../common/domain/orbit';
import { Circle } from '../common/domain/circle';
import { Colors } from '../common/domain/colors';
import { SpaceObject } from '../common/domain/space-object';
import { ImageUrls } from '../common/domain/image-urls';
import { LocationConstraints } from '../common/domain/location-constraints';
import { Group } from '../common/domain/group';
import { Antenna } from '../common/domain/antenna';
import { Craft } from '../common/domain/craft';
import { TransmissionLine } from '../common/domain/transmission-line';
import { CraftType } from '../common/domain/craft-type';
import { CraftDetails } from '../dialogs/craft-details-dialog/craft-details-dialog.component';
import { CameraService } from './camera.service';
import { Vector2 } from '../common/domain/vector2';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpaceObjectService {

  orbits$: BehaviorSubject<Orbit[]>;
  transmissionLines$: BehaviorSubject<TransmissionLine[]>;
  celestialBodies$: BehaviorSubject<SpaceObject[]>;
  crafts$: BehaviorSubject<Craft[]>;

  constructor(private cameraService: CameraService) {
    let orbits = {
      kerbin: new Orbit(new Circle(500, 500, 200), Colors.OrbitLineKerbin),
      eve: new Orbit(new Circle(500, 500, 150), Colors.OrbitLineEve),
    };
    let listOrbits = Object.values(orbits);

    let celestialBodies = [
      new SpaceObject(80, 'Kerbol', ImageUrls.Kerbol, LocationConstraints.noMove(500, 500)),
      new SpaceObject(40, 'Kerbin', ImageUrls.Kerbin, LocationConstraints.circularMove(orbits.kerbin.parameters),
        [new Group(Antenna.Dsn1, 1)]),
      new SpaceObject(40, 'Eve', ImageUrls.Eve, LocationConstraints.circularMove(orbits.eve.parameters)),
    ];

    this.orbits$ = new BehaviorSubject(listOrbits);
    this.celestialBodies$ = new BehaviorSubject(celestialBodies);
    this.crafts$ = new BehaviorSubject([]);
    this.transmissionLines$ = new BehaviorSubject([]);

    this.addCraft(new CraftDetails(
      'renamed craft', CraftType.Relay, [new Group(Antenna.Communotron16, 1)]),
      new Vector2(300, 300));

    this.addCraft(new CraftDetails(
      'rescue boi', CraftType.Relay, [new Group(Antenna.Communotron16, 5)]),
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
    let craft = new Craft(details.name, details.craftType,
      LocationConstraints.anyMove(location.x, location.y),
      details.antennae);
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
    let newCraft = new Craft(craftDetails.name, craftDetails.craftType, oldCraft.constrainLocation, craftDetails.antennae);
    newCraft.location = oldCraft.location;
    this.crafts$.next(this.crafts$.value.replace(oldCraft, newCraft));
    this.updateTransmissionLines();
  }

}
