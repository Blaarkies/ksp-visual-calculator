import { DoublePointerActionDirective } from './double-pointer-action.directive';
import { ineeda } from 'ineeda';
import { fakeAsync, tick } from '@angular/core/testing';

describe('DoublePointerActionDirective', () => {
  let directive: DoublePointerActionDirective;

  beforeEach(() => {
    directive = new DoublePointerActionDirective();
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  let mockPointerEvent = ineeda<PointerEvent>();

  it('click 1x should not call doubleAction()', () => {
    spyOn(directive.doubleAction, 'emit');

    directive.pointerUp(mockPointerEvent);

    expect(directive.doubleAction.emit).not.toHaveBeenCalled();
  });

  it('click 2x rapidly should call doubleAction()', () => {
    spyOn(directive.doubleAction, 'emit');

    directive.pointerUp(mockPointerEvent);
    directive.pointerUp(mockPointerEvent);

    expect(directive.doubleAction.emit).toHaveBeenCalled();
  });

  it('click 2x in 100ms should call doubleAction()', fakeAsync(() => {
    spyOn(directive.doubleAction, 'emit');

    directive.pointerUp(mockPointerEvent);
    tick(100);
    directive.pointerUp(mockPointerEvent);

    expect(directive.doubleAction.emit).toHaveBeenCalled();
  }));

  it('click 2x too slow should not call doubleAction()', fakeAsync(() => {
    spyOn(directive.doubleAction, 'emit');

    directive.pointerUp(mockPointerEvent);
    tick(900);
    directive.pointerUp(mockPointerEvent);

    expect(directive.doubleAction.emit).not.toHaveBeenCalled();
  }));

  it('click 3x should call doubleAction() once', () => {
    spyOn(directive.doubleAction, 'emit');

    directive.pointerUp(mockPointerEvent);
    directive.pointerUp(mockPointerEvent);
    directive.pointerUp(mockPointerEvent);

    expect(directive.doubleAction.emit).toHaveBeenCalledTimes(1);
  });

});
