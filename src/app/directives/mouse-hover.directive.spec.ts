import { MouseHoverDirective } from './mouse-hover.directive';
import { fakeAsync, tick } from '@angular/core/testing';

describe('MouseHoverDirective', () => {
  let directive: MouseHoverDirective;

  beforeEach(() => {
    directive = new MouseHoverDirective();
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('mouseOver() should emit true', () => {
    spyOn(directive.hoverChange, 'emit');

    directive.mouseOver();
    expect(directive.hoverChange.emit).toHaveBeenCalledWith(true);
  });

  it('mouseLeave() should not immediately emit', () => {
    spyOn(directive.hoverChange, 'emit');

    directive.mouseLeave();
    expect(directive.hoverChange.emit).not.toHaveBeenCalled();
  });

  it('mouseLeave() should after time emit false', fakeAsync(() => {
    spyOn(directive.hoverChange, 'emit');

    directive.mouseLeave();
    tick(2000);
    expect(directive.hoverChange.emit).toHaveBeenCalledWith(false);
  }));

});
