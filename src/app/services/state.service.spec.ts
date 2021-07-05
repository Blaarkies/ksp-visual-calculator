import { MockBuilder, MockService } from 'ng-mocks';
import { AppModule } from '../app.module';
import { StateService } from './state.service';

let serviceType = StateService;
describe(serviceType.name, () => {

  beforeEach(() => MockBuilder(serviceType).mock(AppModule));

  it('should be created', () => {
    let service = MockService(serviceType);
    expect(service).toBeDefined();
  });

});
