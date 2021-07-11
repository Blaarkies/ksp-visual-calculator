import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { ineeda } from 'ineeda';
import { Orbit } from '../../common/domain/space-objects/orbit';
import { UserProfileComponent } from './user-profile.component';

let componentType = UserProfileComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType, {orbit: ineeda<Orbit>()});
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
