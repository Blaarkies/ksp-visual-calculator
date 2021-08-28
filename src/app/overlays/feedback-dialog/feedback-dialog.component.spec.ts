import { FeedbackDialogComponent } from './feedback-dialog.component';
import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { AnalyticsService } from '../../services/analytics.service';
import createSpy = jasmine.createSpy;
import { ineeda } from 'ineeda';

let componentType = FeedbackDialogComponent;
describe('FeedbackDialogComponent', () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(MatDialogRef, {afterClosed: () => of()})
    .mock(MatSnackBar, {open: () => ({onAction: () => of()})} as any));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('constructor should warn user that analytics tracking is disabled', () => {
    MockInstance(AnalyticsService, 'isTracking', false);
    let spyOpen = MockInstance(MatSnackBar, 'open', createSpy()
      .and.returnValue(ineeda<MatSnackBarRef<any>>({
        onAction: () => of(void 0),
      })));

    MockRender(componentType);

    expect(spyOpen).toHaveBeenCalled();
  });

  it('click Enable on snackbar should call analyticsService.setActive(true)', () => {
    MockInstance(AnalyticsService, 'isTracking', false);
    let spySetActive = MockInstance(AnalyticsService, 'setActive', createSpy());

    MockInstance(MatSnackBar, 'open', createSpy()
      .and.returnValue(ineeda<MatSnackBarRef<any>>({
        onAction: () => of(void 0),
      })));

    MockRender(componentType);
    expect(spySetActive).toHaveBeenCalledWith(true);
  });

  it('submitFeedback() should call dialogRef with data', () => {
    let spyClose = MockInstance(MatDialogRef, 'close', createSpy());

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    component.inputFields.name.control.setValue('test-name');
    component.inputFields.contact.control.setValue('test-contact');
    component.inputFields.feedback.control.setValue('test-feedback');

    component.submitFeedback();

    expect(spyClose).toHaveBeenCalled();
    let output = spyClose.calls.mostRecent().args[0];

    expect(output.name).toBe('test-name');
    expect(output.contact).toBe('test-contact');
    expect(output.feedback).toBe('test-feedback');
  });

  it('submitFeedback(), when no feedback provided, should call dialogRef with null', () => {
    let spyClose = MockInstance(MatDialogRef, 'close', createSpy());

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    component.inputFields.name.control.setValue('test-name');
    component.inputFields.contact.control.setValue('test-contact');
    component.inputFields.feedback.control.setValue('');

    component.submitFeedback();

    expect(spyClose).toHaveBeenCalledWith(null);
  });

});
