import { SetupService } from './setup.service';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../app.module';
import { HttpClient } from '@angular/common/http';
import { interval, of } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import * as antennaPartsJson from 'src/assets/stock/antenna-parts.json';
import * as kerbolSystemCharacteristicsJson from 'src/assets/stock/kerbol-system-characteristics.json';
import { DifficultySetting } from '../overlays/difficulty-settings-dialog/difficulty-setting';
import { KerbolSystemCharacteristics } from './json-interfaces/kerbol-system-characteristics';
import { fakeAsync, tick } from '@angular/core/testing';
import objectContaining = jasmine.objectContaining;
import arrayContaining = jasmine.arrayContaining;
import anything = jasmine.anything;

let serviceType = SetupService;
describe('SetupService', async () => {

  let resources: { [key: string]: {} };

  beforeAll(async () => {
    await interval(10).pipe(
      filter(() => (antennaPartsJson as any).default
        && (kerbolSystemCharacteristicsJson as any).default),
      take(1))
      .toPromise();

    resources = {
      'antenna-parts.json': (antennaPartsJson as any).default,
      'kerbol-system-characteristics.json': (kerbolSystemCharacteristicsJson as any).default,
    };
  });

  beforeEach(async () => MockBuilder(serviceType)
    .mock(HttpClient, {
      get: url => of(resources[url.split('/').pop()]),
    } as any)
    .mock(AppModule));

  it('should be created', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    expect(service).toBeDefined();
  });

  it('constructor() should set difficultySetting & planets', fakeAsync(async () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    await service.availableAntennae$.pipe(take(1)).toPromise();
    tick();

    expect(service.difficultySetting.label).toBe('Normal');

    let {listOrbits, celestialBodies} = await service.stockPlanets$.pipe(take(1)).toPromise();
    expect(listOrbits).toEqual(arrayContaining([anything()]));
    expect(celestialBodies).toEqual(arrayContaining([
      objectContaining({label: 'Kerbol'}),
      objectContaining({label: 'Moho'}),
      objectContaining({label: 'Eve'}),
      objectContaining({label: 'Gilly'}),
      objectContaining({label: 'Kerbin'}),
      objectContaining({label: 'Mun'}),
      objectContaining({label: 'Minmus'}),
      objectContaining({label: 'Duna'}),
      objectContaining({label: 'Ike'}),
      objectContaining({label: 'Dres'}),
      objectContaining({label: 'Jool'}),
      objectContaining({label: 'Laythe'}),
      objectContaining({label: 'Tylo'}),
      objectContaining({label: 'Vall'}),
      objectContaining({label: 'Bop'}),
      objectContaining({label: 'Pol'}),
      objectContaining({label: 'Eeloo'}),
    ]));
  }));

  it('getAntenna() should return a matching antenna', fakeAsync(() => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    tick();

    let foundAntenna = service.getAntenna('Communotron 16');
    expect(foundAntenna).toEqual(
      objectContaining({label: 'Communotron 16'}));
  }));

  it('antennaList should return the latest list of antennae', fakeAsync(async () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    await service.availableAntennae$.pipe(take(1)).toPromise();
    tick();

    service.antennaList;
    expect(service.antennaList).toEqual(
      arrayContaining([
        objectContaining({label: 'Communotron 16'}),
        objectContaining({label: 'Communotron 16-S'}),
      ]));
  }));

  it('updateDifficultySetting() should update difficultySetting', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    service.updateDifficultySetting(DifficultySetting.easy);
    expect(service.difficultySetting.label).toBe('Easy');
  });

  describe('static generateOrbitsAndCelestialBodies()', () => {

    it('should generate orbit for planet', () => {
      let data: KerbolSystemCharacteristics = {
        bodies: testSolarSystem,
      };
      let {listOrbits} = (SetupService as any).generateOrbitsAndCelestialBodies(data);

      expect(listOrbits.length).toBe(1);

      let orbit = listOrbits[0];
      expect(orbit.parameters).toEqual(objectContaining({
        xy: [0, 0],
        r: 9000,
        parent: undefined, // OrbitParameterData uses this for SOI-lock
      }));
      expect(orbit.color).toBe('test-color-a');
      expect(orbit.type).toEqual(objectContaining({name: 'planet'}));
    });

    it('should generate star and planet', () => {
      let data: KerbolSystemCharacteristics = {
        bodies: testSolarSystem,
      };
      let {celestialBodies} = (SetupService as any).generateOrbitsAndCelestialBodies(data);

      expect(celestialBodies.length).toBe(2);
      let star = celestialBodies[0];
      expect(star).toEqual(objectContaining({
        size: 24.858432393688766,
        type: objectContaining({name: 'star'}),
        antennae: [],
        hasDsn: undefined,
        sphereOfInfluence: undefined,
        equatorialRadius: 500,
        draggableHandle: objectContaining({
          label: 'test-star-name',
          moveType: 'noMove',
          location: objectContaining({x: 0, y: 0}),
          children: [
            objectContaining({label: 'test-planet-a-name'}),
          ],
        }),
      }));

      let planet = celestialBodies[1];
      expect(planet).toEqual(objectContaining({
        size: 18.420680743952367,
        type: objectContaining({name: 'planet'}),
        antennae: [],
        hasDsn: undefined,
        sphereOfInfluence: 420,
        equatorialRadius: 100,
        draggableHandle: objectContaining({
          label: 'test-planet-a-name',
          moveType: 'orbital',
          location: objectContaining({x: 9000, y: 0}),
          children: [],
        }),
      }));
    });
  });

});

const testSolarSystem = [
  {
    id: 'test-star-id',
    type: 'star',
    name: 'test-star-name',
    equatorialRadius: 500,
    imageUrl: '',
  },
  {
    id: 'test-planet-a-id',
    type: 'planet',
    name: 'test-planet-a-name',
    parent: 'test-star-id',
    semiMajorAxis: 9000,
    equatorialRadius: 100,
    sphereOfInfluence: 420,
    imageUrl: '',
    orbitLineColor: 'test-color-a',
  },
];
