import { ZoomIndicatorComponent } from './zoom-indicator.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';

let componentType = ZoomIndicatorComponent;
describe('ZoomIndicatorComponent', () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  let zoomLimits = [0, 1];

  it('should create', () => {
    let fixture = MockRender(componentType, {zoomLimits});
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('set cameraScale should change zoom', () => {
    let fixture = MockRender(componentType, {zoomLimits});
    let component = fixture.point.componentInstance;

    let oldZoom = component.zoomPoint;
    spyOn((component as any).zoomChange$, 'next');

    component.cameraScale = .5;

    let newZoom = component.zoomPoint;
    expect(oldZoom).not.toBe(newZoom);
    expect((component as any).zoomChange$.next).toHaveBeenCalled();
  });

  it('set zoomLimits should change range & limits', () => {
    let fixture = MockRender(componentType, {zoomLimits});
    let component = fixture.point.componentInstance;

    let componentAsAny = component as any;
    let oldLimits = componentAsAny.limits;
    let oldRange = componentAsAny.range;
    let oldPositions = componentAsAny.range;

    component.zoomLimits = [0, 2];

    let newLimits = componentAsAny.limits;
    let newRange = componentAsAny.range;
    let newPositions = componentAsAny.range;

    expect(oldLimits).not.toEqual(newLimits);
    expect(oldRange).not.toBe(newRange);
    expect(oldPositions).not.toEqual(newPositions);
  });

});
