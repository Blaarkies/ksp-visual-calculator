import { MockBuilder, MockRender } from 'ng-mocks';
import { AppModule } from '../app.module';
import { HudService } from './hud.service';
import { UsableRoutes } from '../usable-routes';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import objectContaining = jasmine.objectContaining;
import arrayContaining = jasmine.arrayContaining;

let serviceType = HudService;
describe('HudService', () => {

  beforeEach(() => MockBuilder(serviceType)
    .mock(MatDialog, {
      open: () => ({
        afterClosed: () => of(0),
      }),
    } as any)
    .mock(AuthService, {
      user$: of({} as any),
    })
    .mock(AppModule));

  it('should be created', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    expect(service).toBeDefined();
  });

  it('set pageContext update context & panel', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;
    let serviceAsAny = service as any;

    spyOn(serviceAsAny.contextChange$, 'next');
    spyOn(service.contextPanel$, 'next');

    service.pageContext = UsableRoutes.SignalCheck;

    expect(serviceAsAny.contextChange$.next).toHaveBeenCalled();
    expect(service.contextPanel$.next).toHaveBeenCalledWith(
      objectContaining({
        startTitle: 'Edit Universe',
      }));
  });

  it('navigationOptions are correct', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    expect(service.navigationOptions).toEqual(
      arrayContaining([
        objectContaining({
          label: 'Blaarkies Hub',
        }),
      ]));
  });

  it('infoOptions are correct', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    expect(service.infoOptions).toEqual(
      arrayContaining([
        objectContaining({
          label: 'Privacy',
        }),
      ]));
  });

  it('signalCheckPanel are correct', () => {
    let fixture = MockRender(serviceType);
    let service = fixture.point.componentInstance;

    expect((service as any).signalCheckPanel.options).toEqual(
      arrayContaining([
        objectContaining({
          label: 'New Craft',
        }),
      ]));
  });

});
