import { AntennaStatsComponent } from './antenna-stats.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { AntennaInput } from '../antenna-selector/antenna-input';
import { Antenna } from '../../common/domain/antenna';
import { AntennaPart } from '../../services/json-interfaces/antenna-part';

let componentType = AntennaStatsComponent;
describe('AntennaStatsComponent', () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;
    component.updateStats([]);

    expect(component).toBeDefined();
  });

  let defaultAntennaJson: AntennaPart = {
    label: 'Communotron 16',
    cost: 300,
    mass: 0.005,
    electricityPMit: 6,
    electricityPS: 20,
    transmissionSpeed: 3.33,
    relay: false,
    tier: 1,
    powerRating: 500e3,
    combinabilityExponent: 1,
  };

  let defaultAntenna = Antenna.fromAntennaPart(defaultAntennaJson);

  it('updateStats() should fill in properties', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;
    component.updateStats([
      new AntennaInput(defaultAntenna, 2),
    ]);

    expect(component.stats).toEqual({
      totalPowerRating: 1000000,
      totalCost: 600,
      totalMass: .01,
      totalElectricityPMit: 12,
      totalElectricityPS: 40,
      totalTransmissionSpeed: 6.66,
      relayBias: 0,
      averageCombinabilityExponent: 1,
    });

    expect(component.displayStats.length).toBeGreaterThan(0);
  });

});
