import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { StateDisplayComponent } from './state-display.component';
import { ineeda } from 'ineeda';
import { StateRow } from '../../overlays/manage-state-dialog/state-row';
import { UsableRoutes } from '../../usable-routes';
import * as savegameJson from 'src/test-resources/ksp-cp-savegame.json';
import arrayContaining = jasmine.arrayContaining;
import objectContaining = jasmine.objectContaining;
import { interval } from 'rxjs';
import { filter, take } from 'rxjs/operators';

let componentType = StateDisplayComponent;
describe('StateDisplayComponent', () => {

  beforeAll(async () =>
    await interval(10).pipe(
      filter(() => (savegameJson as any).default),
      take(1))
      .toPromise());

  beforeEach(() => MockBuilder(componentType).mock(AppModule));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('set state should update updateProperties', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    spyOn(component, 'updateProperties' as any);

    component.state = ineeda<StateRow>();

    expect((component as any).updateProperties).toHaveBeenCalled();
  });

  it('set contextType should update updateProperties', () => {
    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    spyOn(component, 'updateProperties' as any);

    component.context = ineeda<UsableRoutes>();

    expect((component as any).updateProperties).toHaveBeenCalled();
  });

  it('given a state string, it should populate the correct properties', async () => {
    let fixture = MockRender(componentType, {
      context: UsableRoutes.SignalCheck,
      state: {
        name: 'name-test',
        timestamp: '5/24/2011, 12:00:00 PM',
        version: 'version-test',
        state: JSON.stringify((savegameJson as any).default),
      },
    });
    let component = fixture.point.componentInstance;

    expect(component.properties).toEqual(arrayContaining([
      objectContaining({label: 'Name', value: 'name-test'}),
      objectContaining({label: 'Last saved'}),
      objectContaining({label: 'Star', value: 'Kerbol'}),
      objectContaining({label: 'Celestial bodies', value: '17'}),
      objectContaining({label: 'Craft', value: '3'}),
      objectContaining({label: 'DSN', value: 'Tracking Station 1'}),
      objectContaining({label: 'DSN at', value: 'Kerbin'}),
    ]));
  });

});
