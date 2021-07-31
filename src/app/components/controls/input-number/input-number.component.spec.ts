import { InputNumberComponent } from './input-number.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../../app.module';
import { InputFieldComponent } from '../input-field/input-field.component';
import { MatMenuModule } from '@angular/material/menu';
import { fakeAsync, tick } from '@angular/core/testing';

let componentType = InputNumberComponent;
describe('InputNumberComponent', () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .keep(MatMenuModule)
    .keep(InputFieldComponent));

  let defaultInputs = {controlMeta: {}, min: 0, max: 100, factor: 2};

  it('should create', () => {
    let fixture = MockRender(componentType, defaultInputs);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('writeValue() should set native values', () => {
    let fixture = MockRender(componentType, {...defaultInputs, min: 0, max: 100, factor: 2});
    let component = fixture.point.componentInstance;

    let testValue = 42;
    component.writeValue(testValue);

    expect(component.value).toBe(testValue);
    expect(component.inputRef.value).toBe(testValue);
    expect(component.sliderRef.value).toBe(65);
  });

  it('NG_VALUE_ACCESSOR registrations', () => {
    let fixture = MockRender(componentType, defaultInputs);
    let component = fixture.point.componentInstance;

    let onChangeFunction = () => void 0;
    component.registerOnChange(onChangeFunction);

    let onTouchedFunction = () => void 0;
    component.registerOnTouched(onTouchedFunction);

    expect(component.onChange).toBe(onChangeFunction);
    expect(component.onTouched).toBe(onTouchedFunction);
  });

  it('setDisabledState() should disable native elements', () => {
    let fixture = MockRender(componentType, defaultInputs);
    let component = fixture.point.componentInstance;

    let input: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('input');
    expect(input.disabled).toBeFalse();

    component.setDisabledState(true);
    fixture.detectChanges();

    expect(input.disabled).toBeTrue();
    expect(fixture.debugElement.nativeElement.querySelector('mat-slider')).toBeNull();
  });

  it('userInputChange() call output changes', () => {
    let fixture = MockRender(componentType, defaultInputs);
    let component = fixture.point.componentInstance;
    fixture.detectChanges();
    component.registerOnChange(() => void 0);

    spyOn(component, 'writeValue');
    spyOn(component, 'onChange');
    spyOn(component.output, 'emit');

    component.userInputChange(42);
    expect(component.writeValue).toHaveBeenCalled();
    expect(component.onChange).toHaveBeenCalled();
    expect(component.output.emit).toHaveBeenCalled();
  });

  it('focus() should focus native element', () => {
    let fixture = MockRender(componentType, defaultInputs);
    let component = fixture.point.componentInstance;

    spyOn(component.inputRef, 'focus');
    spyOn(component.menuTriggerRef, 'openMenu');

    component.focus();
    fixture.detectChanges();

    expect(component.inputRef.focus).toHaveBeenCalled();
    expect(component.menuTriggerRef.openMenu).toHaveBeenCalled();
  });

  it('ngOnInit() should throw error when max less than min', () => {
    expect(() => MockRender(componentType, {...defaultInputs, min: 10, max: 5}))
      .toThrow();
  });

  it('ngOnInit() should set sliderRef min/max to 0/100', () => {
    let fixture = MockRender(componentType, defaultInputs);
    let component = fixture.point.componentInstance;

    expect(component.sliderRef.min).toBe(0);
    expect(component.sliderRef.max).toBe(100);
  });

  it('ngOnInit() should lock input to valid changes only', () => {
    let fixture = MockRender(componentType, {...defaultInputs, min: 0, max: 5});
    let component = fixture.point.componentInstance;

    let spyBlinkError = spyOn(component.inputRef, 'blinkError');

    let nativeInput: HTMLInputElement = fixture.debugElement.nativeElement.querySelector('input');
    let inputTester = new InputTester(nativeInput, component.inputRef.blinkError, spyBlinkError);

    // VALID: should have had no error on init
    inputTester.blinkErrorCalled(false);

    // VALID: in range between min & max
    inputTester.dispatchAndTest('4', false);

    // INVALID: number larger than max
    inputTester.dispatchAndTest('44', true);

    // INVALID: number smaller than min
    inputTester.dispatchAndTest('-44', true);

    // INVALID: not a number
    inputTester.dispatchAndTest('abc', true);

    // VALID: always allow user to clear the input
    inputTester.dispatchAndTest('', false);

    // VALID: if range was -100 & -90, a value such as -9 should be allowed (followed up with -90 is valid)
    inputTester.dispatchAndTest('9', false);
  });

  it('inputChange() NaN value should reset slider to 0', () => {
    let fixture = MockRender(componentType, defaultInputs);
    let component = fixture.point.componentInstance;

    component.sliderRef.value = 50;
    expect(component.sliderRef.value).toBe(50);
    component.inputChange('not a number value');

    expect(component.sliderRef.value).toBe(0);
  });

  it('inputChange() value should set slider to transformed value', () => {
    let fixture = MockRender(componentType, {...defaultInputs, min: 0, max: 100, factor: 2});
    let component = fixture.point.componentInstance;

    let testValue = 33;
    component.inputChange(`${testValue}`);
    expect(component.value).toBe(testValue);
    expect(component.sliderRef.value).not.toBe(testValue);
    expect(component.sliderRef.value).toBe(57);
  });

  it('sliderChange() should set value to inverse transformed value', () => {
    let fixture = MockRender(componentType, {...defaultInputs, min: 0, max: 100, factor: 2});
    let component = fixture.point.componentInstance;

    let testValue = 57;
    component.sliderChange(testValue);
    expect(component.value).toBe(32);
  });
});

class InputTester {
  constructor(private nativeInput: HTMLInputElement,
              private blinkError: () => void,
              private spyBlinkError: jasmine.Spy) {
  }

  blinkErrorCalled(expectToBeCalled: boolean) {
    expectToBeCalled
      ? expect(this.blinkError).toHaveBeenCalled()
      : expect(this.blinkError).not.toHaveBeenCalled();
    this.spyBlinkError.calls.reset();
  }

  dispatchAndTest(value: string, expectToBeCalled: boolean) {
    this.dispatchInputEvent(this.nativeInput, value);
    this.blinkErrorCalled(expectToBeCalled);
  }

  private dispatchInputEvent(nativeInput: HTMLInputElement, value: string) {
    nativeInput.value = value;
    nativeInput.dispatchEvent(new Event('input'));
  }
}
