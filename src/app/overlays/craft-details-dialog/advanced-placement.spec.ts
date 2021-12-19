import { AdvancedPlacement, AngleConvertType } from './advanced-placement';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { ineeda } from 'ineeda';
import { Vector2 } from '../../common/domain/vector2';
import objectContaining = jasmine.objectContaining;

describe('AdvancedPlacement class', () => {

  it('location() should return correct location', () => {
    let placement = AdvancedPlacement.fromObject({
      orbitParent: ineeda<SpaceObject>({
        equatorialRadius: 100,
        location: new Vector2(900),
      }),
      altitude: 500,
      angle: 242,
    }, 'deg->rad');

    expect(placement.location).toEqual(objectContaining({
      x: 618.3171238736529,
      y: 529.7685884395082,
    }));
  });

  let degRad: AngleConvertType = 'deg->rad';
  let radDeg: AngleConvertType = 'rad->deg';
  let typeToUnitMap = new Map<AngleConvertType, { from, to }>([
    [degRad, {from: 'degrees', to: 'radians'}],
    [radDeg, {from: 'radians', to: 'degrees'}],
    [undefined, {from: '', to: ''}],
  ]);

  describe('fromObject() constructs with correct values', () => {
    [
      [0, 0],
      [89, 89],
      [359, 359],
      [0, 0, degRad],
      [89, 1.553343077, degRad],
      [359, 6.265732187, degRad],
      [0, 0, radDeg],
      [1, 57.295779513, radDeg],
      [3.14, 179.90874767082, radDeg],
    ]
      .map(([angle, expected, type]) => {
        let objectForm = {
          orbitParent: 0 as any,
          altitude: 0 as any,
          angle,
        };
        let placement = AdvancedPlacement.fromObject(objectForm, type as AngleConvertType);
        return [angle, type, placement, expected];
      })
      .forEach(([angle, type, placement, expected]: [number, AngleConvertType, AdvancedPlacement, number]) => {
        let {from, to} = typeToUnitMap.get(type);

        it(`converting ${angle} ${from} to ${placement.angle} ${to} should be ${expected}`, () =>
          expect(placement.angle).toBe(expected));
      });
  });

});
