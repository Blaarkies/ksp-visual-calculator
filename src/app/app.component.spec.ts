import { AppComponent } from './app.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from './app.module';
import { MatDialog } from '@angular/material/dialog';
import { ineeda } from 'ineeda';
import { EMPTY } from 'rxjs';

let componentType = AppComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(MatDialog, ineeda<MatDialog>({
      open: () => ({
        afterClosed: () => EMPTY,
      }),
    } as any)));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
