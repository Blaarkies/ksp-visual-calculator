import { SpaceObjectType } from './space-object-type';

describe('SpaceObjectType class', () => {

  describe('fromString() constructor', () => {

    it('correct cased string should match a type', () => {
      let craftType = SpaceObjectType.fromString('star');
      expect(craftType).toBeDefined();
    });

    it('bad cased string should throw error', () => {
      expect(() => SpaceObjectType.fromString('Star')).toThrow();
    });

    it('wrong string should throw error', () => {
      expect(() => SpaceObjectType.fromString('walking')).toThrow();
    });

  });
});
