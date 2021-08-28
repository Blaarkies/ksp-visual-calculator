// import { CraftDetailsDialogComponent, CraftDetailsDialogData } from './craft-details-dialog.component';
// import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
// import { AppModule } from '../../app.module';
// import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
// import { ineeda } from 'ineeda';
// import { SpaceObjectService } from '../../services/space-object.service';
// import { BehaviorSubject } from 'rxjs';
// import { SpaceObject } from '../../common/domain/space-objects/space-object';
// import { CraftType } from '../../common/domain/space-objects/craft-type';
// import { Antenna } from '../../common/domain/antenna';
// import { Group } from '../../common/domain/group';
// import { CraftDetails } from './craft-details';
// import { Craft } from '../../common/domain/space-objects/craft';
// import createSpy = jasmine.createSpy;
//
// let componentType = CraftDetailsDialogComponent;
// describe('CraftDetailsDialogComponent', () => {
//
//   let data = {
//     forbiddenNames: [],
//   };
//
//   beforeEach(() => MockBuilder(componentType)
//     .mock(AppModule)
//     .mock(MatDialogRef)
//     .mock(MAT_DIALOG_DATA, data)
//     .mock(SpaceObjectService, {
//       celestialBodies$: {value: []} as BehaviorSubject<SpaceObject[]>,
//     }),
//   );
//
//   it('should create', () => {
//     let fixture = MockRender(componentType);
//     expect(fixture.point.componentInstance).toBeDefined();
//   });
//
//   it('submitCraftDetails() should call dialogRef with details', () => {
//     let spyClose = MockInstance(MatDialogRef, 'close', createSpy());
//
//     let fixture = MockRender(componentType);
//     let component = fixture.point.componentInstance;
//
//     component.inputFields.name.control.setValue('test-name');
//     component.inputFields.craftType.control.setValue(new CraftType('', 'test-craft-type', null));
//     component.inputFields.antennaSelection.control.setValue([
//       new Group<Antenna>(ineeda<Antenna>({label: 'test-antenna'})),
//     ]);
//     component.advancedInputFields.orbitParent.control.setValue(ineeda<SpaceObject>({label: 'test-part'}));
//     component.advancedInputFields.altitude.control.setValue(42);
//     component.advancedInputFields.angle.control.setValue(180);
//
//     component.submitCraftDetails();
//     let output: CraftDetails = spyClose.calls.mostRecent().args[0];
//
//     expect(output.name).toBe('test-name');
//     expect(output.craftType.label).toBe('test-craft-type');
//     expect(output.antennae.length).toBe(1);
//     expect(output.antennae[0].count).toBe(1);
//     expect(output.antennae[0].item.label).toBe('test-antenna');
//     expect(output.advancedPlacement.orbitParent.label).toBe('test-part');
//     expect(output.advancedPlacement.altitude).toBe(42);
//     expect(output.advancedPlacement.angle).toBe(3.14159274);
//   });
//
//   it('remove() should call spaceObjectService with edit details', () => {
//     MockInstance(MAT_DIALOG_DATA, () => ({
//       forbiddenNames: [],
//       edit: ineeda<Craft>({label: 'test-craft'}),
//     }));
//     let spyRemoveCraft = MockInstance(SpaceObjectService, 'removeCraft', createSpy());
//     let spyClose = MockInstance(MatDialogRef, 'close', createSpy());
//
//     let fixture = MockRender(componentType);
//     let component = fixture.point.componentInstance;
//
//     component.remove();
//
//     expect(spyRemoveCraft).toHaveBeenCalled();
//     expect(spyRemoveCraft.calls.mostRecent().args[0].label).toBe('test-craft');
//     expect(spyClose).toHaveBeenCalled();
//   });
//
//   it('advancedForm should be invalid if partially filled in', () => {
//     let fixture = MockRender(componentType);
//     let component = fixture.point.componentInstance;
//
//     component.advancedInputFields.altitude.control.setValue(42);
//     expect(component.advancedForm.invalid).toBeTrue();
//   });
//
//   it('advancedForm should be valid if empty or completed', () => {
//     let fixture = MockRender(componentType);
//     let component = fixture.point.componentInstance;
//
//     expect(component.advancedForm.valid).toBeTrue();
//
//     component.advancedInputFields.orbitParent.control.setValue(ineeda<SpaceObject>());
//     component.advancedInputFields.altitude.control.setValue(42);
//     component.advancedInputFields.angle.control.setValue(42);
//
//     expect(component.advancedForm.valid).toBeTrue();
//   });
//
// });
