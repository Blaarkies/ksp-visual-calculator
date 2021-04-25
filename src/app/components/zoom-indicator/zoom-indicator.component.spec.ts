import { ZoomIndicatorComponent } from './zoom-indicator.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';

let componentType = ZoomIndicatorComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType, {
      zoomLimits: [0, 1],
    });
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
