import { CelestialBodyDetailsDialogComponent, CelestialBodyDetailsDialogData } from './celestial-body-details-dialog.component';
import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ineeda } from 'ineeda';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { SetupService } from '../../services/setup.service';
import { BehaviorSubject } from 'rxjs';
import { Antenna } from '../../common/domain/antenna';
import createSpy = jasmine.createSpy;
import objectContaining = jasmine.objectContaining;

let componentType = CelestialBodyDetailsDialogComponent;
describe('CelestialBodyDetailsDialogComponent', () => {

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

  it('submitDetails() should return CelestialBodyDetails', () => {
    let spyClose = MockInstance(MatDialogRef, 'close', createSpy());

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;
    component.inputFields.name.control.setValue('a');
    component.inputFields.celestialBodyType.control.setValue('b');
    component.inputFields.size.control.setValue('c');
    component.inputFields.orbitColor.control.setValue('d');
    component.inputFields.currentDsn.control.setValue('e');

    component.submitDetails();
    expect(spyClose).toHaveBeenCalledWith(objectContaining({
      name: 'a',
      celestialBodyType: 'b',
      size: 'c',
      orbitColor: 'd',
      currentDsn: 'e',
    }));
  });

});
