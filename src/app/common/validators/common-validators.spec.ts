import { CommonValidators } from './common-validators';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ineeda } from 'ineeda';

describe('CommonValidators class', () => {

  describe('uniqueString', () => {
    let oldStrings = ['A', 'B'];

    let validator: ValidatorFn;
    beforeEach(() => {
      validator = CommonValidators.uniqueString(oldStrings);
    });

    it('unique strings should return no error', () => {
      let control = ineeda<AbstractControl>({value: 'C'});
      let result = validator(control);
      expect(result).toBeNull();
    });

    it('duplicate strings should return error', () => {
      let duplicateString = 'B';
      let control = ineeda<AbstractControl>({value: duplicateString});
      let result = validator(control);
      expect(result.duplicateString).toBe(duplicateString);
    });

    it('differently cased duplicate strings should still return error', () => {
      let casedDuplicate = 'b';
      let control = ineeda<AbstractControl>({value: casedDuplicate});
      let result = validator(control);
      expect(result.duplicateString).toBe(casedDuplicate);
    });

    it('whitespace padded duplicate strings should still return error', () => {
      let paddedDuplicate = '  B  ';
      let control = ineeda<AbstractControl>({value: paddedDuplicate});
      let result = validator(control);
      expect(result.duplicateString).toBe(paddedDuplicate);
    });

  });

});
