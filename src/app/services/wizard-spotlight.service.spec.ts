import { WizardSpotlightService } from './wizard-spotlight.service';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../app.module';

let serviceType = WizardSpotlightService;
describe('WizardSpotlightService', () => {

  beforeEach(() => MockBuilder(serviceType).mock(AppModule));

  it('should be created', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    expect(service).toBeDefined();
  });

});
