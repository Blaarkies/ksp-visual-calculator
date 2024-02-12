import { Icons } from '../../../common/domain/icons';
import {
  Antenna,
  ProbeControlPoint,
} from './antenna';

describe('Antenna class', () => {

  it('when a ProbeControlPoint is included, icon should return Pilot type', () => {
    let antenna = new Antenna('', 0, 0, 0, 0, 0, false, 0, 0, 0, ProbeControlPoint.MultiHop);
    expect(antenna.icon).to.be.equal(Icons.Pilot);
  });

  it('when label includes "Tracking Station", icon should return Construction type', () => {
    let antenna = new Antenna('Tracking Station 3', 0, 0, 0, 0, 1, false, 0, 0, 1);
    expect(antenna.icon).to.be.equal(Icons.Construction);
  });

  it('when relay is true, icon should return Relay type', () => {
    let antenna = new Antenna('', 0, 0, 0, 0, 1, true, 0, 0, 1);
    expect(antenna.icon).to.be.equal(Icons.Relay);
  });

  it('when label includes "Ground", icon should return Experiment type', () => {
    let antenna = new Antenna('Ground', 0, 0, 0, 0, 1, false, 0, 0, 1);
    expect(antenna.icon).to.be.equal(Icons.Experiment);
  });

  it('when label includes "Experiment", icon should return Experiment type', () => {
    let antenna = new Antenna('Experiment', 0, 0, 0, 0, 1, false, 0, 0, 1);
    expect(antenna.icon).to.be.equal(Icons.Experiment);
  });

  it('when no distinct props are provided, icon should return Antenna type', () => {
    let antenna = new Antenna('', 0, 0, 0, 0, 1, false, 0, 0, 1);
    expect(antenna.icon).to.be.equal(Icons.Antenna);
  });

});
