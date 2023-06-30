import { Injectable } from '@angular/core';
import {
  defer,
  delay,
  filter,
  fromEvent,
  interval,
  map,
  Observable,
  of,
  scan,
  skip,
  Subject,
  take,
  takeUntil,
  timer,
} from 'rxjs';
import { GameStateType } from '../common/domain/game-state-type';
import { Icons } from '../common/domain/icons';
import { Vector2 } from '../common/domain/vector2';
import { TravelCondition } from '../pages/dv-planner/domain/travel-condition';
import { AnalyticsService } from './analytics.service';
import { EventLogs } from './domain/event-logs';
import {
  StepDetails,
  WizardSpotlightService,
} from './wizard-spotlight.service';

@Injectable({providedIn: 'root'})
export class TutorialService {

  resetTutorial$ = new Subject<void>();

  constructor(private wizardSpotlightService: WizardSpotlightService,
              private analyticsService: AnalyticsService,
              private document: Document) {
  }

  async startFullTutorial(gameStateType: GameStateType,
                          onBeforeCallback: () => Promise<unknown>
                            = () => Promise.resolve()) {
    this.analyticsService.logEvent('Start tutorial', {
      category: EventLogs.Category.Tutorial,
      context: gameStateType,
    });

    await onBeforeCallback();

    this.resetTutorial$.next();
    let compiledSteps = this.getCompiledSteps(gameStateType);

    this.wizardSpotlightService
      .stopTutorial$
      .pipe(
        take(1),
        takeUntil(this.resetTutorial$))
      .subscribe(didFinish => this.analyticsService
        .logEvent(`${didFinish ? 'Finish' : 'Cancel'} tutorial`, {category: EventLogs.Category.Tutorial}));

    this.wizardSpotlightService
      .runSteps(compiledSteps)
      .pipe(takeUntil(this.resetTutorial$))
      .subscribe();
  }

  private getCompiledSteps(context: GameStateType): Observable<any>[] {
    let stepDetails;
    stepDetails = [
      this.getStepStartOfTutorial(context),
      ...this.getCommonStepDetails(),
      ...this.getStepDetails(context),
      this.getStepEndOfTutorial(),
    ];

    return stepDetails.map(detail => this.wizardSpotlightService.compileStep(detail));
  }

  private getStepDetails(context: GameStateType) {
    switch (context) {
      case GameStateType.CommnetPlanner:
        return this.getSignalCheckStepDetails();
      case GameStateType.DvPlanner:
        return this.getDvPlannerStepDetails();
    }
    throw new Error(`Context "${context}" is not recognized`);
  }

  private getCommonStepDetails(): StepDetails[] {
    let dragPlanet = {
      dialogPosition: 'right',
      dialogTitle: 'Dragging Planets',
      dialogTargetCallback: () => this.selectObjectInDom('eve')?.firstChild?.firstChild,
      dialogMessages: [
        'This is a planet, it can be dragged around its orbit.',
        'Moons and spacecraft can also be moved.',
        'Left-click (or tap) and hold the planet to move it around.'],
      dialogIcon: Icons.Planet,
      stages: [
        {
          callback: () => defer(() => {
            let eve = this.selectObjectInDom('eve');
            let attachPoint = eve.firstChild.firstChild as HTMLElement;
            if (!attachPoint) {
              console.error('Expected draggable element to contain an image element.');
            }

            attachPoint.style.display = 'grid'; // this centers the wizardMarker around the planet
            let boundingClientRect = attachPoint.getBoundingClientRect();
            this.moveCameraToTarget(boundingClientRect);
            return timer(500).pipe(map(() => ({eve, attachPoint})));
          }),
        },
        {
          isDialogStage: true,
          callback: (input: { eve, attachPoint }) => of(input),
        },
        {
          callback: (input: { eve, attachPoint: HTMLElement }) => interval(500)
            .pipe(
              map(() => {
                let location = input.attachPoint.getBoundingClientRect();
                return new Vector2(location.left, location.top);
              }),
              scan((acc, v) => {
                  acc.isMoved = acc.firstLocation.distance(v) > 150;
                  return acc;
                },
                {
                  firstLocation: new Vector2(input.attachPoint.getBoundingClientRect().left,
                    input.attachPoint.getBoundingClientRect().top),
                  isMoved: false,
                }),
              skip(1),
              filter(({isMoved}) => isMoved),
              take(1),
              map(() => input)),
        },
        {
          callback: (input: { eve, attachPoint }) => defer(() => {
            input.attachPoint.style.display = undefined;
            return of(input);
          }),
        },
      ],
      markerTargetCallback: () => this.selectObjectInDom('eve').firstChild.firstChild as HTMLDivElement,
      markerType: 'ring',
    } as StepDetails;

    let moveCamera = {
      dialogPosition: 'top',
      dialogTitle: 'Moving The Camera',
      dialogTargetCallback: () => this.selectObjectInDom('kerbol')?.firstChild?.firstChild,
      dialogMessages: [
        'The camera can be moved around to view other parts of the Kerbol system.',
        'Right-click and hold in the universe to pan the camera around.',
        'On touch screens, swipe with two fingers to move the camera.'],
      dialogIcon: Icons.Camera,
      stages: [
        {
          isDialogStage: true,
          callback: () => defer(() => {
            let attachPoint = this.selectObjectInDom('eve').firstChild.firstChild as HTMLElement;
            if (!attachPoint) {
              console.error('Expected draggable element to contain an image element.');
            }
            return of({attachPoint});
          }),
        },
        {
          callback: input => interval(500)
            .pipe(
              map(() => {
                let location = input.attachPoint.getBoundingClientRect();
                return new Vector2(location.left, location.top);
              }),
              scan((acc, v) => {
                  acc.isMoved = acc.firstLocation.distance(v) > 150;
                  return acc;
                },
                {
                  firstLocation: new Vector2(input.attachPoint.getBoundingClientRect().left,
                    input.attachPoint.getBoundingClientRect().top),
                  isMoved: false,
                }),
              skip(1),
              filter(({isMoved}) => isMoved),
              take(1), map(() => input)),
        },
      ],
    } as StepDetails;

    let zoomCamera = {
      dialogPosition: 'top',
      dialogTitle: 'Zooming In',
      dialogTargetCallback: () => this.selectObjectInDom('kerbin')?.firstChild?.firstChild,
      dialogMessages: [
        'Some planets have moons, but you have to zoom in to see them.',
        'Point the mouse cursor at Kerbin, then scroll in/out with the mouse wheel, to zoom in/out.',
        'On touch screens you can pinch with two fingers to zoom in/out, or double-tap on Kerbin to zoom in.',
        'Zoom in until you can see the moons of Kerbin.'],
      dialogIcon: Icons.ZoomIn,
      stages: [
        {
          callback: () => defer(() => {
            let kerbin = this.selectObjectInDom('kerbin');
            let attachPoint = kerbin.firstChild.firstChild as HTMLDivElement;
            if (!attachPoint) {
              console.error('Expected draggable element to contain an image element.');
            }

            attachPoint.style.display = 'grid'; // this centers the wizardMarker around the planet
            let boundingClientRect = attachPoint.getBoundingClientRect();
            this.moveCameraToTarget(boundingClientRect);
            return timer(500).pipe(map(() => ({kerbin, attachPoint})));
          }),
        },
        {
          isDialogStage: true,
          callback: (input: { kerbin, attachPoint }) => of(input),
        },
        {
          callback: (input: { kerbin, attachPoint }) => this.waitForElementCondition(
            {filterCondition: () => !!this.selectObjectInDom('mun or minmus')})
            .pipe(map(() => input)),
        },
        {
          callback: (input: { kerbin, attachPoint }) => defer(() => {
            input.attachPoint.style.display = undefined;
            return of(input);
          }),
        },
      ],
      markerTargetCallback: () => this.selectObjectInDom('kerbin').firstChild.firstChild as HTMLDivElement,
      markerType: 'ring',
    } as StepDetails;

    return [dragPlanet, moveCamera, zoomCamera];
  }

  private getStepStartOfTutorial(context: GameStateType): StepDetails {
    let startTutorialNext$ = new Subject<void>();
    let startTutorial = {
      stepType: 'waitForNext',
      nextButton$: startTutorialNext$,
      dialogPosition: 'right',
      dialogTitle: null,
      dialogTargetCallback: () => this.document.querySelector('[data-tutorial-page-icon]'),
      dialogMessages: null,
      dialogIcon: null,
      stages: [
        {
          isDialogStage: true,
          callback: input => of(input),
        },
        {
          callback: input => startTutorialNext$.pipe(
            take(1),
            map(() => input)),
        },
      ],
    } as StepDetails;

    switch (context) {
      case GameStateType.CommnetPlanner:
        startTutorial.dialogTitle = 'CommNet Planner Tutorial';
        startTutorial.dialogMessages = [
          'This page helps setup satellite communication networks by letting you place craft with specific antennae.',
          'Dragging these craft around will instantly show where connections are possible.',
        ];
        startTutorial.dialogIcon = Icons.Relay;
        break;
      case GameStateType.DvPlanner:
        startTutorial.dialogTitle = 'Delta-v Mission Tutorial';
        startTutorial.dialogMessages = [
          'This page calculates the required amount of delta-v a rocket needs to reach a specific destination.',
          'Multiple checkpoints can be added with aerobraking rules for each to calculate the total delta-v required.',
        ];
        startTutorial.dialogIcon = Icons.DeltaV;
        break;
      default:
        throw new Error(`Context "${context}" does not exist`);
    }

    return startTutorial;
  }

  private getStepEndOfTutorial(): StepDetails {
    return {
      stepType: 'end',
      dialogPosition: 'center',
      dialogTitle: 'The End',
      dialogTargetCallback: () => this.document.body,
      dialogMessages: [
        'That concludes the tutorial.',
        'The universe is now your playground!'],
      dialogIcon: Icons.Congratulations,
      stages: [
        {
          isDialogStage: true,
          callback: input => of(input),
        },
        {
          callback: input => timer(15e3).pipe(
            take(1),
            map(() => input)),
        },
      ],
    } as StepDetails;
  }

  private getSignalCheckStepDetails(): StepDetails[] {
    let editUniverse = {
      dialogPosition: 'right',
      dialogTitle: 'Adding Spacecraft',
      dialogTargetCallback: () => this.document.querySelector('[data-tutorial-commnet-menu]'),
      dialogMessages: [
        'Spacecraft can be added to this universe.',
        'Click "New Craft" to add your own spacecraft.'],
      dialogIcon: Icons.Configure,
      stages: [
        {
          callback: input => defer(() => {
            let openEditOptionsButton = this.document.querySelector('[data-tutorial-commnet-menu] button');
            (openEditOptionsButton as HTMLButtonElement).click();
            return timer(200).pipe(map(() => input));
          }),
        },
        {
          isDialogStage: true,
          callback: input => of(input),
        },
        {
          callback: input => defer(() => {
            let target = this.document.querySelector(`[data-action-item-id="New Craft"]`);
            return fromEvent(target, 'click').pipe(take(1), map(() => input));
          }),
        },
      ],
      markerTargetCallback: () => this.document.querySelector(`[data-action-item-id="New Craft"]`),
      markerType: 'pane',
    } as StepDetails;

    let autofillSearchBox = {
      stages: [
        {
          callback: input => defer(() => {
            let antennaSelect = this.document.querySelector('cp-antenna-selector cp-input-select mat-select') as HTMLSelectElement;
            antennaSelect.click();
            return timer(100).pipe(map(() => input));
          }),
        },
        {
          callback: input => defer(() => {
            let antennaSearch = this.document.querySelector('cp-input-field[label="Search"] input') as HTMLInputElement;
            antennaSearch.value = '16';
            antennaSearch.dispatchEvent(new Event('input'));
            return timer(500).pipe(map(() => input));
          }),
        },
      ],
    } as StepDetails;

    let addCraft = {
      dialogPosition: 'right',
      dialogTitle: 'Selecting Antenna Types',
      dialogTargetCallback: () => this.document.querySelector('cp-craft-details-dialog'),
      dialogMessages: [
        'Spacecraft are added and configured here.',
        'Select a communications antenna like the "Communotron 16".',
        'Click "Create" to add the spacecraft.'],
      dialogIcon: Icons.Antenna,
      stages: [
        {
          isDialogStage: true,
          callback: input => of(input),
        },
        {
          callback: input => defer(() => {
            let createButton = this.document.querySelector('cp-craft-details-dialog button[color=primary]');
            return fromEvent(createButton, 'click').pipe(
              take(1), map(() => input));
          }),
        },
      ],
      markerTargetCallback: () => {
        let options = Array.from(this.document.querySelectorAll('mat-option'));
        return options.find((e: HTMLElement) => e.innerText === 'Communotron 16');
      },
      markerType: 'pane',
    } as StepDetails;

    let communicationLines = {
      dialogPosition: 'bottom',
      dialogTitle: 'Changing Communication Lines',
      dialogTargetCallback: () => {
        let crafts = this.document.querySelectorAll('.craft-icon-sprite-image');
        return crafts[crafts.length - 1];
      },
      dialogMessages: [
        'The new spacecraft should have a visible solid green line to the closest relay or Kerbin.',
        'This line color represents the signal strength. A dashed line indicates the relay aspect of this connection.',
        'Move the spacecraft closer/farther from Kerbin to see the connection strength change.',
        'Strong antennae can be dragged to far away planets before losing connection.'],
      dialogIcon: Icons.SignalStrength,
      stages: [
        {
          isDialogStage: true,
          callback: input => defer(() => {
            let crafts = this.document.querySelectorAll('.craft-icon-sprite-image');
            let lastCraft = crafts[crafts.length - 1] as HTMLElement;

            return of({...input, lastCraft});
          }),
        },
        {
          callback: (input: { lastCraft }) => interval(500)
            .pipe(
              map(() => {
                let location = input.lastCraft.getBoundingClientRect();
                return new Vector2(location.left, location.top);
              }),
              scan((acc, v) => {
                  acc.isMoved = acc.firstLocation.distance(v) > 150;
                  return acc;
                },
                {
                  firstLocation: new Vector2(input.lastCraft.getBoundingClientRect().left,
                    input.lastCraft.getBoundingClientRect().top),
                  isMoved: false,
                }),
              skip(1),
              filter(({isMoved}) => isMoved),
              take(1), map(() => input)),
        },
      ],
      markerTargetCallback: () => Array.from(this.document.querySelectorAll('.craft-icon-sprite-image'))
        .last()
        .parentElement,
      markerType: 'ring',
    } as StepDetails;

    let relaySatellitesHint = {
      dialogPosition: 'bottom',
      dialogTitle: 'Relay Satellites',
      dialogTargetCallback: () => this.document.querySelector('.craft-icon-sprite-image'),
      dialogMessages: [
        'Some antenna types can relay a weak connection back to Kerbin.',
        'Add another spacecraft, but with a relay type antenna on it.',
      ],
      dialogIcon: Icons.Relay,
      stages: [
        {
          isDialogStage: true,
          callback: input => of(input),
        },
        {
          callback: input => defer(() => this.waitForElementCondition({
              cssSelector: 'cp-antenna-signal',
              filterCondition: nodes => nodes.length > 1,
            })
              .pipe(map(() => input)),
          ),
        },
      ],
    } as StepDetails;

    let relaySatellitesDrag = {
      dialogPosition: 'bottom',
      dialogTitle: 'Relaying Signals',
      dialogTargetCallback: () => this.document.querySelector('.craft-icon-sprite-image'),
      dialogMessages: [
        'Craft can be part of long chains to facilitate network coverage for rovers landed on far away moons.',
        'Move the spacecraft around until it loses or gains a connection to another spacecraft.',
      ],
      dialogIcon: Icons.Relay,
      stages: [
        {
          isDialogStage: true,
          callback: input => of(input),
        },
        {
          callback: input => defer(() => {
            let originalTransmissionLineCount = this.document.querySelectorAll('cp-antenna-signal').length;
            return this.waitForElementCondition({
              cssSelector: 'cp-antenna-signal',
              filterCondition: nodes => nodes.length != originalTransmissionLineCount,
            })
              .pipe(map(() => input));
          }),
        },
      ],
      markerTargetCallback: () => Array.from(this.document.querySelectorAll('.craft-icon-sprite-image'))
        .last()
        .parentElement,
      markerType: 'ring',
    } as StepDetails;

    return [
      editUniverse,
      autofillSearchBox,
      addCraft,
      communicationLines,
      relaySatellitesHint,
      relaySatellitesDrag,
    ];
  }

  private getDvPlannerStepDetails(): StepDetails[] {
    let missionCheckpoints = {
      dialogPosition: 'bottom',
      dialogTitle: 'Mission Checkpoints',
      dialogTargetCallback: () => this.document.querySelector('cp-maneuver-sequence-panel *'),
      dialogMessages: [
        'This panel calculates how much delta-v is required for your mission specifications.',
        'Tap the green add checkpoint button on the flashing panel to start your journey.'],
      dialogIcon: Icons.MapMarker,
      stages: [
        {
          callback: input => defer(() => {
            let resetCheckpoints = this.document.querySelector('[data-tutorial-clear-dv]');
            (resetCheckpoints as HTMLDivElement).click();
            return of(input);
          }),
        },
        {
          isDialogStage: true,
          callback: input => of(input),
        },
        {
          callback: input => defer(() => {
            let addCheckpoint = this.document.querySelector('[data-tutorial-checkpoint-add]');
            return fromEvent(addCheckpoint, 'click').pipe(
              take(1), map(() => input));
          }),
        },
      ],
      markerTargetCallback: () => this.document.querySelector('[data-tutorial-checkpoint-add]'),
      markerType: 'pane',
    } as StepDetails;

    let checkpointKerbin = {
      dialogPosition: 'bottom',
      dialogTitle: 'Adding Checkpoints',
      dialogTargetCallback: () => this.document.querySelector('cp-maneuver-sequence-panel *'),
      dialogMessages: [
        'Checkpoints define where the mission will be going. We will start at Kerbin',
        'Tap Kerbin to add it as your first checkpoint.'],
      dialogIcon: Icons.Traveler,
      stages: [
        {
          callback: () => defer(() => {
            let eve = this.selectObjectInDom('kerbin');
            let attachPoint = eve.firstChild.firstChild as HTMLElement;
            if (!attachPoint) {
              console.error('Expected draggable element to contain an image element.');
            }

            attachPoint.style.display = 'grid'; // this centers the wizardMarker around the planet
            let boundingClientRect = attachPoint.getBoundingClientRect();
            this.moveCameraToTarget(boundingClientRect);
            return timer(500).pipe(map(() => ({eve, attachPoint})));
          }),
        },
        {
          isDialogStage: true,
          callback: input => of(input),
        },
        {
          callback: input => defer(() => this.waitForElementCondition({
            cssSelector: '[data-tutorial-dv-node-id]',
            filterCondition: nodes => nodes.some(n => n.dataset.tutorialDvNodeId === 'Kerbin'),
          })
            .pipe(map(() => input))),
        },
      ],
      markerTargetCallback: () => this.selectObjectInDom('kerbin').firstChild.firstChild as HTMLDivElement,
      markerType: 'ring',
    } as StepDetails;

    let nodeExplained = {
      dialogPosition: 'bottom',
      dialogTitle: 'Checkpoint',
      dialogTargetCallback: () => this.document.querySelector('cp-maneuver-sequence-panel'),
      dialogMessages: [
        `Checkpoints appear in this list. The "Surface" button shows the specific situation.`,
        `"Surface" means we are landed, but our plan is to have a craft in orbit instead.`,
        `Set the situation to "Low Orbit".`,
      ],
      dialogIcon: Icons.Takeoff,
      stages: [
        {
          isDialogStage: true,
          callback: input => of(input),
        },
        {
          callback: input => defer(() => this.waitForElementCondition({
            cssSelector: '[data-tutorial-dv-condition]',
            filterCondition: nodes => nodes.some(n => n.dataset.tutorialDvCondition === TravelCondition.LowOrbit),
          })
            .pipe(map(() => input))),
        },
      ],
      markerTargetCallback: () => this.document.querySelector('[data-tutorial-dv-condition]'),
      markerType: 'pane',
    } as StepDetails;

    let addDunaNode = {
      dialogPosition: 'bottom',
      dialogTitle: 'Multiple Checkpoints',
      dialogTargetCallback: () => this.document.querySelector('cp-maneuver-sequence-panel'),
      dialogMessages: [
        `A mission has more than one checkpoint. Add a checkpoint on Duna.`,
        `The red planet might be far away, try zooming out to see it.`,
      ],
      dialogIcon: Icons.Ore,
      stages: [
        {
          isDialogStage: true,
          callback: input => of(input),
        },
        {
          callback: input => defer(() => this.waitForElementCondition({
            cssSelector: '[data-tutorial-dv-node-id]',
            filterCondition: nodes => nodes.some(n => n.dataset.tutorialDvNodeId === 'Duna'),
          })
            .pipe(map(() => input))),
        },
      ],
      markerTargetCallback: () => this.selectObjectInDom('duna').firstChild.firstChild,
      markerType: 'ring',
    } as StepDetails;

    let edgeExplained = {
      dialogPosition: 'bottom',
      dialogTitle: 'Trip Details',
      dialogTargetCallback: () => this.document.querySelector('cp-maneuver-sequence-panel *'),
      dialogMessages: [
        'With multiple checkpoints, the delta-v requirements show up.',
        'Tap the delta-v number in the list to show trip details. This shows all intermediary steps as well.',
      ],
      dialogIcon: Icons.Fuel,
      stages: [
        {
          isDialogStage: true,
          callback: input => of(input),
        },
        {
          callback: input => defer(() => this.waitForElementCondition({
              cssSelector: '[data-tutorial-dv-trip-details]',
            })
              .pipe(
                delay(1000),
                map(() => input)),
          ),
        },
      ],
      markerTargetCallback: () => this.document.querySelector('cp-msp-edge'),
      markerType: 'pane',
    } as StepDetails;

    let finalCheckpoint = {
      dialogPosition: 'bottom',
      dialogTitle: 'Total Delta-V',
      dialogTargetCallback: () => this.document.querySelector('cp-maneuver-sequence-panel *'),
      dialogMessages: [
        'The total required delta-v is always displayed below the list.',
        'It automatically updates as you change or re-order checkpoints.',
        'Add the final checkpoint on another planet, and watch for changes on the total delta-v.',
      ],
      dialogIcon: Icons.Policy,
      stages: [
        {
          isDialogStage: true,
          callback: input => of(input),
        },
        {
          callback: input => defer(() => this.waitForElementCondition({
              cssSelector: '[data-tutorial-dv-node-id]',
              filterCondition: nodes => nodes.length === 3,
            })
              .pipe(
                delay(1000),
                map(() => input)),
          ),
        },
      ],
      markerTargetCallback: () => this.document.querySelector('[data-tutorial-dv-total]'),
      markerType: 'pane',
    } as StepDetails;

    return [
      missionCheckpoints,
      checkpointKerbin,
      nodeExplained,
      addDunaNode,
      edgeExplained,
      finalCheckpoint,
    ];
  }

  private moveCameraToTarget(targetRect: DOMRect) {
    let cameraElement = this.document.querySelector('.camera-controller');
    cameraElement.dispatchEvent(new MouseEvent('mousedown', {buttons: 2}));
    cameraElement.dispatchEvent(new MouseEvent('mousemove', {
      movementX: -targetRect.right + window.innerWidth * .5,
      movementY: -targetRect.top + window.innerHeight * .5,
    }));
    cameraElement.dispatchEvent(new MouseEvent('mouseup'));
  }

  private selectObjectInDom(urlId: 'eve' | 'kerbol' | 'kerbin' | 'duna' | 'mun or minmus') {
    switch (urlId) {
      case 'eve':
        return this.getByImageUrl(urlId);
      case 'kerbol':
        return this.getByImageUrl(urlId);
      case 'kerbin':
        return this.getByImageUrl(urlId);
      case 'duna':
        return this.getByImageUrl(urlId);
      case 'mun or minmus':
        return this.getByImageUrl('mun') || this.getByImageUrl('minmus');
      default:
        return this.document.body;
    }
  }

  private getByImageUrl(urlId: string): HTMLElement {
    return Array.from(this.document.querySelectorAll('cp-draggable-space-object'))
      .find(p => (p.querySelector('.div-as-image') as HTMLElement)?.style?.background?.includes(urlId)) as HTMLElement;
  }

  private waitForElementCondition({duration, elementSelector, cssSelector, filterCondition}: {
    duration?: number,
    elementSelector?: () => HTMLElement[],
    cssSelector?: string,
    filterCondition?: (nodes: HTMLElement[]) => boolean,
  }
                                    = {}): Observable<unknown> {
    return interval(duration ?? 500)
      .pipe(
        map(elementSelector
          ?? (() => Array.from(this.document.querySelectorAll(cssSelector)))
          ?? (() => [])),
        filter(filterCondition ?? (elements => elements.length > 0)),
        take(1),
      );
  }
}
