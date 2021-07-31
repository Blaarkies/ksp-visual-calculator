import { InputToggleComponent } from './input-toggle.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../../app.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

let componentType = InputToggleComponent;
describe('InputToggleComponent', () => {

  beforeEach(() => MockBuilder(componentType)
    .keep(MatCheckboxModule)
    .keep(MatSlideToggleModule)
    .mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  xdescribe('checkbox', () => {
    it('writeValue() should set native values', () => {
      let fixture = MockRender(componentType, {type: 'checkbox'});
      let component = fixture.point.componentInstance;
      fixture.detectChanges();

      spyOn(component.checkbox, 'writeValue');

      let testValue = true;
      component.writeValue(testValue);
      expect(component.value).toBe(testValue);
      expect(component.checkbox.writeValue).toHaveBeenCalled();
    });

    it('setDisabledState() should disable native elements', () => {
      let fixture = MockRender(componentType);
      let component = fixture.point.componentInstance;

      component.setDisabledState(true);

      expect(component.disabled).toBeTrue();
      expect(component.checkbox.disabled).toBeTrue();
    });

    it('focus() should focus native element', () => {
      let fixture = MockRender(componentType);
      let component = fixture.point.componentInstance;

      spyOn(component.checkbox, 'focus');

      expect(component.checkbox.focus).toHaveBeenCalled();
    });
  });

  xdescribe('switch', () => {
    it('writeValue() should set native values', () => {
      let fixture = MockRender(componentType, {type: 'switch'});
      let component = fixture.point.componentInstance;

      spyOn(component.switch, 'writeValue');

      let testValue = true;
      component.writeValue(testValue);
      expect(component.value).toBe(testValue);
      expect(component.switch.writeValue).toHaveBeenCalled();
    });

    it('setDisabledState() should disable native elements', () => {
      let fixture = MockRender(componentType);
      let component = fixture.point.componentInstance;

      component.setDisabledState(true);

      expect(component.disabled).toBeTrue();
      expect(component.switch.disabled).toBeTrue();
    });

    it('focus() should focus native element', () => {
      let fixture = MockRender(componentType);
      let component = fixture.point.componentInstance;

      spyOn(component.switch, 'focus');

      expect(component.switch.focus).toHaveBeenCalled();
    });
  });

  it('NG_VALUE_ACCESSOR registrations', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    let onChangeFunction = () => void 0;
    component.registerOnChange(onChangeFunction);

    let onTouchedFunction = () => void 0;
    component.registerOnTouched(onTouchedFunction);

    expect(component.onChange).toBe(onChangeFunction);
    expect(component.onTouched).toBe(onTouchedFunction);
  });

  it('userInputChange() call output changes', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;
    component.registerOnChange(() => void 0);

    spyOn(component, 'writeValue');
    spyOn(component, 'onChange');

    component.userInputChange(true);
    expect(component.writeValue).toHaveBeenCalled();
    expect(component.onChange).toHaveBeenCalled();
  });

});
