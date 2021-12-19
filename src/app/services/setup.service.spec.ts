import { SetupService } from './setup.service';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../app.module';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, of, take } from 'rxjs';
import { DifficultySetting } from '../overlays/difficulty-settings-dialog/difficulty-setting';
import { KerbolSystemCharacteristics } from './json-interfaces/kerbol-system-characteristics';
import { fakeAsync, tick } from '@angular/core/testing';
import objectContaining = jasmine.objectContaining;
import arrayContaining = jasmine.arrayContaining;
import anything = jasmine.anything;

let serviceType = SetupService;
describe('SetupService', async () => {

  let resources = {
    'antenna-parts.json': antennaPartsJson(),
    'kerbol-system-characteristics.json': kerbolSystemCharacteristicsJson(),
  };

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
    await firstValueFrom(service.availableAntennae$);
    tick();

    expect(service.difficultySetting.label).toBe('Normal');

    let {listOrbits, celestialBodies} = await firstValueFrom(service.stockPlanets$);
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
    await firstValueFrom(service.availableAntennae$);
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
        bodies: getTestSolarSystem(),
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
        bodies: getTestSolarSystem(),
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


function getTestSolarSystem() {
  return [
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
}

/* tslint:disable:object-literal-key-quotes */
function antennaPartsJson() {
  return [
    {
      'label': 'Communotron 16',
      'cost': 300,
      'mass': 0.005,
      'electricityPMit': 6,
      'electricityPS': 20,
      'transmissionSpeed': 3.33,
      'relay': false,
      'tier': 1,
      'powerRating': 500e3,
      'combinabilityExponent': 1
    },
    {
      'label': 'Communotron 16-S',
      'cost': 300,
      'mass': 0.015,
      'electricityPMit': 6,
      'electricityPS': 20,
      'transmissionSpeed': 3.33,
      'relay': false,
      'tier': 1,
      'powerRating': 500e3,
      'combinabilityExponent': 0
    },
    {
      'label': 'Communotron DTS-M1',
      'cost': 900,
      'mass': 0.05,
      'electricityPMit': 6,
      'electricityPS': 34.3,
      'transmissionSpeed': 5.71,
      'relay': false,
      'tier': 3,
      'powerRating': 2e9,
      'combinabilityExponent': 0.75
    },
    {
      'label': 'Communotron HG-55',
      'cost': 1200,
      'mass': 0.075,
      'electricityPMit': 6.67,
      'electricityPS': 133.3,
      'transmissionSpeed': 20,
      'relay': false,
      'tier': 4,
      'powerRating': 15e9,
      'combinabilityExponent': 0.75
    },
    {
      'label': 'Communotron 88-88',
      'cost': 1500,
      'mass': 0.1,
      'electricityPMit': 10,
      'electricityPS': 200,
      'transmissionSpeed': 20,
      'relay': false,
      'tier': 5,
      'powerRating': 100e9,
      'combinabilityExponent': 0.75
    },
    {
      'label': 'HG-5 High Gain Antenna',
      'cost': 600,
      'mass': 0.07,
      'electricityPMit': 9,
      'electricityPS': 51.4,
      'transmissionSpeed': 5.71,
      'relay': true,
      'tier': 2,
      'powerRating': 5e6,
      'combinabilityExponent': 0.75
    },
    {
      'label': 'RA-2 Relay Antenna',
      'cost': 1800,
      'mass': 0.15,
      'electricityPMit': 24,
      'electricityPS': 68.6,
      'transmissionSpeed': 2.86,
      'relay': true,
      'tier': 3,
      'powerRating': 2e9,
      'combinabilityExponent': 0.75
    },
    {
      'label': 'RA-15 Relay Antenna',
      'cost': 2400,
      'mass': 0.3,
      'electricityPMit': 12,
      'electricityPS': 68.6,
      'transmissionSpeed': 5.71,
      'relay': true,
      'tier': 4,
      'powerRating': 15e9,
      'combinabilityExponent': 0.75
    },
    {
      'label': 'RA-100 Relay Antenna',
      'cost': 3000,
      'mass': 0.65,
      'electricityPMit': 6,
      'electricityPS': 68.6,
      'transmissionSpeed': 11.43,
      'relay': true,
      'tier': 5,
      'powerRating': 100e9,
      'combinabilityExponent': 0.75
    },
    {
      'label': 'Tracking Station 1',
      'cost': 0,
      'mass': 0,
      'electricityPMit': 0,
      'electricityPS': 0,
      'transmissionSpeed': 0,
      'relay': true,
      'tier': 1,
      'powerRating': 2e9,
      'combinabilityExponent': 1
    },
    {
      'label': 'Tracking Station 2',
      'cost': 150e3,
      'mass': 0,
      'electricityPMit': 0,
      'electricityPS': 0,
      'transmissionSpeed': 0,
      'relay': true,
      'tier': 1,
      'powerRating': 50e9,
      'combinabilityExponent': 1
    },
    {
      'label': 'Tracking Station 3',
      'cost': 563e3,
      'mass': 0,
      'electricityPMit': 0,
      'electricityPS': 0,
      'transmissionSpeed': 0,
      'relay': true,
      'tier': 1,
      'powerRating': 250e9,
      'combinabilityExponent': 1
    },
    {
      'label': 'Internal',
      'cost': 0,
      'mass': 0,
      'electricityPMit': 6,
      'electricityPS': 20,
      'transmissionSpeed': 3.33,
      'relay': false,
      'tier': 1,
      'powerRating': 5e3,
      'combinabilityExponent': 0.75
    },
    {
      'label': 'Probodobodyne Experiment Control Station',
      'cost': 800,
      'mass': 0.05,
      'electricityPMit': 0,
      'electricityPS': 0,
      'transmissionSpeed': 0,
      'relay': false,
      'tier': 5,
      'powerRating': 5e3,
      'combinabilityExponent': 0
    },
    {
      'label': 'Communotron Ground HG-48',
      'cost': 1000,
      'mass': 0.04,
      'electricityPMit': 0,
      'electricityPS': 0,
      'transmissionSpeed': 0,
      'relay': false,
      'tier': 7,
      'powerRating': 10e9,
      'combinabilityExponent': 0
    }
  ];
}

function kerbolSystemCharacteristicsJson() {
  return {
    'bodies': [
      {
        'id': 'kerbol',
        'type': 'star',
        'name': 'Kerbol',
        'equatorialRadius': 2616e5,
        'imageUrl': 'assets/stock/kerbol-system-icons/kerbol.png'
      },
      {
        'id': 'moho',
        'type': 'planet',
        'name': 'Moho',
        'parent': 'kerbol',
        'semiMajorAxis': 5263138304,
        'equatorialRadius': 25e4,
        'sphereOfInfluence': 9646663,
        'imageUrl': 'assets/stock/kerbol-system-icons/moho.png',
        'orbitLineColor': '#fdbc89'
      },
      {
        'id': 'eve',
        'type': 'planet',
        'name': 'Eve',
        'parent': 'kerbol',
        'semiMajorAxis': 9832684544,
        'equatorialRadius': 7e5,
        'sphereOfInfluence': 85109365,
        'imageUrl': 'assets/stock/kerbol-system-icons/eve.png',
        'orbitLineColor': '#7320f5'
      },
      {
        'id': 'gilly',
        'type': 'moon',
        'name': 'Gilly',
        'parent': 'eve',
        'semiMajorAxis': 315e5,
        'equatorialRadius': 13e3,
        'sphereOfInfluence': 126123,
        'imageUrl': 'assets/stock/kerbol-system-icons/gilly.png',
        'orbitLineColor': '#9f7966'
      },
      {
        'id': 'kerbin',
        'type': 'planet',
        'name': 'Kerbin',
        'parent': 'kerbol',
        'semiMajorAxis': 13599840256,
        'equatorialRadius': 6e5,
        'sphereOfInfluence': 84159286,
        'imageUrl': 'assets/stock/kerbol-system-icons/kerbin.png',
        'orbitLineColor': '#30f0f0',
        'hasDsn': true
      },
      {
        'id': 'mun',
        'type': 'moon',
        'name': 'Mun',
        'parent': 'kerbin',
        'semiMajorAxis': 12e6,
        'equatorialRadius': 2e5,
        'sphereOfInfluence': 2429559,
        'imageUrl': 'assets/stock/kerbol-system-icons/mun.png',
        'orbitLineColor': '#d0d0f0'
      },
      {
        'id': 'minmus',
        'type': 'moon',
        'name': 'Minmus',
        'parent': 'kerbin',
        'semiMajorAxis': 47e6,
        'equatorialRadius': 6e4,
        'sphereOfInfluence': 2247428,
        'imageUrl': 'assets/stock/kerbol-system-icons/minmus.png',
        'orbitLineColor': '#b090c0'
      },
      {
        'id': 'duna',
        'type': 'planet',
        'name': 'Duna',
        'parent': 'kerbol',
        'semiMajorAxis': 20726155264,
        'equatorialRadius': 32e4,
        'sphereOfInfluence': 47921949,
        'imageUrl': 'assets/stock/kerbol-system-icons/duna.png',
        'orbitLineColor': '#ab4323'
      },
      {
        'id': 'ike',
        'type': 'moon',
        'name': 'Ike',
        'parent': 'duna',
        'semiMajorAxis': 32e5,
        'equatorialRadius': 13e4,
        'sphereOfInfluence': 1049598,
        'imageUrl': 'assets/stock/kerbol-system-icons/ike.png',
        'orbitLineColor': '#967354'
      },
      {
        'id': 'dres',
        'type': 'planet',
        'name': 'Dres',
        'parent': 'kerbol',
        'semiMajorAxis': 40839348203,
        'equatorialRadius': 138e3,
        'sphereOfInfluence': 32832840,
        'imageUrl': 'assets/stock/kerbol-system-icons/dres.png',
        'orbitLineColor': '#5e4835'
      },
      {
        'id': 'jool',
        'type': 'planet',
        'name': 'Jool',
        'parent': 'kerbol',
        'semiMajorAxis': 68773560320,
        'equatorialRadius': 6e6,
        'sphereOfInfluence': 2.4559852e9,
        'imageUrl': 'assets/stock/kerbol-system-icons/jool.png',
        'orbitLineColor': '#568e0e'
      },
      {
        'id': 'laythe',
        'type': 'moon',
        'name': 'Laythe',
        'parent': 'jool',
        'semiMajorAxis': 27184000,
        'equatorialRadius': 5e5,
        'sphereOfInfluence': 3723645,
        'imageUrl': 'assets/stock/kerbol-system-icons/laythe.png',
        'orbitLineColor': '#4859a3'
      },
      {
        'id': 'vall',
        'type': 'moon',
        'name': 'Vall',
        'parent': 'jool',
        'semiMajorAxis': 43152e3,
        'equatorialRadius': 3e5,
        'sphereOfInfluence': 2406401,
        'imageUrl': 'assets/stock/kerbol-system-icons/vall.png',
        'orbitLineColor': '#73a1bc'
      },
      {
        'id': 'tylo',
        'type': 'moon',
        'name': 'Tylo',
        'parent': 'jool',
        'semiMajorAxis': 685e5,
        'equatorialRadius': 6e5,
        'sphereOfInfluence': 10856518,
        'imageUrl': 'assets/stock/kerbol-system-icons/tylo.png',
        'orbitLineColor': '#c89292'
      },
      {
        'id': 'bop',
        'type': 'moon',
        'name': 'Bop',
        'parent': 'jool',
        'semiMajorAxis': 1285e5,
        'equatorialRadius': 65e3,
        'sphereOfInfluence': 1221060,
        'imageUrl': 'assets/stock/kerbol-system-icons/bop.png',
        'orbitLineColor': '#c2a783'
      },
      {
        'id': 'pol',
        'type': 'moon',
        'name': 'Pol',
        'parent': 'jool',
        'semiMajorAxis': 17989e4,
        'equatorialRadius': 44e3,
        'sphereOfInfluence': 1042138,
        'imageUrl': 'assets/stock/kerbol-system-icons/pol.png',
        'orbitLineColor': '#e6edb4'
      },
      {
        'id': 'eeloo',
        'type': 'planet',
        'name': 'Eeloo',
        'parent': 'kerbol',
        'semiMajorAxis': 9011882e4,
        'equatorialRadius': 21e4,
        'sphereOfInfluence': 1.1908294e8,
        'imageUrl': 'assets/stock/kerbol-system-icons/eeloo.png',
        'orbitLineColor': '#707678'
      }
    ]
  };
}

