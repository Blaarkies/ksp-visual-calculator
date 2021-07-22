import { CraftType } from './craft-type';

describe('CraftType class', () => {

  describe('fromString() constructor', () => {

    it('correct cased string should match a type', () => {
      let craftType = CraftType.fromString('Debris');
      expect(craftType).toBeDefined();
    });

    it('bad cased string should throw error', () => {
        expect(() => CraftType.fromString('debris')).toThrow();
    });

    it('wrong string should throw error', () => {
      expect(() => CraftType.fromString('walking')).toThrow();
    });

  });
});
