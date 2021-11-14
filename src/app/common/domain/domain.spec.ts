import * as antennaPartsJson from 'src/assets/stock/antenna-parts.json';
import { Antenna } from './antenna';
import { AntennaPart } from '../../services/json-interfaces/antenna-part';
import { TransmissionLine } from './transmission-line';
import { SpaceObject } from './space-objects/space-object';
import { Group } from './group';
import { SetupService } from '../../services/setup.service';
import { DifficultySetting } from '../../overlays/difficulty-settings-dialog/difficulty-setting';
import { SpaceObjectType } from './space-objects/space-object-type';
import { interval } from 'rxjs';
import { filter, take } from 'rxjs/operators';

interface SignalScenario {
  label: string;
  distance: number;
  expectedStrength: number;
  craft?: SpaceObject;
}

interface AntennaScenario extends SignalScenario {
  craft: SpaceObject;
  relay?: SpaceObject;
  difficulty?: DifficultySetting;
}

describe('Domain tests', () => {

  beforeAll(async () =>
    await interval(10).pipe(
      filter(() => (antennaPartsJson as any).default),
      take(1))
      .toPromise());

  describe('Antenna calculations', async () => {
    let setupServiceMock = {
      difficultySetting: DifficultySetting.normal,
    } as SetupService;

    let stockAntennae = ((antennaPartsJson as any).default as {}[])
      .map((a: AntennaPart) => Antenna.fromAntennaPart(a));

    let antennaeMap = {
      internal: stockAntennae.find(a => a.label === 'Internal'),
      communotron16: stockAntennae.find(a => a.label === 'Communotron 16'),
      hg5HighGain: stockAntennae.find(a => a.label === 'HG-5 High Gain Antenna'),
      ra2Relay: stockAntennae.find(a => a.label === 'RA-2 Relay Antenna'),
      ra15Relay: stockAntennae.find(a => a.label === 'RA-15 Relay Antenna'),
      ra100Relay: stockAntennae.find(a => a.label === 'RA-100 Relay Antenna'),
      dsn1: stockAntennae.find(a => a.label === 'Tracking Station 1'),
      dsn2: stockAntennae.find(a => a.label === 'Tracking Station 2'),
      dsn3: stockAntennae.find(a => a.label === 'Tracking Station 3'),
    };

    let makeSpaceObject = (antennae: any[][]) => new SpaceObject(0, '', '', 'freeMove', SpaceObjectType.Craft,
      antennae.map(([antenna, count = 1]) => new Group(antenna, count)));

    let spaceObjectMap = {
      internal: makeSpaceObject([[antennaeMap.internal]]),
      communotron16: makeSpaceObject([[antennaeMap.internal], [antennaeMap.communotron16]]),
      hg5HighGain: makeSpaceObject([[antennaeMap.internal], [antennaeMap.hg5HighGain]]),
      ra100Relay: makeSpaceObject([[antennaeMap.internal], [antennaeMap.ra100Relay]]),
      dsn1: makeSpaceObject([[antennaeMap.dsn1]]),
      dsn2: makeSpaceObject([[antennaeMap.dsn2]]),
      dsn3: makeSpaceObject([[antennaeMap.dsn3]]),
    };

    let scenarios = [
      ...([
        {
          label: 'Internal=0 100%',
          distance: 0,
          expectedStrength: 1,
        },
        {
          label: 'Internal=1.09e6m 73%',
          distance: 1.09e6,
          expectedStrength: .73,
        },
        {
          label: 'Internal=3.09e6m 1%',
          distance: 3.09e6,
          expectedStrength: .01,
        },
        {
          label: 'Internal=3.15e6m 0%',
          distance: 3.15e6,
          expectedStrength: 0,
        },
      ] as SignalScenario[]).map(ss => ({...ss, craft: spaceObjectMap.internal})),

      ...([
        {
          label: 'Communotron16=0 100%',
          distance: 0,
          expectedStrength: 1,
        },
        {
          label: 'Communotron16=1.75e6 100%',
          distance: 1.75e6,
          expectedStrength: 1,
        },
        {
          label: 'Communotron16=16.1e6 49%',
          distance: 16.1e6,
          expectedStrength: .49,
        },
        {
          label: 'Communotron16=30.1e6 1%',
          distance: 30.1e6,
          expectedStrength: .01,
        },
        {
          label: 'Communotron16=32.1e6 0%',
          distance: 32.1e6,
          expectedStrength: 0,
        },
      ] as SignalScenario[]).map(ss => ({...ss, craft: spaceObjectMap.communotron16})),

      ...([
        {
          label: 'HG-5-high-gain=0 100%',
          distance: 0,
          expectedStrength: 1,
        },
        {
          label: 'HG-5-high-gain=6.6e6   99%',
          distance: 6.6e6,
          expectedStrength: .99,
        },
        {
          label: 'HG-5-high-gain=46.4e6  56%',
          distance: 46.4e6,
          expectedStrength: .56,
        },
        {
          label: 'HG-5-high-gain=95.4e6  1%',
          distance: 95.4e6,
          expectedStrength: .01,
        },
        {
          label: 'HG-5-high-gain=105.7e6 0%',
          distance: 105.7e6,
          expectedStrength: 0,
        },
      ] as SignalScenario[]).map(ss => ({...ss, craft: spaceObjectMap.hg5HighGain})),

      ...([
        {
          label: 'Communotron16-RA-100=0 100%',
          distance: 0,
          expectedStrength: 1,
        },
        {
          label: 'Communotron16-RA-100=14.5e6  99%',
          distance: 14.5e6,
          expectedStrength: .99,
        },
        {
          label: 'Communotron16-RA-100=114e6   49%',
          distance: 114e6,
          expectedStrength: .49,
        },
        {
          label: 'Communotron16-RA-100=213e6   1%',
          distance: 213e6,
          expectedStrength: .01,
        },
        {
          label: 'Communotron16-RA-100=227.3e6 0%',
          distance: 227.3e6,
          expectedStrength: 0,
        },
      ] as SignalScenario[]).map(ss => ({
        ...ss,
        craft: spaceObjectMap.communotron16,
        relay: spaceObjectMap.ra100Relay
      })),

      ...([
        {
          label: 'Communotron16-DSN2=0 100%',
          distance: 0,
          expectedStrength: 1,
        },
        {
          label: 'Communotron16-DSN2=12.77e6 99%',
          distance: 12.77e6,
          expectedStrength: .99,
        },
        {
          label: 'Communotron16-DSN2=79.7e6  50%',
          distance: 79.7e6,
          expectedStrength: .5,
        },
        {
          label: 'Communotron16-DSN2=149.4e6 1%',
          distance: 149.4e6,
          expectedStrength: .01,
        },
        {
          label: 'Communotron16-DSN2=163.9e6 0%',
          distance: 163.9e6,
          expectedStrength: 0,
        },
      ] as SignalScenario[]).map(ss => ({...ss, craft: spaceObjectMap.communotron16, relay: spaceObjectMap.dsn2})),

      ...([
        {
          label: 'Communotron16-DSN3=0 100%',
          distance: 0,
          expectedStrength: 1,
        },
        {
          label: 'Communotron16-DSN3=23.77e6 99%',
          distance: 23.77e6,
          expectedStrength: .99,
        },
        {
          label: 'Communotron16-DSN3=178.7e6 50%',
          distance: 178.7e6,
          expectedStrength: .5,
        },
        {
          label: 'Communotron16-DSN3=336e6   1%',
          distance: 336e6,
          expectedStrength: .01,
        },
        {
          label: 'Communotron16-DSN3=356e6   0%',
          distance: 356e6,
          expectedStrength: 0,
        },
      ] as SignalScenario[]).map(ss => ({...ss, craft: spaceObjectMap.communotron16, relay: spaceObjectMap.dsn3})),

      ...([
        {
          label: 'Communotron16-easy=0 100%',
          distance: 0,
          expectedStrength: 1,
        },
        {
          label: 'Communotron16-easy=2.43e6 99%',
          distance: 2.43e6,
          expectedStrength: .99,
        },
        {
          label: 'Communotron16-easy=19.3e6 50%',
          distance: 19.3e6,
          expectedStrength: .5,
        },
        {
          label: 'Communotron16-easy=38e6   1%',
          distance: 38e6,
          expectedStrength: .01,
        },
      ] as SignalScenario[]).map(ss => ({
        ...ss,
        craft: spaceObjectMap.communotron16,
        difficulty: DifficultySetting.easy
      })),

      ...([
        {
          label: 'Communotron16-hard=0 100%',
          distance: 0,
          expectedStrength: 1,
        },
        {
          label: 'Communotron16-hard=1.75e6  99%',
          distance: 1.75e6,
          expectedStrength: .99,
        },
        {
          label: 'Communotron16-hard=12.88e6 50%',
          distance: 12.88e6,
          expectedStrength: .5,
        },
        {
          label: 'Communotron16-hard=24.56e6 1%',
          distance: 24.56e6,
          expectedStrength: .01,
        },
      ] as SignalScenario[]).map(ss => ({
        ...ss,
        craft: spaceObjectMap.communotron16,
        difficulty: DifficultySetting.hard
      })),

      ...([
        {
          label: 'RA-15+RA-100=88.394e9 46%',
          distance: 88.394e9,
          expectedStrength: .46,
          craft: makeSpaceObject([[antennaeMap.internal], [antennaeMap.ra15Relay], [antennaeMap.ra100Relay]]),
        },
        {
          label: 'RA-15+RA-100+RA-2=88.396e9 46%',
          distance: 88.396e9,
          expectedStrength: .46,
          craft: makeSpaceObject([[antennaeMap.internal], [antennaeMap.ra15Relay], [antennaeMap.ra100Relay], [antennaeMap.ra2Relay]]),
        },
        {
          label: '5xRA-15+1xRA-100=88.396e9 57%',
          distance: 88.396e9,
          expectedStrength: .57,
          craft: makeSpaceObject([[antennaeMap.internal], [antennaeMap.ra15Relay, 5], [antennaeMap.ra100Relay]]),
        },
        {
          label: '10xRA-15+1xRA-100=88.396e9 66%',
          distance: 88.396e9,
          expectedStrength: .66,
          craft: makeSpaceObject([[antennaeMap.internal], [antennaeMap.ra15Relay, 10], [antennaeMap.ra100Relay]]),
        },
      ] as SignalScenario[]).map(ss => ({...ss, relay: spaceObjectMap.dsn3, difficulty: DifficultySetting.normal})),

    ] as AntennaScenario[];

    scenarios.forEach(scenario => {
      it(scenario.label, () => {
        setupServiceMock.difficultySetting = scenario.difficulty ?? DifficultySetting.normal;

        scenario.craft.location.x = scenario.distance;

        let transmissionLine = new TransmissionLine([
            scenario.craft,
            scenario.relay ?? spaceObjectMap.dsn1],
          setupServiceMock);

        let roundError = .01;
        let isBetween = transmissionLine.strengthTotal.between(scenario.expectedStrength - roundError,
          scenario.expectedStrength + roundError);

        expect(isBetween).toBeTruthy(`Expected strength:${transmissionLine.strengthTotal} to be ${scenario.expectedStrength}`);
      });
    });

    // todo: do colors match the strength?

  });
});
