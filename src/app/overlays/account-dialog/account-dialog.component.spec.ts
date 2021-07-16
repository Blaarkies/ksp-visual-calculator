import { AccountDialogComponent } from './account-dialog.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { MatDialogRef } from '@angular/material/dialog';

let componentType = AccountDialogComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(MatDialogRef));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
