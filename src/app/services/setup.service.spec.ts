import { SetupService } from './setup.service';
import { MockBuilder, MockService } from 'ng-mocks';
import { AppModule } from '../app.module';

let serviceType = SetupService;
describe(serviceType.name, () => {

  beforeEach(() => MockBuilder(serviceType).mock(AppModule));

  it('should be created', () => {
    let service = MockService(serviceType);
    expect(service).toBeDefined();
  });

});
