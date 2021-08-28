import { InputFieldListComponent } from './input-field-list.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../../app.module';
import { InputField } from '../../../common/domain/input-fields/input-fields';
import { FormControl } from '@angular/forms';
import { ControlMetaInput } from '../../../common/domain/input-fields/control-meta-input';
import { ControlMetaSelect } from '../../../common/domain/input-fields/control-meta-select';
import { ControlMetaFreeText } from '../../../common/domain/input-fields/control-meta-free-text';
import { ControlMetaNumber } from '../../../common/domain/input-fields/control-meta-number';
import { ControlMetaToggle } from '../../../common/domain/input-fields/control-meta-toggle';
import { ControlMetaAntennaSelector } from '../../../common/domain/input-fields/control-meta-antenna-selector';

let componentType = InputFieldListComponent;
describe('InputFieldListComponent', () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('given inputFields, should create input elements', () => {
    let fixture = MockRender(componentType, {
      inputFields: [
        {
          label: 'input',
          control: new FormControl(),
          controlMeta: new ControlMetaInput(),
        },
        {
          label: 'free-text',
          control: new FormControl(),
          controlMeta: new ControlMetaFreeText(),
        },
        {
          label: 'number',
          control: new FormControl(),
          controlMeta: new ControlMetaNumber(),
        },
        {
          label: 'select',
          control: new FormControl(),
          controlMeta: new ControlMetaSelect([]),
        },
        {
          label: 'toggle',
          control: new FormControl(),
          controlMeta: new ControlMetaToggle(),
        },
        {
          label: 'antenna-selector',
          control: new FormControl(),
          controlMeta: new ControlMetaAntennaSelector([]),
        },
      ] as InputField[],
    });

    let inputs = Array.from(
      fixture.debugElement.nativeElement.querySelectorAll(
        'cp-input-field, cp-input-text-area, cp-input-number, cp-input-select, cp-input-toggle, cp-antenna-selector'));

    expect(inputs.length).toBe(6);
  });

});
