import { PageSignalCheckComponent } from './page-signal-check.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { StateService } from '../../services/state.service';
import { EMPTY } from 'rxjs';

let componentType = PageSignalCheckComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(StateService, {loadState: () => EMPTY}));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
