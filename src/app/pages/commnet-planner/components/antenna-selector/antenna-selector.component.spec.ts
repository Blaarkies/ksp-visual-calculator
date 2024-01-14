import { AntennaSelectorComponent } from './antenna-selector.component';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { Antenna } from '../../models/antenna';
import { Group } from '../../../../common/domain/group';
import { ineeda } from 'ineeda';
import { LabeledOption } from '../../../../common/domain/input-fields/labeled-option';

let componentType = AntennaSelectorComponent;
describe('AntennaSelectorComponent', () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  let options = [1, 2, 3].map(n =>
    new LabeledOption(n.toString(), ineeda<Antenna>({label: n.toString()})));

  it('constructor(), should have availableOptions setup', () => {
    let fixture = MockRender(componentType, {options});
    let component = fixture.point.componentInstance;

    expect(component.availableOptions.length).toBe(3);
    expect(component.availableOptions[2].value.label).toBe('3');
  });

  it('finalControl set value should value to antennaInputs', () => {
    let fixture = MockRender(componentType, {options});
    let component = fixture.point.componentInstance;

    expect(component.antennaInputs.length).toBe(0);
    component.finalControl.setValue(options[1].value);

    expect(component.antennaInputs.length).toBe(1);
    let newAntennaInput = component.antennaInputs[0].selectedAntenna;
    expect(newAntennaInput.label).toBe(options[1].label);
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

  it('setDisabledState(), sets all children as disabled', () => {
    let fixture = MockRender(componentType, {options});
    let component = fixture.point.componentInstance;

    component.finalControl.setValue(options[0].value);

    let formControls = component.antennaInputs
      .map(ai => ai.countControl)
      .concat(component.finalControl);

    let allEnabled = formControls.every(c => !c.disabled);
    expect(allEnabled).toBeTrue();

    component.setDisabledState(true);

    let allDisabled = formControls.every(c => c.disabled);
    expect(allDisabled).toBeTrue();
  });
});
