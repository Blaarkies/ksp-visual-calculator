import { FileDropDirective } from './file-drop.directive';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ineeda } from 'ineeda';

describe(FileDropDirective.name, () => {
  it('should create an instance', () => {
    const directive = new FileDropDirective(ineeda<MatSnackBar>());
    expect(directive).toBeTruthy();
  });
});
