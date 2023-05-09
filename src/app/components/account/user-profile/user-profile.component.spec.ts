import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { UserProfileComponent } from './user-profile.component';
import { AnalyticsService } from '../../../services/analytics.service';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import createSpy = jasmine.createSpy;

let componentType = UserProfileComponent;
describe('UserProfileComponent', () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('openAccountDialog() should call dialog.open', () => {
    let spyLogEvent = MockInstance(AnalyticsService, 'logEvent', createSpy());
    let spyOpen = MockInstance(MatDialog, 'open', createSpy().and
      .returnValue({afterClosed: () => of(0)}));

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    component.openAccountDialog();

    expect(spyLogEvent).toHaveBeenCalled();
    expect(spyOpen).toHaveBeenCalled();
  });

});
