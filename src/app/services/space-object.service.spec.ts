import { SpaceObjectService } from './space-object.service';
import { MockBuilder, MockService } from 'ng-mocks';
import { AppModule } from '../app.module';
import { HttpClient } from '@angular/common/http';

let serviceType = SpaceObjectService;
describe(serviceType.name, () => {

  beforeEach(() => MockBuilder(serviceType)
    .mock(AppModule)
    .provide(HttpClient));

  it('should be created', () => {
    let service = MockService(serviceType);
    expect(service).toBeDefined();
  });

});
