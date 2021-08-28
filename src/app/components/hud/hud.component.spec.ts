import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { AppModule } from '../../app.module';
import { ActionGroupType, HudComponent } from './hud.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ineeda } from 'ineeda';
import { of } from 'rxjs';
import { HudService } from '../../services/hud.service';
import { AnalyticsService } from '../../services/analytics.service';
import { MatDialog } from '@angular/material/dialog';
import { FaqDialogComponent } from '../../overlays/faq-dialog/faq-dialog.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActionOption } from '../../common/domain/action-option';
import createSpy = jasmine.createSpy;
import arrayContaining = jasmine.arrayContaining;
import objectContaining = jasmine.objectContaining;

let componentType = HudComponent;
describe('HudComponent', () => {

  beforeEach(() => MockBuilder(componentType)
    .mock(AppModule)
    .mock(BreakpointObserver, ineeda<BreakpointObserver>({
      observe: () => of(),
    }))
    .mock(HudService, ineeda<HudService>({
      contextPanel$: {
        asObservable: () => 0,
      } as any,
    })));

  it('should create', () => {
    let fixture = MockRender(componentType);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('openFaq() should call dialog.open', () => {
    let spyLogEvent = MockInstance(AnalyticsService, 'logEvent', createSpy());
    let spyOpen = MockInstance(MatDialog, 'open', createSpy());

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    component.openFaq();

    expect(spyLogEvent).toHaveBeenCalled();
    expect(spyOpen.calls.mostRecent().args[0]).toBe(FaqDialogComponent);
  });

  it('openBottomSheet() should call bottomSheet.open with correct data', async () => {
    let spyOpen = MockInstance(MatBottomSheet, 'open', createSpy().and
      .returnValue({
        afterDismissed: () => of(0),
      }));
    let mockedActionOption = ineeda<ActionOption>();
    MockInstance(HudService, 'contextPanel$', {
      asObservable: () => of({
        startTitle: 'mocked startTitle',
        options: [mockedActionOption],
      } as any),
    } as any);

    let fixture = MockRender(componentType);
    let component = fixture.point.componentInstance;

    let spyCallback = createSpy();

    await component.openBottomSheet(ActionGroupType.General, spyCallback);
    expect(spyOpen.calls.mostRecent().args[1]).toEqual(objectContaining({
      data: {
        startTitle: 'KSP Visual Calculator',
        actionOptions: component.navigationOptions,
      },
    }));
    expect(spyCallback).toHaveBeenCalled();

    spyOpen.calls.reset();
    spyCallback.calls.reset();

    await component.openBottomSheet(ActionGroupType.Information, spyCallback);
    expect(spyOpen.calls.mostRecent().args[1]).toEqual(objectContaining({
      data: {
        startTitle: 'Information',
        actionOptions: component.infoOptions,
      },
    }));
    expect(spyCallback).toHaveBeenCalled();

    spyOpen.calls.reset();
    spyCallback.calls.reset();

    await component.openBottomSheet(ActionGroupType.Context, spyCallback);
    expect(spyOpen.calls.mostRecent().args[1]).toEqual(objectContaining({
      data: {
        startTitle: 'mocked startTitle',
        actionOptions: arrayContaining([mockedActionOption]),
      },
    }));
    expect(spyCallback).toHaveBeenCalled();

    spyOpen.calls.reset();
    spyCallback.calls.reset();

    await expectAsync(component.openBottomSheet('' as ActionGroupType, spyCallback))
      .toBeRejected();
  });

});
