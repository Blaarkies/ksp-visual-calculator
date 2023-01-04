import { AnalyticsDialogComponent } from './analytics-dialog.component';
import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { AnalyticsService } from '../../services/analytics.service';
import createSpy = jasmine.createSpy;

let componentType = AnalyticsDialogComponent;
describe('PrivacyDialogComponent', () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('changes to trackingControl should call analyticsService.setActive', () => {
    MockInstance(AnalyticsService, 'isTracking', true);
    let spySetActive = MockInstance(AnalyticsService, 'setActive', createSpy());

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    component.trackingControl.setValue(false);
    expect(spySetActive).toHaveBeenCalled();
  });

});
