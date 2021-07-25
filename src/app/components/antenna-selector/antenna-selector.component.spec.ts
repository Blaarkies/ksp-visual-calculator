import { AntennaSelectorComponent } from './antenna-selector.component';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { Antenna } from '../../common/domain/antenna';
import { Group } from '../../common/domain/group';
import { ineeda } from 'ineeda';
import { LabeledOption } from '../../common/domain/input-fields/labeled-option';
import { fakeAsync, tick } from '@angular/core/testing';
import { Common } from '../../common/common';

let componentType = AntennaSelectorComponent;
describe('AntennaSelectorComponent', () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  let defaultOptions = [1, 2, 3].map(n =>
    new LabeledOption(n.toString(), ineeda<Antenna>({label: n.toString()})));

  it('constructor(), should have availableOptions setup', () => {
    let fixture = MockRender(componentType, {options: defaultOptions});
    let component = fixture.point.componentInstance;

    expect(component.availableOptions.length).toBe(3);
    expect(component.availableOptions[2].value.label).toBe('3');
  });

  it('finalControl set value should value to antennaInputs', () => {
    let fixture = MockRender(componentType, {options: defaultOptions});
    let component = fixture.point.componentInstance;

    expect(component.antennaInputs.length).toBe(0);
    component.finalControl.setValue(defaultOptions[1]);

    expect(component.antennaInputs.length).toBe(1);
    let newAntennaInput = component.antennaInputs[0].selectedAntenna;
    expect(newAntennaInput.label).toBe(defaultOptions[1].label);
  });

  it('writeValue() with list, antennaInputs should match', () => {
    let fixture = MockRender(componentType);
    let component = fixture.componentInstance;

    let mockAntenna = ineeda<Antenna>({label: 'A'});
    component.writeValue([new Group(mockAntenna)]);

    expect(component.antennaInputs
      .some(ai => ai.selectedAntenna.label === mockAntenna.label))
      .toBeTrue();
  });

  it('removeAntenna(), antennaInputs does not contain mockAntenna', () => {
    let fixture = MockRender(componentType);
    let component = fixture.componentInstance;
    let mockAntennaA = ineeda<Antenna>({label: 'A'});
    let mockAntennaB = ineeda<Antenna>({label: 'B'});
    component.options = [
      new LabeledOption('A', mockAntennaA),
      new LabeledOption('B', mockAntennaB),
    ];

    component.writeValue([
      new Group<Antenna>(mockAntennaA),
      new Group<Antenna>(mockAntennaB)]);

    fixture.detectChanges();

    expect(component.antennaInputs
      .every(ai => ai.selectedAntenna.label === mockAntennaA.label
        || ai.selectedAntenna.label === mockAntennaB.label))
      .toBeTrue();

    let removeAntennaButton = ngMocks.find(`#${mockAntennaB.label} button`);
    ngMocks.click(removeAntennaButton);

    fixture.detectChanges();

    expect(component.antennaInputs
      .every(ai => ai.selectedAntenna.label !== mockAntennaB.label))
      .toBeTrue();
  });

  it('setDisabledState(), sets all children as disabled', fakeAsync(() => {
    let fixture = MockRender(componentType, {options: defaultOptions});
    let component = fixture.point.componentInstance;
    component.writeValue([new Group(defaultOptions[2].value)]);

    fixture.detectChanges();
    tick();

    let getChildren = () => Array.from(
      fixture.debugElement.nativeElement.querySelectorAll(
        'cp-input-field, cp-input-number, button, cp-input-select'),
    ) as HTMLElement[];

    let allEnabled = !getChildren().some(c => Common.isNgDisabled(c));
    expect(allEnabled).toBeTrue();

    component.setDisabledState(true);
    fixture.detectChanges();
    tick();

    fixture.detectChanges();

    let allDisabled = getChildren().every(c => Common.isNgDisabled(c));
    expect(allDisabled).toBeTrue();
  }));
});
