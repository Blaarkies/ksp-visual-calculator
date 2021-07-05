import { MockBuilder, MockRender } from 'ng-mocks';
import { StateEditNameRowComponent } from './state-edit-name-row.component';
import { AppModule } from '../../../app.module';
import { ineeda } from 'ineeda';
import { StateRow } from '../state.row';

let componentType = StateEditNameRowComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType, {state: ineeda<StateRow>()});
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
