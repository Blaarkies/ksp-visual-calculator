import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { HudComponent } from './hud.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ineeda } from 'ineeda';
import { of } from 'rxjs';
import { HudService } from '../../services/hud.service';

let componentType = HudComponent;
describe(componentType.name, () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(BreakpointObserver, ineeda<BreakpointObserver>({
      observe: () => of(),
    }))
    .mock(HudService, ineeda<HudService>({
      contextPanel$: {
        asObservable: () => 0
      } as any,
    })));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

});
