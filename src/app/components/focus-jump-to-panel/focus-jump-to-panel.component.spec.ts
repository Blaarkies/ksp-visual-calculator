import { FocusJumpToPanelComponent } from './focus-jump-to-panel.component';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { SpaceObjectService } from '../../services/space-object.service';
import { ineeda } from 'ineeda';
import { BehaviorSubject, of } from 'rxjs';
import { Craft } from '../../common/domain/space-objects/craft';
import { SpaceObject } from '../../common/domain/space-objects/space-object';

let componentType = FocusJumpToPanelComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(SpaceObjectService, ineeda<SpaceObjectService>({
      crafts$: of([]) as BehaviorSubject<Craft[]>,
      celestialBodies$: of([]) as BehaviorSubject<SpaceObject[]>,
    })));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
