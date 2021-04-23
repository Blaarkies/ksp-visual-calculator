import { AntennaSelectorComponent } from './antenna-selector.component';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { Antenna } from '../../common/domain/antenna';
import { Group } from '../../common/domain/group';
import { ineeda } from 'ineeda';
import { LabeledOption } from '../../common/domain/input-fields/labeled-option';

let componentType = AntennaSelectorComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('when writeValue() with list, this.antennaInputs should match', () => {
    let fixture = MockRender(componentType);
    let component = fixture.componentInstance;

    let mockAntenna = ineeda<Antenna>({label: 'A'});
    component.writeValue([new Group(mockAntenna)]);

    expect(component.antennaInputs
      .some(ai => ai.selectedAntenna.label === mockAntenna.label))
      .toBeTrue();
  });

  it('when removeAntenna(), this.antennaInputs does not contain mockAntenna', () => {
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

});
