import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { ActionListComponent } from './action-list.component';

let componentType = ActionListComponent;
describe('ActionListComponent' /*componentType.name*/, () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
