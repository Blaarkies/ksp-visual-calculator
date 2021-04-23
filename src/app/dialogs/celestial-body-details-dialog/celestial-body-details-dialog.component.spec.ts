import { CelestialBodyDetailsDialogComponent, CelestialBodyDetailsDialogData } from './celestial-body-details-dialog.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ineeda } from 'ineeda';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { SetupService } from '../../services/setup.service';
import { BehaviorSubject } from 'rxjs';
import { Antenna } from '../../common/domain/antenna';

let componentType = CelestialBodyDetailsDialogComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(MatDialogRef)
    .mock(MAT_DIALOG_DATA, ineeda<CelestialBodyDetailsDialogData>({
      edit: ineeda<SpaceObject>({size: 1}),
      forbiddenNames: [],
    }))
    .mock(SetupService, ineeda<SetupService>({
      availableAntennae$: {value: []} as BehaviorSubject<Antenna[]>,
    })));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
