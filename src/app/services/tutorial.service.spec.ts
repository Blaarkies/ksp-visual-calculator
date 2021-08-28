import { TutorialService } from './tutorial.service';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../app.module';

let serviceType = TutorialService;
describe('TutorialService', () => {

  beforeEach(() => MockBuilder(serviceType).mock(AppModule));

  it('should be created', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    expect(service).toBeDefined();
  });

});
