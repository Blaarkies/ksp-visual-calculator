import { Antenna } from './antenna';
import { Icons } from '../../../common/domain/icons';

// Most antenna tests happen in "domain.spec.ts", tested against in-game results
describe('Antenna class', () => {

  it('when transmissionSpeed & combinabilityExponent are 0, icon should return Construction type', () => {
    let antenna = new Antenna('', 0, 0, 0, 0, 0, false, 0, 0, 0);
    expect(antenna.icon).toBe(Icons.Construction);
  });

  it('when label includes "Tracking Station", icon should return Construction type', () => {
    let antenna = new Antenna('Tracking Station 3', 0, 0, 0, 0, 1, false, 0, 0, 1);
    expect(antenna.icon).toBe(Icons.Construction);
  });

  it('when relay is true, icon should return Relay type', () => {
    let antenna = new Antenna('', 0, 0, 0, 0, 1, true, 0, 0, 1);
    expect(antenna.icon).toBe(Icons.Relay);
  });

  it('when relay is false, icon should return Antenna type', () => {
    let antenna = new Antenna('', 0, 0, 0, 0, 1, false, 0, 0, 1);
    expect(antenna.icon).toBe(Icons.Antenna);
  });


});
