import { Injectable } from '@angular/core';
import { StepDetails, WizardSpotlightService } from './wizard-spotlight.service';
import { Icons } from '../common/domain/icons';
import { defer, fromEvent, interval, Observable, of, timer } from 'rxjs';
import { delay, filter, mapTo, take } from 'rxjs/operators';
import { AnalyticsService, EventLogs } from './analytics.service';

@Injectable({
  providedIn: 'root',
})
export class TutorialService {

  constructor(private wizardSpotlightService: WizardSpotlightService,
              private analyticsService: AnalyticsService) {
  }

  startFullTutorial() {
    this.analyticsService.logEvent('Start tutorial', {
      category: EventLogs.Category.Tutorial,
    });

    let compiledSteps = this.getCompiledSteps();

    this.wizardSpotlightService
      .runSteps(compiledSteps)
      .subscribe(() => this.analyticsService
        .logEvent('Finish tutorial', {category: EventLogs.Category.Tutorial}));
  }

  private getCompiledSteps(): Observable<any>[] {
    let stepDetails = this.getStepDetails();

    return stepDetails.map(detail => this.wizardSpotlightService.compileStep(detail));
  }

  private getStepDetails(): StepDetails[] {
    let dragPlanet = {
      dialogTargetCallback: () => document.querySelector('#Eve').firstChild,
      dialogMessages: [
        'This is a planet, it can be dragged around its orbit.',
        'Moons and spacecraft can also be moved.',
        'Left-click and hold on the planet to move it around.'],
      dialogIcon: Icons.Planet,
      stages: [
        {
          callback: () => defer(() => {
            let eve = document.querySelector('#Eve');
            let attachPoint = eve.firstChild?.firstChild as HTMLDivElement;
            if (!attachPoint) {
              throw 'Expected draggable element to contain an image element.';
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
          callback: (input: { eve, attachPoint }) => fromEvent(input.attachPoint, 'mouseup')
            .pipe(take(1), mapTo(input)),
        },
        {
          callback: (input: { eve, attachPoint }) => defer(() => {
            input.attachPoint.style.display = undefined;
            return of(input);
          }),
        },
      ],
      markerTargetCallback: () => document.querySelector('#Eve').firstChild?.firstChild as HTMLDivElement,
      markerType: 'ring',
    } as StepDetails;

    let moveCamera = {
      dialogTargetCallback: () => document.querySelector('#Kerbol').firstChild,
      dialogMessages: [
        'The camera can be moved around to see other parts of the Kerbol system.',
        'Right-click and hold in the universe to pan the camera around.'],
      dialogIcon: Icons.Camera,
      stages: [
        {
          isDialogStage: true,
          callback: input => of(input),
        },
        {
          callback: input => fromEvent(document.body, 'mouseup')
            .pipe(take(1), mapTo(input)),
        },
      ],
    } as StepDetails;

    let zoomCamera = {
      dialogTargetCallback: () => document.querySelector('#Kerbin').firstChild?.firstChild,
      dialogMessages: [
        'Some planets have moons, but you have to zoom in to see them.',
        'Point the mouse cursor at Kerbin, then scroll in/out with the mouse wheel, to zoom in/out.',
        'Zoom in until you can see the moons of Kerbin.'],
      dialogIcon: Icons.ZoomIn,
      stages: [
        {
          callback: () => defer(() => {
            let kerbin = document.querySelector('#Kerbin');
            let attachPoint = kerbin.firstChild?.firstChild as HTMLDivElement;
            if (!attachPoint) {
              throw 'Expected draggable element to contain an image element.';
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
          callback: (input: { kerbin, attachPoint }) => fromEvent(document.body, 'mousewheel').pipe(
            filter(() => !!document.querySelector('#Mun, #Minmus')),
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
      markerTargetCallback: () => document.querySelector('#Kerbin').firstChild?.firstChild as HTMLDivElement,
      markerType: 'ring',
    } as StepDetails;

    let editUniverse = {
      dialogTargetCallback: () => document.querySelector('cp-edit-universe-action-panel mat-expansion-panel mat-list-option'),
      dialogMessages: [
        'This universe can be configured here.',
        'Click "New Craft" to add your own spacecraft.'],
      dialogIcon: Icons.Configure,
      stages: [
        {
          callback: input => defer(() => {
            let addCraftButton = document.querySelector('cp-edit-universe-action-panel button[mat-icon-button]');
            (addCraftButton as HTMLButtonElement).click();
            return timer(500).pipe(mapTo(input));
          }),
        },
        {
          isDialogStage: true,
          callback: input => of(input),
        },
        {
          callback: input => defer(() => {
            // todo: re-use markerTargetCallback() instead
            let matListOptions = document.querySelectorAll('cp-edit-universe-action-panel mat-list-option');
            let target = Array.from(matListOptions).find(e => e.innerHTML.includes('New Craft')) as HTMLElement;
            return fromEvent(target, 'click').pipe(
              take(1), mapTo(input));
          }),
        },
      ],
      markerTargetCallback: () => {
        let matListOptions = document.querySelectorAll('cp-edit-universe-action-panel mat-list-option');
        return Array.from(matListOptions).find(e => e.innerHTML.includes('New Craft')) as HTMLElement;
      },
      markerType: 'pane',
    } as StepDetails;

    let addCraft = {
      dialogTargetCallback: () => document.querySelector('mat-dialog-container'),
      dialogMessages: [
        'Spacecraft can be added and configured here.',
        'Remember to select a communications antenna for this spacecraft.',
        'After that, click "Create" to add the spacecraft.'],
      dialogIcon: Icons.Antenna,
      stages: [
        {
          callback: input => defer(() => {
            let antennaSelect = document.querySelector('cp-antenna-selector cp-input-select mat-select') as HTMLSelectElement;
            antennaSelect.click();
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
      markerTargetCallback: () => Array.from(document.querySelectorAll('mat-option span'))
        .find((e: HTMLElement) => e.innerText.includes('Communotron HG-55')),
      markerType: 'pane',
    } as StepDetails;

    let communicationLines = {
      dialogTargetCallback: () => {
        let crafts = document.querySelectorAll('.craft-icon-sprite-image');
        return crafts[crafts.length - 1];
      },
      dialogMessages: [
        'The new spacecraft should have a visible, green connection line to the closest relay (like Kerbin).',
        'This line color represents the signal strength.',
        'Move the spacecraft closer/farther from Kerbin to see the connection strength change.',
        'Strong antennae can be dragged to far away planets before losing connection.'],
      dialogIcon: Icons.SignalStrength,
      stages: [
        {
          isDialogStage: true,
          callback: input => defer(() => {
            let crafts = document.querySelectorAll('.craft-icon-sprite-image');
            let lastCraft = crafts[crafts.length - 1] as HTMLElement;

            lastCraft.style.display = 'grid'; // this centers the wizardMarker around the craft
            return of({...input, lastCraft});
          }),
        },
        {
          callback: (input: { lastCraft }) => fromEvent(input.lastCraft, 'mouseup')
            .pipe(take(1), mapTo(input)),
        },
        {
          callback: (input: { lastCraft }) => defer(() => {
            input.lastCraft.style.display = undefined;
            return of(input);
          }),
        },
      ],
      markerTargetCallback: () => {
        let crafts = document.querySelectorAll('.craft-icon-sprite-image');
        return crafts[crafts.length - 1];
      },
      markerType: 'ring',
    } as StepDetails;

    let relaySatellites = {
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

    let endTutorial = {
      dialogTargetCallback: () => document.body,
      dialogMessages: [
        'That concludes the tutorial.',
        'The universe is now you playground!'],
      dialogIcon: Icons.Congratulations,
      stages: [
        {
          isDialogStage: true,
          callback: input => of(input),
        },
        {
          callback: input => fromEvent(document.body, 'mousedown').pipe(
            take(1),
            mapTo(input)),
        },
      ],
    } as StepDetails;

    return [
      dragPlanet,
      moveCamera,
      zoomCamera,
      editUniverse,
      addCraft,
      communicationLines,
      relaySatellites,
      endTutorial,
    ];
  }

  private moveCameraToTarget(targetRect: DOMRect) {
    let cameraElement = document.querySelector('.camera-controller');
    cameraElement.dispatchEvent(new MouseEvent('mousedown', {buttons: 2}));
    cameraElement.dispatchEvent(new MouseEvent('mousemove', {
      movementX: -targetRect.right + cameraElement.clientWidth * .5,
      movementY: -targetRect.top + cameraElement.clientHeight * .5,
    }));
    cameraElement.dispatchEvent(new MouseEvent('mouseup'));
  }

}
