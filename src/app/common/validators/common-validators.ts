import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CommonValidators {

  static uniqueString(existingStrings: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      let newString = control.value as string;
      return existingStrings.find(s => s.like(newString))
        ? {duplicateString: newString}
        : null;
    };
  }

}
