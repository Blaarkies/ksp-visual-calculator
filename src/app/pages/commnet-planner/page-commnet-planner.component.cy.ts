import {
  Component,
  Input,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  EMPTY,
  of,
} from 'rxjs';
import { MountResult } from '../../../../cypress/support/models/mount-response.model';
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

    @Component({selector: 'cp-universe-map', standalone: true,
      template: '<div>universe-map<ng-content/></div>'})
    class MockUniverseMapComponent {
      @Input() planetoids;
      camera = {scale: 1};
    }

    @Component({selector: 'cp-antenna-signal', standalone: true,
      template: '<div>antenna-signal</div>'})
    class MockAntennaSignalComponent {
      @Input() antennaSignal;
      @Input() scale;
    }

    @Component({selector: 'cp-craft', standalone: true,
      template: '<div>craft</div>'})
    class MockCraftComponent {
      @Input() craft;
    }

    @Component({selector: 'cp-hud', standalone: true,
      template: '<div>hud<ng-content/></div>'})
    class MockHudComponent {
      @Input() icon;
      @Input() contextPanelDetails;
    }

    @Component({selector: 'cp-zoom-indicator', standalone: true,
      template: '<div>zoom-indicator</div>'})
    class MockZoomIndicatorComponent {
    }

    @Component({selector: 'cp-focus-jump-to-panel', standalone: true,
      template: '<div>focus-jump-to-panel</div>'})
    class MockFocusJumpToPanelComponent {
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
        craft$: {stream$: of([{}])},
        orbits$: EMPTY,
        planetoids$: EMPTY,
      };
      let mockGuidanceService = {
        openTutorialDialog: cy.spy(),
        setSupportDeveloperSnackbar: cy.spy(),
        setSignUpDialog: cy.spy(),
      };
      TestBed.overrideComponent(PageCommnetPlannerComponent, {
        add: {
          providers: [
            {provide: AuthService, useValue: mockAuthService},
            {provide: AnalyticsService, useValue: {}},
            {provide: HudService, useValue: mockHudService},
            {provide: CommnetStateService, useValue: mockCommnetStateService},
            {provide: CommnetUniverseBuilderService, useValue: mockCommnetUniverseBuilderService},
            {provide: GuidanceService, useValue: mockGuidanceService},
          ],
          imports: [
            MockUniverseMapComponent,
            MockAntennaSignalComponent,
            MockCraftComponent,
            MockHudComponent,
            MockZoomIndicatorComponent,
            MockFocusJumpToPanelComponent,
          ],
        },
        remove: {
          imports: [
            UniverseMapComponent,
            AntennaSignalComponent,
            CraftComponent,
            HudComponent,
            ZoomIndicatorComponent,
            FocusJumpToPanelComponent,
          ],
        },

      });

      mountResponse = cy.mount(PageCommnetPlannerComponent, {
        imports: [NoopAnimationsModule],
      });
    });

    let mountResponse: MountResult<PageCommnetPlannerComponent>;

    it('exists', () => {
      cy.get('*').should('exist');
    });

    it('contains correct elements', () => {
      cy.get('cp-universe-map').should('exist');
      cy.get('cp-antenna-signal').should('exist');
      cy.get('cp-craft').should('exist');
      cy.get('cp-hud').should('exist');
      cy.get('cp-zoom-indicator').should('exist');
      cy.get('cp-focus-jump-to-panel').should('exist');
    });

    it('initiates calls to guidanceService', () => {
      let guidanceService = TestBed.inject(GuidanceService);
      expect(guidanceService.openTutorialDialog).to.have.been.called;
      expect(guidanceService.setSupportDeveloperSnackbar).to.have.been.called;
      expect(guidanceService.setSignUpDialog).to.have.been.called;
    });

  });

});
