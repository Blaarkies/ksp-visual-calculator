import { SoiCircleComponent } from './soi-circle.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { ineeda } from 'ineeda';
import { SpaceObject } from '../../common/domain/space-objects/space-object';

let componentType = SoiCircleComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType, {body: ineeda<SpaceObject>()});
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
