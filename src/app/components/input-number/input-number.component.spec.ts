import { InputNumberComponent } from './input-number.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { InputFieldComponent } from '../input-field/input-field.component';

let componentType = InputNumberComponent;
describe(1 + componentType.name, () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .keep(InputFieldComponent));

  it('should create', () => {
    let fixture = MockRender(componentType);

    expect(fixture.point.componentInstance).toBeDefined();
  });

});
