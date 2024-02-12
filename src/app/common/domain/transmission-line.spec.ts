// import { AntennaSignal } from '../../pages/commnet-planner/models/antenna-signal';
// import { ineeda } from 'ineeda';
// import { SetupService } from '../../services/setup.service';
// import { SpaceObject } from './space-objects/space-object';
// import { Vector2 } from './vector2';
//
// let newNode = () => ({
//   location: new Vector2(0, 0),
//   hasRelay: true,
//   antennae: [],
//   powerRatingTotal: 10,
//   powerRatingRelay: 5,
// } as SpaceObject);
//
// describe('TransmissionLine class', () => {
//
//   let mockSetupService = ineeda<SetupService>({
//     difficultySetting: {rangeModifier: 1} as any,
//   });
//
//   let transmissionLine: AntennaSignal;
//
//   beforeEach(() => {
//     let nodes = [newNode(), newNode()];
//     transmissionLine = new AntennaSignal(nodes, mockSetupService);
//   });
//
//   it('textLocation is correct', () => {
//     transmissionLine.nodes[1].location.set([5, 2]);
//     expect(transmissionLine.textLocation.x).toBe(2.5);
//     expect(transmissionLine.textLocation.y).toBe(1);
//   });
//
//   it('displayDistance is correct', () => {
//     transmissionLine.nodes[1].location.set([10, 0]);
//     expect(transmissionLine.displayDistance).toBe('10 m');
//   });
//
//   it('offsetVector is correct', () => {
//     transmissionLine.nodes[1].location.set([10, 0]);
//     expect(transmissionLine.offsetVector.x).toBe(1.2246467991473532e-16);
//     expect(transmissionLine.offsetVector.y).toBe(2);
//   });
//
//   it('angleDeg is correct', () => {
//     transmissionLine.nodes[1].location.set([0, 1]);
//     expect(transmissionLine.angleDeg).toBeCloseTo(90, 1);
//   });
//
//   it('colorTotal is correct', () => {
//     transmissionLine.nodes[1].location.set([3.2, 0]);
//     expect(transmissionLine.colorTotal).toBe('#9f0');
//
//     transmissionLine.nodes[1].location.set([7, 0]);
//
//     expect(transmissionLine.colorTotal).toBe('#f60');
//   });
//
//   it('colorRelay is correct', () => {
//     transmissionLine.nodes[1].location.set([1.2, 0]);
//     expect(transmissionLine.colorRelay).toBe('#5f0');
//
//     transmissionLine.nodes[1].location.set([3.8, 0]);
//
//     expect(transmissionLine.colorRelay).toBe('#f40');
//   });
//
//   it('strengthTotal is correct', () => {
//     expect(transmissionLine.strengthTotal).toBe(1);
//   });
//
//   it('strengthRelay is correct', () => {
//     expect(transmissionLine.strengthRelay).toBe(1);
//   });
//
//   it('when no relay is mounted, strengthTotal should be 0', () => {
//     (transmissionLine.nodes[0] as any).hasRelay = false;
//     (transmissionLine.nodes[1] as any).hasRelay = false;
//     expect(transmissionLine.strengthTotal).toBe(0);
//   });
//
//   it('when out of range, strengthTotal should be 0', () => {
//     transmissionLine.nodes[1].location.set([9e9, 0]);
//     expect(transmissionLine.strengthTotal).toBe(0);
//   });
//
// });
