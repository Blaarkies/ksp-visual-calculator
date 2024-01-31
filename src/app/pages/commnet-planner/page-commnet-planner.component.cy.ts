import {
  Component,
  Input,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MountResponse } from 'cypress/angular';
import {
  BehaviorSubject,
  EMPTY,
  of,
  skip,
  Subject,
  take,
} from 'rxjs';
import { Craft } from '../../common/domain/space-objects/craft';
import { Planetoid } from '../../common/domain/space-objects/planetoid';
import { CameraComponent } from '../../components/camera/camera.component';
import { FocusJumpToPanelComponent } from '../../components/focus-jump-to-panel/focus-jump-to-panel.component';
import { HudComponent } from '../../components/hud/hud.component';
import { UniverseMapComponent } from '../../components/universe-map/universe-map.component';
import { ZoomIndicatorComponent } from '../../components/zoom-indicator/zoom-indicator.component';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';
import { GuidanceService } from '../../services/guidance.service';
import { HudService } from '../../services/hud.service';
import { AntennaSignalComponent } from './components/antenna-signal/antenna-signal.component';
import { CraftComponent } from './components/craft/craft.component';
import PageCommnetPlannerComponent from './page-commnet-planner.component';
import { CommnetStateService } from './services/commnet-state.service';
import { CommnetUniverseBuilderService } from './services/commnet-universe-builder.service';

describe('PageCommnetPlannerComponent', () => {

  describe('if basic', () => {

    @Component({selector: 'cp-universe-map', standalone: true, template: 'UniverseMapComponent<ng-content/>'})
    class MockUniverseMapComponent implements Partial<UniverseMapComponent> {
      camera = {
        scale: 1,
        startBodyDrag: () => undefined,
        backboard: {nativeElement: {}},
        focusBody: () => undefined,
      } as unknown as CameraComponent;
    }

    @Component({selector: 'cp-focus-jump-to-panel', standalone: true, template: 'FocusJumpToPanelComponent'})
    class MockFocusJumpToPanelComponent implements Partial<FocusJumpToPanelComponent> {
      @Input() focusables;
    }

    afterEach(() => TestBed.resetTestingModule());

    beforeEach(() => {
      let mockAuthService = {
        user$: EMPTY,
        signIn$: EMPTY,
      };
      let mockHudService = {
        createActionOptionTutorial: cy.spy(),
        createActionOptionManageSaveGames: cy.spy(),
        createActionResetPage: cy.spy(),
        createActionOptionFaq: cy.spy(),
      };
      let mockCommnetStateService = {
        destroy: cy.spy(),
      };
      let mockCommnetUniverseBuilderService = {
        antennaSignal$: {stream$: of([{nodes: [{label: ''}, {label: ''}]}])},
        craft$: {stream$: new Subject()},
        orbits$: EMPTY,
        planetoids$: new Subject(),
      };
      let mockGuidanceService = {
        fakeAndGay: true,
        openTutorialDialog: cy.spy(),
        setSupportDeveloperSnackbar: cy.spy(),
        setSignUpDialog: cy.spy(),
      };

      cy.mount(PageCommnetPlannerComponent, {
        imports: [NoopAnimationsModule],
        TestBed,
        override: {
          imports: [
            [UniverseMapComponent, MockUniverseMapComponent],
            AntennaSignalComponent,
            CraftComponent,
            HudComponent,
            ZoomIndicatorComponent,
            [FocusJumpToPanelComponent, MockFocusJumpToPanelComponent],
          ],
          providers: [
            [AuthService, mockAuthService],
            [AnalyticsService, {}],
            [HudService, mockHudService],
            [CommnetStateService, mockCommnetStateService],
            [CommnetUniverseBuilderService, mockCommnetUniverseBuilderService],
            [GuidanceService, mockGuidanceService],
          ],
        },
      }).then(mr => mountResponse = mr);
    });

    let mountResponse: MountResponse<PageCommnetPlannerComponent>;

    it('exists', () => {
      cy.get('*').should('exist');
    });

    it('contains correct elements', () => {
      cy.get('cp-universe-map').should('exist');
      cy.get('cp-antenna-signal').should('exist');

      let builderService = mountResponse.fixture.debugElement.injector
        .get(CommnetUniverseBuilderService);
      (builderService.craft$.stream$ as unknown as Subject<Craft[]>)
        .next([{} as Craft]);
      mountResponse.fixture.detectChanges();
      cy.get('cp-craft').should('exist');

      cy.get('cp-hud').should('exist');
      cy.get('cp-zoom-indicator').should('exist');
      cy.get('cp-focus-jump-to-panel').should('exist');
    });

    it('initiates calls to guidanceService', () => {
      let guidanceService = mountResponse.fixture.debugElement.injector
        .get(GuidanceService);
      expect(guidanceService.openTutorialDialog).to.have.been.called;
      expect(guidanceService.setSupportDeveloperSnackbar).to.have.been.called;
      expect(guidanceService.setSignUpDialog).to.have.been.called;
    });

    it('sets focusables correctly', (done) => {
      let testLabelPlanet = 'test-planet';
      let testLabelCraft = 'test-craft';

      mountResponse.component.focusables$.pipe(
        skip(1), take(1)) // Wait until both planetoids$ and craft$ emitted
        .subscribe(list => {
          expect(!!list).to.be.true;
          expect(list.length).to.be.greaterThan(0);

          let planet = list.find(f => f.label === testLabelPlanet);
          expect(!!planet).to.be.true;

          let craft = list.find(f => f.label === testLabelCraft);
          expect(!!craft).to.be.true;

          done();
        });

      let builderService = mountResponse.fixture.debugElement.injector
        .get(CommnetUniverseBuilderService);

      builderService.planetoids$.next([{label: testLabelPlanet} as Planetoid]);
      (builderService.craft$.stream$ as unknown as Subject<Craft[]>)
        .next([{label: testLabelCraft} as Craft]);
    });

    it.skip('handle no account logged in', (done) => {

    });

    it.skip('when destroyed it also destroys commnetStateService', (done) => {

    });



  });

});

