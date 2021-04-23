import { DraggableSpaceObjectComponent } from './draggable-space-object.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { ineeda } from 'ineeda';

let componentType = DraggableSpaceObjectComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType, {spaceObject: ineeda<SpaceObject>()});
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
