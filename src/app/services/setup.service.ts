import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AntennaPart } from './json-interfaces/antenna-part';
import { BehaviorSubject, Observable } from 'rxjs';
import { Antenna } from '../common/domain/antenna';
import { CelestialBody, KerbolSystemCharacteristics } from './json-interfaces/kerbol-system-characteristics';
import { SpaceObject, SpaceObjectType } from '../common/domain/space-objects/space-object';
import { Orbit } from '../common/domain/space-objects/orbit';
import { OrbitParameterData } from '../common/domain/space-objects/orbit-parameter-data';
import { map } from 'rxjs/operators';
import { LabeledOption } from '../common/domain/input-fields/labeled-option';
import { DifficultySetting } from '../dialogs/difficulty-settings-dialog/difficulty-setting';

@Injectable({
  providedIn: 'root',
})
export class SetupService {

  availableAntennae$ = new BehaviorSubject<Antenna[]>([]);
  stockPlanets$: Observable<{ listOrbits, celestialBodies }>;
  difficultySetting: DifficultySetting;

  constructor(http: HttpClient) {
    http.get<AntennaPart[]>('assets/stock/antenna-parts.json')
      .subscribe(data => {
        let antennae = data.map(a => Antenna.fromAntennaPart(a));
        this.availableAntennae$.next(
          [...this.availableAntennae$.value, ...antennae],
        );
      });

    this.stockPlanets$ = http.get<KerbolSystemCharacteristics>('assets/stock/kerbol-system-characteristics.json')
      .pipe(map(data => SetupService.generateOrbitsAndCelestialBodies(data)));

    this.difficultySetting = DifficultySetting.normal;
  }

  getAntenna(search: string): Antenna {
    return this.availableAntennae$.value.find(a => a.label === search);
  }

  get antennaList(): LabeledOption<Antenna>[] {
    return this.availableAntennae$.value.map(a => new LabeledOption<Antenna>(a.label, a));
  }

  updateDifficultySetting(details: DifficultySetting) {
    this.difficultySetting = details;
  }

  // todo: move method to some 'generate' handler
  private static generateOrbitsAndCelestialBodies(data: KerbolSystemCharacteristics): { listOrbits, celestialBodies } {
    // Setup abstract celestial bodies
    let bodyToJsonMap = new Map<CelestialBody, SpaceObject>(
      data.bodies.map(b => [
        /*key  */ b,
        /*value*/ new SpaceObject(
          Math.log(b.equatorialRadius) * 4,
          b.name, b.imageUrl,
          b.type === SpaceObjectType.Star ? 'noMove' : 'orbital',
          SpaceObjectType.fromString(b.type),
          [],
          b.hasDsn),
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
    let celestialBodies = bodyToJsonMapEntries.map(([, so]) => so);

    return {listOrbits, celestialBodies};
  }

}
