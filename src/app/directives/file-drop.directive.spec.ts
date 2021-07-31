import { FileDropDirective } from './file-drop.directive';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ineeda } from 'ineeda';
import { fakeAsync, tick } from '@angular/core/testing';

describe('FileDropDirective', () => {
  let directive: FileDropDirective;
  let directiveAsAny: any;
  let event: DragEvent;

  beforeEach(() => {
    directive = new FileDropDirective(ineeda<MatSnackBar>({
      open: () => void 0,
    }));
    directiveAsAny = directive as any;
    event = ineeda<DragEvent>({
      preventDefault: () => void 0,
      stopPropagation: () => void 0,
    });
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('onDragOver() should add classOver', () => {
    directiveAsAny.onDragOver(event);

    expect(directiveAsAny.classOver).toBeTrue();
    expect(directiveAsAny.classLeave).toBeFalse();
    expect(directiveAsAny.classEvent).toBeFalse();
  });

  it('onDragLeave() should add classLeave', fakeAsync(() => {
    directiveAsAny.onDragLeave(event);

    expect(directiveAsAny.classOver).toBeFalse();
    expect(directiveAsAny.classLeave).toBeTrue();
    expect(directiveAsAny.classEvent).toBeFalse();

    tick(900);
    expect(directiveAsAny.classLeave).toBeFalse();
  }));

  it('onDrop() files & no whitelist type should emit', () => {
    spyOn(directive.fileDrop, 'emit');

    event = ineeda<DragEvent>({
      preventDefault: () => void 0,
      stopPropagation: () => void 0,
      dataTransfer: {
        files: [
          {type: 'application/json'},
        ],
      } as any,
    });
    directiveAsAny.onDrop(event);

    expect(directive.fileDrop.emit).toHaveBeenCalled();
  });

  it('onDrop() with whitelist & invalid file type should fail', () => {
    spyOn(directiveAsAny.snackBar, 'open');

    event = ineeda<DragEvent>({
      preventDefault: () => void 0,
      stopPropagation: () => void 0,
      dataTransfer: {
        files: [
          {type: 'application/json'},
        ],
      } as any,
    });
    directive.fileTypeWhitelist = ['kerbal/document'];
    directiveAsAny.onDrop(event);

    expect(directiveAsAny.snackBar.open).toHaveBeenCalled();
  });

  it('onDrop() with whitelist & valid file type should emit', () => {
    spyOn(directive.fileDrop, 'emit');

    event = ineeda<DragEvent>({
      preventDefault: () => void 0,
      stopPropagation: () => void 0,
      dataTransfer: {
        files: [
          {type: 'application/json'},
        ],
      } as any,
    });
    directive.fileTypeWhitelist = ['application/json'];
    directiveAsAny.onDrop(event);

    expect(directive.fileDrop.emit).toHaveBeenCalled();
  });

});
