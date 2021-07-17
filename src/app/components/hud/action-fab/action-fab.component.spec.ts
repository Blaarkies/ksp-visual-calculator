import { MockBuilder, MockRender } from 'ng-mocks';
import { ActionFabComponent } from './action-fab.component';
import { AppModule } from '../../../app.module';

let componentType = ActionFabComponent;
describe('ActionFabComponent' /*componentType.name*/, () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType, {options: []});
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
