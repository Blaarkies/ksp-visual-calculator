import { CraftDetailsDialogComponent, CraftDetailsDialogData } from './craft-details-dialog.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ineeda } from 'ineeda';
import { SpaceObjectService } from '../../services/space-object.service';
import { BehaviorSubject } from 'rxjs';
import { SpaceObject } from '../../common/domain/space-objects/space-object';

let componentType = CraftDetailsDialogComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(MatDialogRef)
    .mock(MAT_DIALOG_DATA, ineeda<CraftDetailsDialogData>({
      forbiddenNames: [],
    }))
    .mock(SpaceObjectService, ineeda<SpaceObjectService>({
      celestialBodies$: {value: []} as BehaviorSubject<SpaceObject[]>,
    }))
  );

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
