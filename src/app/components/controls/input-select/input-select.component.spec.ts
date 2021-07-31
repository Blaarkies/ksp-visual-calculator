import { InputSelectComponent } from './input-select.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../../app.module';
import { LabeledOption } from '../../../common/domain/input-fields/labeled-option';
import { MatSelectModule } from '@angular/material/select';

let componentType = InputSelectComponent;
describe('InputSelectComponent', () => {

  beforeEach(() => MockBuilder(componentType)
    .keep(MatSelectModule)
    .mock(AppModule));

  let options: LabeledOption<number>[] = [
    new LabeledOption('Jeb', 1),
    new LabeledOption('Bill', 2),
    new LabeledOption('Bob', 3),
    new LabeledOption('Valentina', 4),
    new LabeledOption('Margo', 5),
  ];

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('set options should setup search functionality', () => {
    let fixture = MockRender(componentType, {options});
    let component = fixture.point.componentInstance;
    fixture.detectChanges();

    component.searchValue$.next('val');

    expect(component.filteredOptions).toContain(options[3]);
    expect(component.filteredOptions).not.toContain(options[4]);
  });

  it('writeValue() should set native values', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    let testValue = 'Kraken';
    component.writeValue(testValue);
    expect(component.value).toBe(testValue);
    expect(component.selectRef.value).toBe(testValue);
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
    component.selectRef.open();

    spyOn(component.selectRef, 'close');

    component.setDisabledState(true);

    expect(component.disabled).toBeTrue();
    expect(component.selectRef.close).toHaveBeenCalled();
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

    component.onChange = undefined;
    component.userInputChange('other value');
  });

  it('focus() should focus native element', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    spyOn(component.selectRef, 'open');

    component.focus();

    expect(component.selectRef.open).toHaveBeenCalled();
  });

  it('clearSearch() should clear input and results', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    spyOn(component.searchRef, 'writeValue');
    component.searchValue$.next('abc');

    component.clearSearch(component.searchRef);

    expect(component.searchRef.writeValue).toHaveBeenCalled();
    expect(component.searchValue$.value).toBeNull();
  });
});
