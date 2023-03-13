import { Craft } from './craft';
import { CraftType } from './craft-type';
import { UniverseContainerInstance } from '../../../services/universe-container-instance.service';
import { Vector2 } from '../vector2';
import { SpaceObject } from './space-object';

interface Scenario {
  craftLocation: Vector2;
  equatorialRadius: number;
  expectedAltitude: string;
}

let craftName = 'Test Craft';
let craftType = CraftType.Relay;

describe('Craft class', () => {

  beforeEach(() => {
    new UniverseContainerInstance();
  });

  afterAll(() => {
    delete UniverseContainerInstance.instance;
  });

  describe('displayAltitude', () => {

    let scenarios: Scenario[] = [
      {
        craftLocation: new Vector2(0, 0),
        equatorialRadius: 0,
        expectedAltitude: '0 m',
      },
      {
        craftLocation: new Vector2(100, 0),
        equatorialRadius: 0,
        expectedAltitude: '100 m',
      },
      {
        craftLocation: new Vector2(10e3, 0),
        equatorialRadius: 0,
        expectedAltitude: '10 km',
      },
      {
        craftLocation: new Vector2(100, 0),
        equatorialRadius: 80,
        expectedAltitude: '20 m',
      },
      {
        craftLocation: new Vector2(100, 100),
        equatorialRadius: 0,
        expectedAltitude: '141.421 m',
      },
      {
        craftLocation: new Vector2(-100, -100),
        equatorialRadius: 0,
        expectedAltitude: '141.421 m',
      },
    ];

    scenarios.forEach(scenario => {
      let itName = scenario.equatorialRadius > 0
        ? `craft at "${scenario.craftLocation.toList()}" should have altitude "${scenario.expectedAltitude}" over planet with ${scenario.equatorialRadius} m radius`
        : `craft at "${scenario.craftLocation.toList()}" should have altitude "${scenario.expectedAltitude}"`;
      it(itName, () => {
        UniverseContainerInstance.instance.getSoiParent = () => ({
          location: Vector2.zero,
          equatorialRadius: scenario.equatorialRadius,
        } as SpaceObject);

        let craft = new Craft(craftName, craftType);
        craft.location.setVector2(scenario.craftLocation);

        expect(craft.displayAltitude).toBe(scenario.expectedAltitude);
      });
    });

  });
});

