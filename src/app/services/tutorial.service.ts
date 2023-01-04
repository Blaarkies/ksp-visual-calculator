import { Injectable } from '@angular/core';
import { StepDetails, WizardSpotlightService } from './wizard-spotlight.service';
import { Icons } from '../common/domain/icons';
import {
  defer,
  delay,
  filter, firstValueFrom,
  fromEvent,
  interval,
  map,
  mapTo,
  Observable,
  of,
  scan,
  skip,
  Subject,
  take,
  takeUntil,
  timer
} from 'rxjs';
import { AnalyticsService } from './analytics.service';
import { Vector2 } from '../common/domain/vector2';
import { EventLogs } from './event-logs';
import { UsableRoutes } from '../usable-routes';
import { StateService } from './state.service';

@Injectable({
  providedIn: 'root',
})
export class TutorialService {

  resetTutorial$ = new Subject<void>();

  constructor(private wizardSpotlightService: WizardSpotlightService,
              private analyticsService: AnalyticsService,
              private stateService: StateService) {
  }

  async startFullTutorial(context: UsableRoutes) {
    this.analyticsService.logEvent('Start tutorial', {
      category: EventLogs.Category.Tutorial,
      context,
    });

    // reset universe
    await firstValueFrom(this.stateService.loadState());

    this.resetTutorial$.next();
    let compiledSteps = this.getCompiledSteps(context);

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

  private getCompiledSteps(context: UsableRoutes): Observable<any>[] {
    let stepDetails;
    stepDetails = [
      this.getStepStartOfTutorial(context),
      ...this.getCommonStepDetails(),
      ...this.getStepDetails(context),
      this.getStepEndOfTutorial(),
    ];

    return stepDetails.map(detail => this.wizardSpotlightService.compileStep(detail));
  }

  private getStepDetails(context: UsableRoutes) {
    switch (context) {
      case UsableRoutes.SignalCheck:
        return this.getSignalCheckStepDetails();
      case UsableRoutes.DvPlanner:
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
            return timer(500).pipe(mapTo({eve, attachPoint}));
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
              mapTo(input)),
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
              take(1), mapTo(input)),
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
            return timer(500).pipe(mapTo({kerbin, attachPoint}));
          }),
        },
        {
          isDialogStage: true,
          callback: (input: { kerbin, attachPoint }) => of(input),
        },
        {
          callback: (input: { kerbin, attachPoint }) => interval(500).pipe(
            filter(() => !!this.selectObjectInDom('mun or minmus')),
            take(1),
            delay(1000),
            mapTo(input)),
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

  private getStepStartOfTutorial(context: UsableRoutes): StepDetails {
    let startTutorialNext$ = new Subject<void>();
    let startTutorial = {
      stepType: 'waitForNext',
      nextButton$: startTutorialNext$,
      dialogPosition: 'right',
      dialogTitle: null,
      dialogTargetCallback: () => document.querySelector('.page-icon'),
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
            mapTo(input)),
        },
      ],
    } as StepDetails;

    switch (context) {
      case UsableRoutes.SignalCheck:
        startTutorial.dialogTitle = 'CommNet Planner Tutorial';
        startTutorial.dialogMessages = [
          'This page helps setup satellite communication networks by letting you place craft with specific antennae.',
          'Dragging these craft around will instantly show where connections are possible.'
        ];
        startTutorial.dialogIcon = Icons.Relay;
        break;
      case UsableRoutes.DvPlanner:
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
      dialogTargetCallback: () => document.body,
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
            mapTo(input)),
        },
      ],
    } as StepDetails;
  }

  private getSignalCheckStepDetails(): StepDetails[] {
    let editUniverse = {
      dialogPosition: 'top',
      dialogTitle: 'Adding Spacecraft',
      dialogTargetCallback: () => document.querySelector(
        'cp-action-bottom-sheet, cp-action-panel#context-panel'),
      dialogMessages: [
        'Simulated spacecraft can be added to this universe.',
        'Click "New Craft" to add your own spacecraft.'],
      dialogIcon: Icons.Configure,
      stages: [
        {
          callback: input => defer(() => {
            let openEditOptionsButton = document.querySelector(
              'cp-action-panel#context-panel button, cp-action-fab#context-fab button');
            (openEditOptionsButton as HTMLButtonElement).click();
            return timer(500).pipe(mapTo(input));
          }),
        },
        {
          isDialogStage: true,
          callback: input => of(input),
        },
        {
          callback: input => defer(() => {
            let matListOptions = document.querySelectorAll(
              'cp-action-panel#context-panel mat-list-item, cp-action-list mat-list-item');
            let target = Array.from(matListOptions).find(e => e.innerHTML.includes('New Craft')) as HTMLElement;
            return fromEvent(target, 'click').pipe(
              take(1), mapTo(input), delay(100));
          }),
        },
      ],
      markerTargetCallback: () => {
        let matListOptions = document.querySelectorAll(
          'cp-action-panel#context-panel mat-list-item, cp-action-list mat-list-item');
        return Array.from(matListOptions).find(e => e.innerHTML.includes('New Craft')) as HTMLElement;
      },
      markerType: 'pane',
    } as StepDetails;

    let addCraft = {
      dialogPosition: 'right',
      dialogTitle: 'Selecting Antenna Types',
      dialogTargetCallback: () => document.querySelector('cp-craft-details-dialog'),
      dialogMessages: [
        'Spacecraft can be added and configured here.',
        'Remember to select a communications antenna for this spacecraft, e.g. the "Communotron HG-55".',
        'After that, click "Create" to add the spacecraft.'],
      dialogIcon: Icons.Antenna,
      stages: [
        {
          callback: input => defer(() => {
            let antennaSelect = document.querySelector('cp-antenna-selector cp-input-select mat-select') as HTMLSelectElement;
            antennaSelect.click();
            return timer(100).pipe(mapTo(input));
          }),
        },
        {
          callback: input => defer(() => {
            let antennaSearch = document.querySelector('cp-input-field[label="Search"] input') as HTMLInputElement;
            antennaSearch.value = 'hg';
            antennaSearch.dispatchEvent(new Event('input'));
            return timer(500).pipe(mapTo(input));
          }),
        },
        {
          isDialogStage: true,
          callback: input => of(input),
        },
        {
          callback: input => defer(() => {
            let createButton = document.querySelector('cp-craft-details-dialog button[color=primary]');
            return fromEvent(createButton, 'click').pipe(
              take(1), mapTo(input));
          }),
        },
      ],
    } as StepDetails;

    let communicationLines = {
      dialogPosition: 'bottom',
      dialogTitle: 'Changing Communication Lines',
      dialogTargetCallback: () => {
        let crafts = document.querySelectorAll('.craft-icon-sprite-image');
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
            let crafts = document.querySelectorAll('.craft-icon-sprite-image');
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
              take(1), mapTo(input)),
        },
      ],
      markerTargetCallback: () => {
        let crafts = document.querySelectorAll('.craft-icon-sprite-image');
        let lastAddedCraft = crafts[crafts.length - 1];
        return lastAddedCraft.parentElement;
      },
      markerType: 'ring',
    } as StepDetails;

    let relaySatellites = {
      dialogPosition: 'bottom',
      dialogTitle: 'Relaying Signals',
      dialogTargetCallback: () => document.querySelector('.craft-icon-sprite-image'),
      dialogMessages: [
        'Some antenna types can relay a weak connection back to Kerbin.',
        'Add another spacecraft with a relay type antenna.',
        'Move this new spacecraft around to obtain a connection to another spacecraft.'],
      dialogIcon: Icons.Relay,
      stages: [
        {
          isDialogStage: true,
          callback: input => of(input),
        },
        {
          callback: input => defer(() => {
            let transmissionLineCount = document.querySelectorAll('cp-transmission-line').length;
            return interval(500).pipe(
              filter(() =>
                transmissionLineCount !== document.querySelectorAll('cp-transmission-line').length),
              take(1),
              delay(500),
              mapTo(input));
          }),
        },
      ],
    } as StepDetails;

    return [
      editUniverse,
      addCraft,
      communicationLines,
      relaySatellites,
    ];
  }

  private getDvPlannerStepDetails(): StepDetails[] {
    let missionCheckpoints = {
      dialogPosition: 'bottom',
      dialogTitle: 'Mission Checkpoints',
      dialogTargetCallback: () => document.querySelector('cp-maneuver-sequence-panel *'),
      dialogMessages: [
        'This panel calculates how much delta-v is required for your mission specifications.',
        'Tap the green add checkpoint button on the flashing panel to start your journey.'],
      dialogIcon: Icons.MapMarker,
      stages: [
        {
          callback: input => defer(() => {
            let resetCheckpoints = document.querySelector('#clear-dv-mission-button');
            (resetCheckpoints as HTMLButtonElement).click();
            return of(input);
          }),
        },
        {
          isDialogStage: true,
          callback: input => of(input),
        },
        {
          callback: input => defer(() => {
            let addCheckpoint = document.querySelector('#add-dv-mission-checkpoint-button');
            return fromEvent(addCheckpoint, 'click').pipe(
              take(1), mapTo(input));
          }),
        },
      ],
      markerTargetCallback: () => document.querySelector('cp-maneuver-sequence-panel *'),
      markerType: 'pane',
    } as StepDetails;

    let checkpointKerbin = {
      dialogPosition: 'bottom',
      dialogTitle: 'Adding Checkpoints',
      dialogTargetCallback: () => document.querySelector('cp-maneuver-sequence-panel *'),
      dialogMessages: [
        'Checkpoints define where the mission will be going.',
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
            return timer(500).pipe(mapTo({eve, attachPoint}));
          }),
        },
        {
          isDialogStage: true,
          callback: input => of(input),
        },
        {
          callback: input => defer(() => interval(500).pipe(
            map(() => Array.from(document.querySelectorAll('cp-msp-node'))),
            filter((nodes: any[]) => nodes.find(n => n.innerText.toLowerCase().includes('kerbin'))),
            mapTo(input),
            take(1))),
        },
      ],
      markerTargetCallback: () => this.selectObjectInDom('kerbin').firstChild.firstChild as HTMLDivElement,
      markerType: 'ring',
    } as StepDetails;

    let nodeExplained = {
      dialogPosition: 'bottom',
      dialogTitle: 'Checkpoint',
      dialogTargetCallback: () => document.querySelector('cp-maneuver-sequence-panel'),
      dialogMessages: [
        `Checkpoints appear in this list. The "Surface" button shows the specific situation at this checkpoint.`,
        `If you do not plan on launching from Kerbin's surface, you can instead set this to "Low Orbit".`,
        `Let's add another checkpoint, this time at Duna.`],
      dialogIcon: Icons.Takeoff,
      stages: [
        {
          isDialogStage: true,
          callback: input => of(input),
        },
        {
          callback: input => defer(() => interval(500).pipe(
            map(() => Array.from(document.querySelectorAll('cp-msp-node'))),
            filter((nodes: any[]) => nodes.length === 2
              && nodes.find(n => n.innerText.toLowerCase().includes('duna'))),
            mapTo(input),
            take(1))),
        },
      ],
      markerTargetCallback: () => document.querySelector('cp-msp-node'),
      markerType: 'pane',
    } as StepDetails;

    let edgeExplained = {
      dialogPosition: 'bottom',
      dialogTitle: 'Trip Details',
      dialogTargetCallback: () => document.querySelector('cp-maneuver-sequence-panel *'),
      dialogMessages: [
        'When 2 or more checkpoints are selected, the delta-v requirements can be seen in the list.',
        'Tap the delta-v number in the list to expand the trip details. This shows the intermediary steps.',
        'Add a checkpoint on another planet to see the total delta-v requirements be calculated for you.'
      ],
      dialogIcon: Icons.Fuel,
      stages: [
        {
          isDialogStage: true,
          callback: input => of(input),
        },
        {
          callback: input => defer(() => interval(500).pipe(
            map(() => Array.from(document.querySelectorAll('cp-msp-node'))),
            filter((nodes: any[]) => nodes.length === 3),
            mapTo(input),
            take(1))),
        },
      ],
      markerTargetCallback: () => document.querySelector('cp-msp-edge'),
      markerType: 'pane',
    } as StepDetails;

    return [
      missionCheckpoints,
      checkpointKerbin,
      nodeExplained,
      edgeExplained,
    ];
  }

  private moveCameraToTarget(targetRect: DOMRect) {
    let cameraElement = document.querySelector('.camera-controller');
    cameraElement.dispatchEvent(new MouseEvent('mousedown', {buttons: 2}));
    cameraElement.dispatchEvent(new MouseEvent('mousemove', {
      movementX: -targetRect.right + window.innerWidth * .5,
      movementY: -targetRect.top + window.innerHeight * .5,
    }));
    cameraElement.dispatchEvent(new MouseEvent('mouseup'));
  }

  private selectObjectInDom(urlId: 'eve' | 'kerbol' | 'kerbin' | 'mun or minmus') {
    switch (urlId) {
      case 'eve':
        return this.getByImageUrl(urlId);
      case 'kerbol':
        return this.getByImageUrl(urlId);
      case 'kerbin':
        return this.getByImageUrl(urlId);
      case 'mun or minmus':
        return this.getByImageUrl('mun') || this.getByImageUrl('minmus');
      default:
        return document.body;
    }
  }

  private getByImageUrl(urlId: string): HTMLElement {
    return Array.from(document.querySelectorAll('cp-draggable-space-object'))
      .find(p => (p.querySelector('.div-as-image') as HTMLElement)?.style?.background?.includes(urlId)) as HTMLElement;
  }
}
