import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ManageStateDialogComponent, ManageStateDialogData } from './manage-state-dialog.component';
import { ineeda } from 'ineeda';
import { UsableRoutes } from '../../usable-routes';
import { StateService } from '../../services/state.service';
import { EMPTY } from 'rxjs';

let componentType = ManageStateDialogComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(MatDialogRef)
    .mock(MAT_DIALOG_DATA, ineeda<ManageStateDialogData>({
      context: UsableRoutes.SignalCheck,
    }))
    .mock(StateService, ineeda<StateService>({getStates: () => EMPTY})),
  );

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
