import { DifficultySettingsDialogComponent } from './difficulty-settings-dialog.component';
import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DifficultySetting } from './difficulty-setting';
import { ineeda } from 'ineeda';
import objectContaining = jasmine.objectContaining;
import createSpy = jasmine.createSpy;

let componentType = DifficultySettingsDialogComponent;
describe('DifficultySettingsDialogComponent', () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(MatDialogRef)
    .mock(MAT_DIALOG_DATA, DifficultySetting.normal));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('form changes should reset buttonGroup', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;
    spyOn(component.buttonGroup, 'writeValue');

    component.inputFields.rangeModifier.control.setValue(42);
    expect(component.buttonGroup.writeValue).toHaveBeenCalledWith(null);
  });

  it('ngOnInit() should write data to buttonGroup', () => {
    MockInstance(MAT_DIALOG_DATA, () => ineeda<DifficultySetting>({
      label: 'test-difficulty',
    }));

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;
    let spyWriteValue = spyOn(component.buttonGroup, 'writeValue');

    component.ngOnInit();
    expect(spyWriteValue.calls.mostRecent().args[0].label).toBe('test-difficulty');
  });

  it('submitDetails() should call dialogRef', () => {
    let spyClose = MockInstance(MatDialogRef, 'close', createSpy());

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    component.inputFields.rangeModifier.control.setValue(42);
    component.inputFields.dsnModifier.control.setValue(42);
    component.submitDetails();

    expect(spyClose).toHaveBeenCalledWith(objectContaining({
      label: 'Custom',
      rangeModifier: 42,
      dsnModifier: 42,
    }));
  });

  it('buttonGroupChange() should update inputFields', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    spyOn(component.inputFields.rangeModifier.control, 'setValue');
    spyOn(component.inputFields.dsnModifier.control, 'setValue');

    component.buttonGroupChange(ineeda<DifficultySetting>({
      rangeModifier: 42,
      dsnModifier: 42,
    }));

    expect(component.inputFields.rangeModifier.control.setValue)
      .toHaveBeenCalledWith(42, objectContaining({emitEvent: false}));
    expect(component.inputFields.dsnModifier.control.setValue)
      .toHaveBeenCalledWith(42, objectContaining({emitEvent: false}));
  });

});
