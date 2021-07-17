import { MockBuilder, MockService } from 'ng-mocks';
import { AppModule } from '../app.module';
import { HudService } from './hud.service';

let serviceType = HudService;
describe(serviceType.name, () => {

  beforeEach(() => MockBuilder(serviceType)
    .mock(AppModule));

  it('should be created', () => {
    let service = MockService(serviceType);
    expect(service).toBeDefined();
  });

});
