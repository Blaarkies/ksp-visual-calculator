import { BuyMeACoffeeDialogComponent } from './buy-me-a-coffee-dialog.component';
import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { AnalyticsService } from '../../services/analytics.service';
import createSpy = jasmine.createSpy;

let componentType = BuyMeACoffeeDialogComponent;
describe('BuyMeACoffeeDialogComponent', () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('logCoffeeEvent() should call logEvent()', () => {
    let spyLogEvent = MockInstance(AnalyticsService, 'logEvent', createSpy());

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    component.logCoffeeEvent();

    expect(spyLogEvent).toHaveBeenCalled();
  });

});
