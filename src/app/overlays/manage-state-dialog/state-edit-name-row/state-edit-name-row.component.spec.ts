import { MockBuilder, MockRender } from 'ng-mocks';
import { StateEditNameRowComponent } from './state-edit-name-row.component';
import { AppModule } from '../../../app.module';
import { ineeda } from 'ineeda';
import { StateRow } from '../state-row';
import { UntypedFormControl } from '@angular/forms';
import { fakeAsync, tick } from '@angular/core/testing';

let componentType = StateEditNameRowComponent;
describe('StateEditNameRowComponent', () => {

  let state: StateRow;
  let control: UntypedFormControl;

  beforeEach(() => {
    state = ineeda<StateRow>();
    control = new UntypedFormControl();
    return MockBuilder(componentType)
      .mock(AppModule);
  });

  it('should create', () => {
    let fixture = MockRender(componentType, {state});
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('startEdit() should setup input details', fakeAsync(() => {
    let fixture = MockRender(componentType, {state, control});
    let component = fixture.point.componentInstance;
    component.inputField = {focus: () => void 0} as any;

    spyOn(component.editStart, 'emit');
    let spyFocus = spyOn(component.inputField, 'focus');
    component.startEdit(ineeda<StateRow>({name: 'test-name'}));

    expect(component.editStart.emit).toHaveBeenCalled();
    expect(component.isEditMode).toBeTrue();
    expect(component.control.value).toBe('test-name');

    tick();
    expect(spyFocus).toHaveBeenCalled();
  }));

  it('confirmEdit() should not emit when name is unchanged', () => {
    let fixture = MockRender(componentType, {state, control});
    let component = fixture.point.componentInstance;

    spyOn(component.confirm, 'emit');

    component.control.setValue('  test-name  ');
    component.confirmEdit(ineeda<StateRow>({name: 'test-name'}));

    expect(component.isEditMode).toBeFalse();
    expect(component.confirm.emit).not.toHaveBeenCalled();
  });

  it('confirmEdit() should emit when name is different', () => {
    let fixture = MockRender(componentType, {state, control});
    let component = fixture.point.componentInstance;

    spyOn(component.confirm, 'emit');

    component.control.setValue('my-new-savegame');
    let methodState = ineeda<StateRow>({name: 'test-name'});
    component.confirmEdit(methodState);

    expect(component.isEditMode).toBeFalse();
    expect(component.confirm.emit).toHaveBeenCalledWith({
      oldName: 'test-name',
      state: methodState,
    });
  });

  it('cancelEdit() stops edit mode', () => {
    let fixture = MockRender(componentType, {state});
    let component = fixture.point.componentInstance;

    component.cancelEdit();
    expect(component.isEditMode).toBe(false);
  });

});
