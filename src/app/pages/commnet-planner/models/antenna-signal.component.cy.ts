import * as antennaPartsJson from '../../../../assets/stock/antenna-parts.json';
import { AntennaDto } from '../../../common/domain/dtos/antenna-dto';
import { Group } from '../../../common/domain/group';
import { Craft } from '../../../common/domain/space-objects/craft';
import { CraftType } from '../../../common/domain/space-objects/craft-type';
import { SpaceObject } from '../../../common/domain/space-objects/space-object';
import { DifficultySetting } from '../components/difficulty-settings-dialog/difficulty-setting';
import { Antenna } from './antenna';
import { AntennaSignal } from './antenna-signal';

describe('AntennaSignal', () => {

  describe('if basic', () => {
    let signal: AntennaSignal;

    beforeEach(() => {
      let craftA = new Craft('', '', CraftType.Base, []);
      craftA.draggable.location.set([1e5, 2e5]);
      let craftB = new Craft('', '', CraftType.Base, []);
      signal = new AntennaSignal([craftA, craftB], () => 1);
    });

    it('exists', () => {
      expect(signal).to.not.be.undefined;
      expect(signal.textLocation).to.not.be.undefined;
      expect(signal.displayDistance).to.not.be.undefined;
      expect(signal.offsetVector).to.not.be.undefined;
      expect(signal.angleDeg).to.not.be.undefined;
      expect(signal.colorTotal).to.not.be.undefined;
      expect(signal.colorRelay).to.not.be.undefined;
      expect(signal.strengthTotal).to.not.be.undefined;
      expect(signal.strengthRelay).to.not.be.undefined;
    });

    it('values correct', () => {
      let antennaGroup = new Group({
        powerRating: 3e5,
        combinabilityExponent: 1,
        relay: true,
      } as Antenna);
      // TODO: create communication through constructor for changeDetection
      signal.nodes[0].communication.instanceAntennae = [antennaGroup];
      signal.nodes[1].communication.instanceAntennae = [antennaGroup];

      expect(signal.textLocation).to.deep.equal({x: 50000, y: 100000});
      expect(signal.displayDistance).to.equal('223.607 km');
      expect(signal.offsetVector).to.deep.equal({ x: 0.8944271909999159, y: -0.447213595499958 });
      expect(signal.angleDeg).to.equal(-116.56505117691052);
      expect(signal.colorTotal).to.equal('#f40');
      expect(signal.colorRelay).to.equal('#f40');
      expect(signal.strengthTotal).to.equal(0.16150665833325542);
      expect(signal.strengthRelay).to.equal(0.16150665833325542);
    });


  });

  describe('if antennae scenarios', () => {
    let {craftMap, scenarios} = getAntennaeTestScenarios();

    scenarios.forEach(({label, distance, difficulty, expectedStrength, craft, relay}) => {

      it(label, () => {
        craft.location.x = distance;

        let transmissionLine = new AntennaSignal([craft, relay ?? craftMap.dsn1],
          () => difficulty?.rangeModifier ?? DifficultySetting.normal.rangeModifier);

        let roundError = .01;
        let strengthTotal = transmissionLine.strengthTotal;

        expect(strengthTotal).to.be.within(
          expectedStrength - roundError, expectedStrength + roundError,
          `Expected strength:${strengthTotal} to be ${expectedStrength}`);
      });
    });
  });

});

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

interface JsonImport<T> {
  default: T;
}

function getAntennaeTestScenarios(): {craftMap, scenarios: AntennaScenario[]} {
  let stockAntennae = ((antennaPartsJson as unknown as JsonImport<AntennaDto[]>).default)
    .map((a: AntennaDto) => Antenna.fromJson(a));

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

  let makeCraft = (antennaeGroups: (Antenna | number)[][]) => {
    let craft = new Craft('', '', CraftType.Base);
    craft.communication.instanceAntennae = antennaeGroups.map(([a,c]) => new Group(a as Antenna, c as number));
    return craft;
  };

  let craftMap = {
    internal: makeCraft([[antennaeMap.internal]]),
    communotron16: makeCraft([[antennaeMap.internal], [antennaeMap.communotron16]]),
    hg5HighGain: makeCraft([[antennaeMap.internal], [antennaeMap.hg5HighGain]]),
    ra100Relay: makeCraft([[antennaeMap.internal], [antennaeMap.ra100Relay]]),
    dsn1: makeCraft([[antennaeMap.dsn1]]),
    dsn2: makeCraft([[antennaeMap.dsn2]]),
    dsn3: makeCraft([[antennaeMap.dsn3]]),
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
    ] as SignalScenario[]).map(ss => ({...ss, craft: craftMap.internal})),

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
    ] as SignalScenario[]).map(ss => ({...ss, craft: craftMap.communotron16})),

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
    ] as SignalScenario[]).map(ss => ({...ss, craft: craftMap.hg5HighGain})),

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
      craft: craftMap.communotron16,
      relay: craftMap.ra100Relay,
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
    ] as SignalScenario[]).map(ss => ({...ss, craft: craftMap.communotron16, relay: craftMap.dsn2})),

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
    ] as SignalScenario[]).map(ss => ({...ss, craft: craftMap.communotron16, relay: craftMap.dsn3})),

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
      craft: craftMap.communotron16,
      difficulty: DifficultySetting.easy,
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
      craft: craftMap.communotron16,
      difficulty: DifficultySetting.hard,
    })),

    ...([
      {
        label: 'RA-15+RA-100=88.394e9 46%',
        distance: 88.394e9,
        expectedStrength: .46,
        craft: makeCraft([[antennaeMap.internal], [antennaeMap.ra15Relay], [antennaeMap.ra100Relay]]),
      },
      {
        label: 'RA-15+RA-100+RA-2=88.396e9 46%',
        distance: 88.396e9,
        expectedStrength: .46,
        craft: makeCraft([[antennaeMap.internal], [antennaeMap.ra15Relay], [antennaeMap.ra100Relay], [antennaeMap.ra2Relay]]),
      },
      {
        label: '5xRA-15+1xRA-100=88.396e9 57%',
        distance: 88.396e9,
        expectedStrength: .57,
        craft: makeCraft([[antennaeMap.internal], [antennaeMap.ra15Relay, 5], [antennaeMap.ra100Relay]]),
      },
      {
        label: '10xRA-15+1xRA-100=88.396e9 66%',
        distance: 88.396e9,
        expectedStrength: .66,
        craft: makeCraft([[antennaeMap.internal], [antennaeMap.ra15Relay, 10], [antennaeMap.ra100Relay]]),
      },
    ] as SignalScenario[]).map(ss => ({...ss, relay: craftMap.dsn3, difficulty: DifficultySetting.normal})),

  ] as AntennaScenario[];
  return {craftMap, scenarios};
}
