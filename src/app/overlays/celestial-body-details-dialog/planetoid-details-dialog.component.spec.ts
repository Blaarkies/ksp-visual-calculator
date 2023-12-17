// import { CelestialBodyDetailsDialogComponent } from './celestial-body-details-dialog.component';
// import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
// import { AppModule } from '../../app.module';
// import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
// import { ineeda } from 'ineeda';
// import { SetupService } from '../../services/setup.service';
// import { BehaviorSubject } from 'rxjs';
// import { Antenna } from '../../common/domain/antenna';
// import { SpaceObjectType } from '../../common/domain/space-objects/space-object-type';
// import createSpy = jasmine.createSpy;
// import objectContaining = jasmine.objectContaining;
//
// let componentType = CelestialBodyDetailsDialogComponent;
// describe('CelestialBodyDetailsDialogComponent', () => {
//
//   let data = {
//     edit: {
//       size: 1,
//       draggableHandle: {} as any,
//       antennae: [{item: 0} as any],
//     } as any,
//     forbiddenNames: [],
//   };
//
//   beforeEach(() => MockBuilder(componentType)
//     .mock(AppModule)
//     .mock(MatDialogRef)
//     .mock(MAT_DIALOG_DATA, data)
//     .mock(SetupService, {
//       availableAntennae$: {value: []} as BehaviorSubject<Antenna[]>,
//     }));
//
//   it('should create', () => {
//     let fixture = MockRender(componentType, {data});
//     expect(fixture.point.componentInstance).toBeDefined();
//   });
//
//   it('submitDetails() should return CelestialBodyDetails', () => {
//     let spyClose = MockInstance(MatDialogRef, 'close', createSpy());
//
//     let fixture = MockRender(componentType);
//     let component = fixture.point.componentInstance;
//     component.inputFields.name.control.setValue('a');
//     component.inputFields.celestialBodyType.control.setValue(SpaceObjectType.Planet);
//     component.inputFields.size.control.setValue(3);
//     component.inputFields.orbitColor.control.setValue('d');
//     let mockAntenna = ineeda<Antenna>();
//     component.inputFields.currentDsn.control.setValue(mockAntenna);
//
//     component.submitDetails();
//     expect(spyClose).toHaveBeenCalledWith(objectContaining({
//       name: 'a',
//       celestialBodyType: SpaceObjectType.Planet,
//       size: 3,
//       orbitColor: 'd',
//       currentDsn: mockAntenna,
//     }));
//   });
//
// });
