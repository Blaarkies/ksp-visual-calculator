import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MountResponse } from 'cypress/angular';
import {
  MockService,
  ngMocks,
} from 'ng-mocks';
import {
  EMPTY,
  of,
  skip,
  Subject,
  take,
} from 'rxjs';
import { Craft } from '../../common/domain/space-objects/craft';
import { Planetoid } from '../../common/domain/space-objects/planetoid';
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

    afterEach(() => TestBed.resetTestingModule());

    beforeEach(() => {
      let mockAuthService = MockService(AuthService, {
        user$: EMPTY,
        signIn$: EMPTY,
      } as unknown);
      let mockCommnetUniverseBuilderService = MockService(CommnetUniverseBuilderService, {
        antennaSignal$: {stream$: of([{nodes: [{label: ''}, {label: ''}]}])},
        craft$: {stream$: new Subject()},
        orbits$: EMPTY,
        planetoids$: new Subject(),
      } as unknown);
      let mockGuidanceService = MockService(GuidanceService, {
        openTutorialDialog: cy.spy(),
        setSupportDeveloperSnackbar: cy.spy(),
        setSignUpDialog: cy.spy(),
      } as unknown);

      cy.mount(PageCommnetPlannerComponent, {
        imports: [NoopAnimationsModule],
        TestBed,
        override: {
          imports: [
            UniverseMapComponent,
            AntennaSignalComponent,
            CraftComponent,
            HudComponent,
            ZoomIndicatorComponent,
            FocusJumpToPanelComponent,
          ],
          providers: [
            [AuthService, mockAuthService],
            AnalyticsService,
            HudService,
            CommnetStateService,
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

    it.skip('handle no account logged in', (done) => {
    });

    it.skip('when destroyed it also destroys commnetStateService', (done) => {
    });

    it.skip('has correct orange context panel details', (done) => {
    });

    it.skip('inputs to universe component', (done) => {
    });

    it('reacts on universe component emits', () => {
      let component = mountResponse.component;
      let universeMap = ngMocks.findInstance(UniverseMapComponent);
      let test = 'test';

      component.editPlanet = cy.spy();
      universeMap.editPlanetoid.emit(test as any);

      expect(component.editPlanet).to.have.been.called;
      expect(component.editPlanet).to.have.been.calledOnceWith(test);

      component.updateUniverse = cy.spy();
      universeMap.update.emit(test as any);

      expect(component.updateUniverse).to.have.been.called;
      expect(component.updateUniverse).to.have.been.calledOnceWith(test);
    });

    it.skip('inputs to craft component', (done) => {
    });

    it.skip('reacts on craft component emits', (done) => {
    });

    it.skip('inputs to hud component', (done) => {
    });

    it('inputs to focus-jump-to-panel component', (done) => {
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
  });

});

