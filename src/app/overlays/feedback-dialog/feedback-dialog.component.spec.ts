import { FeedbackDialogComponent } from './feedback-dialog.component';
import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import createSpy = jasmine.createSpy;

let componentType = FeedbackDialogComponent;
describe('FeedbackDialogComponent', () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(HttpClient, {post: () => of()} as any)
    .mock(MatSnackBar, {open: () => ({onAction: () => of()})} as any));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('submitFeedback() should call http with data', async () => {
    let spyPost = MockInstance(HttpClient, 'post', createSpy()
      .and.returnValue(of(0)));

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    component.inputFields.name.control.setValue('test-name');
    component.inputFields.contact.control.setValue('test-contact');
    component.inputFields.feedback.control.setValue('test-feedback');

    await component.submitFeedback();

    expect(spyPost).toHaveBeenCalled();
  });

});
