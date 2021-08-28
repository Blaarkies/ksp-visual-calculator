import { InputFieldComponent } from './input-field.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../../app.module';

let componentType = InputFieldComponent;
describe('InputFieldComponent', () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('writeValue() should set native values', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    let testValue = 'Kraken';
    component.writeValue(testValue);
    expect(component.value).toBe(testValue);
    expect(component.inputRef.nativeElement.value).toBe(testValue);
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

  it('setDisabledState() should disable native elements', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    let input: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('input');
    expect(input.disabled).toBeFalse();

    component.setDisabledState(true);
    expect(input.disabled).toBeTrue();
  });

  it('userInputChange() call output changes', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;
    component.registerOnChange(() => void 0);

    spyOn(component, 'writeValue');
    spyOn(component, 'onChange');
    spyOn(component.output, 'emit');

    component.userInputChange('new value');
    expect(component.writeValue).toHaveBeenCalled();
    expect(component.onChange).toHaveBeenCalled();
    expect(component.output.emit).toHaveBeenCalled();
  });

  it('focus() should focus native element', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    let testElement = fixture.debugElement.nativeElement;
    let input: HTMLInputElement = testElement.querySelector('input');
    expect(testElement.ownerDocument.activeElement).not.toBe(input);

    component.focus();
    expect(testElement.ownerDocument.activeElement).toBe(input);
  });

  it('touch() should call touch outputs', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;
    component.registerOnTouched(() => void 0);

    spyOn(component, 'onTouched');
    spyOn(component.formTouch, 'emit');

    component.touch();

    expect(component.onTouched).toHaveBeenCalled();
    expect(component.formTouch.emit).toHaveBeenCalled();
  });

  it('clear() should clear input', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;
    component.registerOnChange(() => void 0);

    spyOn(component, 'onChange');

    component.clear();

    expect(component.value).toBe(null);
    expect(component.onChange).toHaveBeenCalledWith(null);
  });

});
