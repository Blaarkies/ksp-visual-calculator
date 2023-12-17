import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  combineLatest,
  delayWhen,
  filter,
  firstValueFrom,
  map,
  merge,
  Observable,
  startWith,
  take,
  takeUntil,
} from 'rxjs';
import { BasicAnimations } from '../../animations/basic-animations';
import { ActionOption } from '../../common/domain/action-option';
import {
  AntennaSignal,
  CanCommunicate,
} from '../../common/domain/antenna-signal';
import { GameStateType } from '../../common/domain/game-state-type';
import { Icons } from '../../common/domain/icons';
import { Craft } from '../../common/domain/space-objects/craft';
import { Orbit } from '../../common/domain/space-objects/orbit';
import { Planetoid } from '../../common/domain/space-objects/planetoid';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { GlobalStyleClass } from '../../common/global-style-class';
import { WithDestroy } from '../../common/with-destroy';
import { DraggableSpaceObjectComponent } from '../../components/draggable-space-object/draggable-space-object.component';
import { FocusJumpToPanelComponent } from '../../components/focus-jump-to-panel/focus-jump-to-panel.component';
import { ActionPanelDetails } from '../../components/hud/action-panel-details';
import { HudComponent } from '../../components/hud/hud.component';
import { UniverseMapComponent } from '../../components/universe-map/universe-map.component';
import { ZoomIndicatorComponent } from '../../components/zoom-indicator/zoom-indicator.component';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';
import { EventLogs } from '../../services/domain/event-logs';
import { AbstractUniverseBuilderService } from '../../services/domain/universe-builder.abstract.service';
import { AbstractUniverseStateService } from '../../services/domain/universe-state.abstract.service';
import { GuidanceService } from '../../services/guidance.service';
import { HudService } from '../../services/hud.service';
import { AntennaSignalComponent } from './components/antenna-signal/antenna-signal.component';
import {
  CraftDetailsDialogComponent,
  CraftDetailsDialogData,
} from './components/craft-details-dialog/craft-details-dialog.component';
import { CraftComponent } from './components/craft/craft.component';
import { DifficultySettingsDialogComponent } from './components/difficulty-settings-dialog/difficulty-settings-dialog.component';
import { CommnetStateService } from './services/commnet-state.service';
import { CommnetUniverseBuilderService } from './services/commnet-universe-builder.service';

@Component({
  selector: 'cp-page-commnet-planner',
  standalone: true,
  imports: [
    CommonModule,
    HudComponent,
    ZoomIndicatorComponent,
    FocusJumpToPanelComponent,
    UniverseMapComponent,
    AntennaSignalComponent,
    DraggableSpaceObjectComponent,
    CraftComponent,
  ],
  providers: [
    HudService,
    CommnetUniverseBuilderService,
    CommnetStateService,
    {provide: AbstractUniverseBuilderService, useExisting: CommnetUniverseBuilderService},
    {provide: AbstractUniverseStateService, useExisting: CommnetStateService},
  ],
  templateUrl: './page-commnet-planner.component.html',
  styleUrls: ['./page-commnet-planner.component.scss'],
  animations: [BasicAnimations.fade],
})
export default class PageCommnetPlannerComponent extends WithDestroy() implements OnDestroy {

  icons = Icons;
  contextPanelDetails: ActionPanelDetails;
  signals$: Observable<AntennaSignal[]>;
  crafts$: Observable<Craft[]>;
  orbits$: Observable<Orbit[]>;
  planetoids$: Observable<Planetoid[]>;
  focusables$: Observable<SpaceObject[]>;

  log = console.log;
  get mapState() {
    return JSON.stringify(this.commnetStateService.stateContextual);
  }

  loadMapState() {
    return this.commnetStateService.loadState({
      id: 'id',
      state,
      context: GameStateType.CommnetPlanner,
      name: 'name',
      version: [1,2,3],
      timestamp: new Date(),
    });
  }

  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private analyticsService: AnalyticsService,
    private hudService: HudService,
    private commnetStateService: CommnetStateService,
    private commnetUniverseBuilderService: CommnetUniverseBuilderService,
    guidanceService: GuidanceService,
    ) {
    super();

    this.contextPanelDetails = this.getContextPanelDetails();

    let universe = commnetUniverseBuilderService;
    this.signals$ = universe.signals$.stream$;
    this.crafts$ = universe.craft$.stream$;
    this.orbits$ = universe.orbits$;
    this.planetoids$ = universe.planetoids$;

    this.focusables$ = combineLatest([
      this.crafts$.pipe(startWith([])),
      this.planetoids$,
    ])
      .pipe(
        filter(([craft, planets]) => !!craft && !!planets),
        map(lists => lists.flatMap() as SpaceObject[]));

    merge(
      this.authService.user$.pipe(take(1)),
      this.authService.signIn$)
      .pipe(takeUntil(this.destroy$))
      .subscribe(u => this.commnetStateService.handleUserSingIn(u));

    guidanceService.openTutorialDialog(GameStateType.CommnetPlanner);
    guidanceService.setSupportDeveloperSnackbar(this.destroy$);
    guidanceService.setSignUpDialog(this.destroy$);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.commnetStateService.destroy();
  }

  private getContextPanelDetails(): ActionPanelDetails {
    let options = [
      new ActionOption('New Craft', Icons.Craft, {
        action: () => {
          this.analyticsService.logEventThrottled(EventLogs.Name.CallNewCraftDialog, {
            category: EventLogs.Category.Craft,
          });

          let allCraft = this.commnetUniverseBuilderService.craft$.value;
          this.dialog.open(CraftDetailsDialogComponent, {
            data: {
              forbiddenNames: allCraft.map(c => c.label),
              universeBuilderHandler: this.commnetUniverseBuilderService,
            } as CraftDetailsDialogData,
            backdropClass: GlobalStyleClass.MobileFriendly,
          })
            .afterClosed()
            .pipe(
              filter(craftDetails => craftDetails),
              delayWhen(craftDetails => this.commnetUniverseBuilderService.addCraftToUniverse(craftDetails)),
              takeUntil(this.destroy$))
            .subscribe();
        },
      }),
      new ActionOption('Difficulty Settings', Icons.Difficulty, {
        action: () => {
          this.analyticsService.logEvent('Call difficulty settings dialog', {
            category: EventLogs.Category.Difficulty,
          });

          this.dialog.open(DifficultySettingsDialogComponent,
            {data: this.commnetUniverseBuilderService.difficultySetting})
            .afterClosed()
            .pipe(
              filter(details => details),
              takeUntil(this.destroy$))
            .subscribe(details =>
              this.commnetUniverseBuilderService.updateDifficultySetting(details));
        },
      }),
      this.hudService.createActionOptionTutorial(GameStateType.CommnetPlanner,
        () => firstValueFrom(this.commnetUniverseBuilderService.buildStockState())),
      this.hudService.createActionOptionManageSaveGames(ref => {
          let component = ref.componentInstance;
          component.context = GameStateType.CommnetPlanner;
          component.contextTitle = 'CommNet Planner';
          component.stateHandler = this.commnetStateService;
        },
      ),
      this.hudService.createActionResetPage(
        'This will reset the universe and remove all craft',
        async () => {
          await firstValueFrom(this.commnetUniverseBuilderService.buildStockState());
          await this.commnetStateService.save();
        }),
      this.hudService.createActionOptionFaq(GameStateType.CommnetPlanner),
    ];

    return {
      startTitle: 'CommNet Planner',
      startIcon: Icons.OpenDetails,
      color: 'orange',
      options,
    };
  }

  updateUniverse(dragged: CanCommunicate) {
    if (dragged.communication?.antennae?.length) {
      this.commnetUniverseBuilderService.updateTransmissionLines();
    }
  }

  editCraft(craft: Craft) {
    this.analyticsService.logEvent('Start edit craft', {
      category: EventLogs.Category.Craft,
    });

    let allCraft = this.commnetUniverseBuilderService.craft$.value;
    this.dialog.open(CraftDetailsDialogComponent, {
      data: {
        forbiddenNames: allCraft.map(c => c.label),
        edit: craft,
        universeBuilderHandler: this.commnetUniverseBuilderService,
      } as CraftDetailsDialogData,
      backdropClass: GlobalStyleClass.MobileFriendly,
    })
      .afterClosed()
      .pipe(
        filter(details => details),
        delayWhen(details => this.commnetUniverseBuilderService.editCraft(craft, details)),
        takeUntil(this.destroy$))
      .subscribe();
  }

  editPlanet({body, details}) {
    this.commnetUniverseBuilderService.editCelestialBody(body, details);
    this.commnetUniverseBuilderService.updateTransmissionLines();
  }

  trackSignal(index: number, item: AntennaSignal): string {
    return item.nodes[0].label + item.nodes[1].label;
  }

}

let state = `
{"camera":{"scale":1.5007303518490005,"location":[-1009.7575032114981,756.8584572495765]},"planetoids":[{"size":78,"draggable":{"label":"Kerbol","location":[0,0],"children":["Moho","Eve","Kerbin","Duna","Dres","Jool","Eeloo","re","dire","station","re2"],"imageUrl":"url(assets/stock/kerbol-system-icons/kerbol.webp) 0 0","moveType":"noMove","parameterData":{}},"type":"planetoid","planetoidType":"star","equatorialRadius":261600000},{"size":50,"draggable":{"label":"Moho","location":[5263138304,0],"children":[],"imageUrl":"url(assets/stock/kerbol-system-icons/moho.webp) 0 0","moveType":"orbital","parameterData":{"xy":[],"r":5263138304}},"type":"planetoid","orbit":{"parameters":{"xy":[0,0],"r":5263138304},"color":"#fdbc89","reference":"Moho"},"planetoidType":"planet","sphereOfInfluence":9646663,"equatorialRadius":250000},{"size":54,"draggable":{"label":"Eve","location":[9832684544,0],"children":["Gilly"],"imageUrl":"url(assets/stock/kerbol-system-icons/eve.webp) 0 0","moveType":"orbital","parameterData":{"xy":[],"r":9832684544}},"type":"planetoid","orbit":{"parameters":{"xy":[0,0],"r":9832684544},"color":"#7320f5","reference":"Eve"},"planetoidType":"planet","sphereOfInfluence":85109365,"equatorialRadius":700000},{"size":38,"draggable":{"label":"Gilly","location":[9864184544,0],"children":[],"imageUrl":"url(assets/stock/kerbol-system-icons/gilly.webp) 0 0","moveType":"orbital","parameterData":{"xy":[],"r":31500000}},"type":"planetoid","orbit":{"parameters":{"xy":[9832684544,0],"r":31500000},"color":"#9f7966","reference":"Gilly"},"planetoidType":"moon","sphereOfInfluence":126123,"equatorialRadius":13000},{"size":53,"draggable":{"label":"Kerbin","location":[13599840256,0],"children":["Mun","Minmus"],"imageUrl":"url(assets/stock/kerbol-system-icons/kerbin.webp) 0 0","moveType":"orbital","parameterData":{"xy":[],"r":13599840256}},"type":"planetoid","orbit":{"parameters":{"xy":[0,0],"r":13599840256},"color":"#30f0f0","reference":"Kerbin"},"trackingStation":"Tracking Station 1","communication":{"antennae":[["Tracking Station 1",1]]},"planetoidType":"planet","sphereOfInfluence":84159286,"equatorialRadius":600000,"hasDsn":true},{"size":49,"draggable":{"label":"Mun","location":[13611840256,0],"children":[],"imageUrl":"url(assets/stock/kerbol-system-icons/mun.webp) 0 0","moveType":"orbital","parameterData":{"xy":[],"r":12000000}},"type":"planetoid","orbit":{"parameters":{"xy":[13599840256,0],"r":12000000},"color":"#d0d0f0","reference":"Mun"},"planetoidType":"moon","sphereOfInfluence":2429559,"equatorialRadius":200000},{"size":44,"draggable":{"label":"Minmus","location":[13646840256,0],"children":[],"imageUrl":"url(assets/stock/kerbol-system-icons/minmus.webp) 0 0","moveType":"orbital","parameterData":{"xy":[],"r":47000000}},"type":"planetoid","orbit":{"parameters":{"xy":[13599840256,0],"r":47000000},"color":"#b090c0","reference":"Minmus"},"planetoidType":"moon","sphereOfInfluence":2247428,"equatorialRadius":60000},{"size":51,"draggable":{"label":"Duna","location":[20726155264,0],"children":["Ike"],"imageUrl":"url(assets/stock/kerbol-system-icons/duna.webp) 0 0","moveType":"orbital","parameterData":{"xy":[],"r":20726155264}},"type":"planetoid","orbit":{"parameters":{"xy":[0,0],"r":20726155264},"color":"#ab4323","reference":"Duna"},"planetoidType":"planet","sphereOfInfluence":47921949,"equatorialRadius":320000},{"size":47,"draggable":{"label":"Ike","location":[20729355264,0],"children":[],"imageUrl":"url(assets/stock/kerbol-system-icons/ike.webp) 0 0","moveType":"orbital","parameterData":{"xy":[],"r":3200000}},"type":"planetoid","orbit":{"parameters":{"xy":[20726155264,0],"r":3200000},"color":"#967354","reference":"Ike"},"planetoidType":"moon","sphereOfInfluence":1049598,"equatorialRadius":130000},{"size":47,"draggable":{"label":"Dres","location":[40839348203,0],"children":[],"imageUrl":"url(assets/stock/kerbol-system-icons/dres.webp) 0 0","moveType":"orbital","parameterData":{"xy":[],"r":40839348203}},"type":"planetoid","orbit":{"parameters":{"xy":[0,0],"r":40839348203},"color":"#5e4835","reference":"Dres"},"planetoidType":"planet","sphereOfInfluence":32832840,"equatorialRadius":138000},{"size":62,"draggable":{"label":"Jool","location":[68773560320,0],"children":["Laythe","Vall","Tylo","Bop","Pol"],"imageUrl":"url(assets/stock/kerbol-system-icons/jool.webp) 0 0","moveType":"orbital","parameterData":{"xy":[],"r":68773560320}},"type":"planetoid","orbit":{"parameters":{"xy":[0,0],"r":68773560320},"color":"#568e0e","reference":"Jool"},"planetoidType":"planet","sphereOfInfluence":2455985200,"equatorialRadius":6000000},{"size":52,"draggable":{"label":"Laythe","location":[68800744320,0],"children":[],"imageUrl":"url(assets/stock/kerbol-system-icons/laythe.webp) 0 0","moveType":"orbital","parameterData":{"xy":[],"r":27184000}},"type":"planetoid","orbit":{"parameters":{"xy":[68773560320,0],"r":27184000},"color":"#4859a3","reference":"Laythe"},"planetoidType":"moon","sphereOfInfluence":3723645,"equatorialRadius":500000},{"size":50,"draggable":{"label":"Vall","location":[68816712320,0],"children":[],"imageUrl":"url(assets/stock/kerbol-system-icons/vall.webp) 0 0","moveType":"orbital","parameterData":{"xy":[],"r":43152000}},"type":"planetoid","orbit":{"parameters":{"xy":[68773560320,0],"r":43152000},"color":"#73a1bc","reference":"Vall"},"planetoidType":"moon","sphereOfInfluence":2406401,"equatorialRadius":300000},{"size":53,"draggable":{"label":"Tylo","location":[68842060320,0],"children":[],"imageUrl":"url(assets/stock/kerbol-system-icons/tylo.webp) 0 0","moveType":"orbital","parameterData":{"xy":[],"r":68500000}},"type":"planetoid","orbit":{"parameters":{"xy":[68773560320,0],"r":68500000},"color":"#c89292","reference":"Tylo"},"planetoidType":"moon","sphereOfInfluence":10856518,"equatorialRadius":600000},{"size":44,"draggable":{"label":"Bop","location":[68902060320,0],"children":[],"imageUrl":"url(assets/stock/kerbol-system-icons/bop.webp) 0 0","moveType":"orbital","parameterData":{"xy":[],"r":128500000}},"type":"planetoid","orbit":{"parameters":{"xy":[68773560320,0],"r":128500000},"color":"#c2a783","reference":"Bop"},"planetoidType":"moon","sphereOfInfluence":1221060,"equatorialRadius":65000},{"size":43,"draggable":{"label":"Pol","location":[68953450320,0],"children":[],"imageUrl":"url(assets/stock/kerbol-system-icons/pol.webp) 0 0","moveType":"orbital","parameterData":{"xy":[],"r":179890000}},"type":"planetoid","orbit":{"parameters":{"xy":[68773560320,0],"r":179890000},"color":"#e6edb4","reference":"Pol"},"planetoidType":"moon","sphereOfInfluence":1042138,"equatorialRadius":44000},{"size":49,"draggable":{"label":"Eeloo","location":[90118820000,0],"children":[],"imageUrl":"url(assets/stock/kerbol-system-icons/eeloo.webp) 0 0","moveType":"orbital","parameterData":{"xy":[],"r":90118820000}},"type":"planetoid","orbit":{"parameters":{"xy":[0,0],"r":90118820000},"color":"#707678","reference":"Eeloo"},"planetoidType":"planet","sphereOfInfluence":119082940,"equatorialRadius":210000}],"settings":{"difficulty":{"label":"Normal","rangeModifier":1,"dsnModifier":1}},"craft":[{"size":30,"draggable":{"label":"re","location":[12419840256,-1195000000],"lastAttemptLocation":[12419840256,-1195000000],"children":[],"imageUrl":"url(assets/craft-icons-low-res.webp) 0 0","moveType":"soiLock","parameterData":{}},"type":"craft","craftType":"Relay","communication":{"antennae":[["Internal",1],["RA-2 Relay Antenna",1]]}},{"size":30,"draggable":{"label":"dire","location":[13049840256,-2315000000],"lastAttemptLocation":[13049840256,-2315000000],"children":[],"imageUrl":"url(assets/craft-icons-low-res.webp) 0 0","moveType":"soiLock","parameterData":{}},"type":"craft","craftType":"Probe","communication":{"antennae":[["Internal",1],["Communotron DTS-M1",1]]}},{"size":30,"draggable":{"label":"station","location":[11429840256,-3155000000],"lastAttemptLocation":[11429840256,-3155000000],"children":[],"imageUrl":"url(assets/craft-icons-low-res.webp) 0 0","moveType":"soiLock","parameterData":{}},"type":"craft","craftType":"Station","communication":{"antennae":[["Internal",1],["Mk1-3 Command Pod",1],["Communotron DTS-M1",1]]}},{"size":30,"draggable":{"label":"re2","location":[11399840256,-4265000000],"lastAttemptLocation":[11399840256,-4265000000],"children":[],"imageUrl":"url(assets/craft-icons-low-res.webp) 0 0","moveType":"soiLock","parameterData":{}},"type":"craft","craftType":"Relay","communication":{"antennae":[["Internal",1],["RA-2 Relay Antenna",1]]}}]}
`;
