import { LocationConstraints } from './location-constraints';
import { OrbitParameterData } from './space-objects/orbit-parameter-data';
import { Vector2 } from './vector2';

describe('LocationConstraints class', () => {

  it('fromMoveType() should return correction callback', () => {
    let noMove = LocationConstraints.fromMoveType('noMove',
      {xy: [0, 0]} as OrbitParameterData);

    expect(noMove(1, 1)).toEqual([0, 0]);

    let freeMove = LocationConstraints.fromMoveType('freeMove',
      {xy: [0, 0]} as OrbitParameterData);

    expect(freeMove(1, 1)).toEqual([1, 1]);

    let soiLock = LocationConstraints.fromMoveType('soiLock',
      {
        xy: [0, 0],
        parent: {location: new Vector2(10, 0)},
      } as OrbitParameterData);

    expect(soiLock(1, 1)).toEqual([-9, 1]);

    let circularMove = LocationConstraints.fromMoveType('orbital',
      {
        xy: [0, 0],
        r: 10,
      } as OrbitParameterData);

    expect(circularMove(6, 1)).toEqual([9.863939238321437, 1.643989873053573]);
  });

});
