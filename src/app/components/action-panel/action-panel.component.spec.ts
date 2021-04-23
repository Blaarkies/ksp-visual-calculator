import { ActionPanelComponent } from './action-panel.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';

let componentType = ActionPanelComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType, {color: '', location: ''});
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
