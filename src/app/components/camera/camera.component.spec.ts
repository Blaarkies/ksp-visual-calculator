import { CameraComponent } from './camera.component';
import { MockBuilder, MockRender, MockService } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { CameraService } from '../../services/camera.service';

let componentType = CameraComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(CameraService, {
      scale: 1,
    }));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
