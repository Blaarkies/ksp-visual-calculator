import { MockBuilder, MockService } from 'ng-mocks';
import { AppModule } from '../app.module';
import { DataService } from './data.service';

let serviceType = DataService;
describe(serviceType.name, () => {

  beforeEach(() => MockBuilder(serviceType).mock(AppModule));

  it('should be created', () => {
    let service = MockService(serviceType);
    expect(service).toBeDefined();
  });

});
