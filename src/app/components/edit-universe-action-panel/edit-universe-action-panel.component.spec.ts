import { EditUniverseActionPanelComponent } from './edit-universe-action-panel.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { AuthService } from '../../services/auth.service';
import { EMPTY } from 'rxjs';

let componentType = EditUniverseActionPanelComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(AuthService, {user$: EMPTY}));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
