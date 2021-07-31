import { InputTextAreaComponent } from './input-text-area.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../../app.module';

let componentType = InputTextAreaComponent;
describe('InputTextAreaComponent', () => {

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
    expect(component.textarea.nativeElement.value).toBe(testValue);
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

    component.setDisabledState(true);

    expect(component.disabled).toBeTrue();
    expect(component.textarea.nativeElement.disabled).toBeTrue();
  });

  it('userInputChange() call output changes', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;
    component.registerOnChange(() => void 0);

    spyOn(component, 'writeValue');
    spyOn(component, 'onChange');

    component.userInputChange('new value');
    expect(component.writeValue).toHaveBeenCalled();
    expect(component.onChange).toHaveBeenCalled();
  });

  it('focus() should focus native element', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    component.focus();
    let textAreaElement = component.textarea.nativeElement;
    expect(textAreaElement.ownerDocument.activeElement).toBe(textAreaElement);
  });

});
