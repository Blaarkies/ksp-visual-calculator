import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { AccountDetailsComponent } from './account-details.component';
import { MatSnackBar } from '@angular/material/snack-bar';

let componentType = AccountDetailsComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(MatSnackBar)
  );

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
