import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injectable,
  Injector
} from '@angular/core';
import { Vector2 } from '../common/domain/vector2';
import { WizardMessage, WizardMessageComponent } from '../components/wizard-message/wizard-message.component';
import { WizardMarker, WizardMarkerComponent } from '../components/wizard-marker/wizard-marker.component';
import { concat, from, Observable, of, Subject, timer } from 'rxjs';
import { concatMap, delay, finalize, reduce, takeUntil, tap } from 'rxjs/operators';

export type StepType = 'waitForNext' | 'end';
export type Positions = 'left' | 'right' | 'top' | 'bottom' | 'center';

export class StepDetails {
  stepType?: StepType;
  nextButton$?: Subject<void>;

  dialogPosition?: Positions;
  dialogTargetCallback: () => HTMLElement | any;
  dialogTitle?: string;
  dialogMessages: string[];
  dialogIcon?: string;

  stages: {
    number?: number;
    isDialogStage?: boolean;
    callback?: (input: any) => Observable<any>;
  }[];

  markerTargetCallback?: () => HTMLElement | any;
  markerType?: 'ring' | 'pane';
}

@Injectable({
  providedIn: 'root',
})
export class WizardSpotlightService {

  stopTutorial$ = new Subject<boolean>();

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private applicationRef: ApplicationRef,
              private injector: Injector) {
  }

  createPopup<T>(componentClass: any, target: HTMLElement, inputs?: any): ComponentRef<T> {
    const componentRef = this.componentFactoryResolver
      .resolveComponentFactory(componentClass)
      .create(this.injector) as ComponentRef<T>;

    // populate component inputs
    Object.assign(componentRef.instance, inputs);

    // attach component to the appRef so that so that it will be dirty checked.
    this.applicationRef.attachView(componentRef.hostView);

    // get DOM element from component
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;

    target.appendChild(domElem);

    return componentRef;
  }

  removeComponentFromBody<T>(componentRef: ComponentRef<T>) {
    this.applicationRef.detachView(componentRef.hostView);
    componentRef.destroy();
  }

  compileStep(stepDetails: StepDetails): Observable<any> {
    let allDestroyables = [];
    let compiledStep = from(stepDetails.stages)
      .pipe(
        // run all stages synchronously, with daisy-chained inputs
        reduce((input: Observable<any>, stage) => {
            let stageOutput = input.pipe(concatMap(data => stage.callback(data)));

            if (stage.isDialogStage) {
              // open dialog, and save component refs for later cleanup
              stageOutput = stageOutput.pipe(
                tap(() => {
                  let destroyables = this.setupDialog(stepDetails);
                  allDestroyables.push(...destroyables);
                }));
            }

            return stageOutput;
          },
          of(null)),
        concatMap(stages => stages),
        finalize(() => {
          allDestroyables.forEach(comp => this.removeComponentFromBody(comp));
          allDestroyables = undefined;
        }),
        delay(500),
      );

    return compiledStep;
  }

  private setupDialog(stepDetails: StepDetails): ComponentRef<any>[] {
    let dialogTarget = stepDetails.dialogTargetCallback();
    let markerTarget = stepDetails.markerTargetCallback && stepDetails.markerTargetCallback();

    let targetDimensions: DOMRect = dialogTarget.getBoundingClientRect();

    let wizardMarker = stepDetails.markerTargetCallback
      && this.createPopup(WizardMarkerComponent, document.body,
        {type: stepDetails.markerType, target: markerTarget} as WizardMarker);

    let wizardMessage: ComponentRef<WizardMessageComponent> = this.createPopup(
      WizardMessageComponent,
      document.body,
      {
        title: stepDetails.dialogTitle,
        messages: stepDetails.dialogMessages,
        icon: stepDetails.dialogIcon,
        location: new Vector2(targetDimensions.left, targetDimensions.top).subtract(50, 50),
        stopTutorial$: this.stopTutorial$,
        nextButton$: stepDetails.nextButton$,
        stepType: stepDetails.stepType,
      } as WizardMessage);

    timer(0)
      .pipe(
        // dialogs on screen edge have compressed text
        tap(() => this.placeDialogInScreen(wizardMessage, targetDimensions, stepDetails.dialogPosition)),
        delay(0),
        // dialog size changed by now, re-check positioning
        tap(() => this.placeDialogInScreen(wizardMessage, targetDimensions, stepDetails.dialogPosition)))
      .subscribe();

    return [wizardMarker, wizardMessage].filter(comp => comp);
  }

  runSteps(steps: Observable<any>[]): Observable<boolean> {
    return concat(...steps)
      .pipe(takeUntil(this.stopTutorial$));
  }

  private placeDialogInScreen(dialog: ComponentRef<WizardMessageComponent>,
                              target: DOMRect,
                              dialogPosition: Positions = 'top') {
    let dims: DOMRect = dialog.instance.self.nativeElement.getBoundingClientRect();
    let padding = 8;

    let dialogSize = new Vector2(dims.width, dims.height).add(padding * 2);

    let targetSize = new Vector2(target.width, target.height);
    let targetCenter = new Vector2(target.left, target.top).addVector2(
      targetSize.clone().multiply(.5));

    let newLocation: Vector2;
    switch (dialogPosition) {
      case 'left':
        newLocation = new Vector2(target.left, targetCenter.y)
          .add(-dialogSize.x, -dialogSize.y * .5);
        break;
      case 'right':
        newLocation = new Vector2(target.right, targetCenter.y)
          .add(targetSize.x * .5, -dialogSize.y * .5);
        break;
      case 'top':
        newLocation = new Vector2(targetCenter.x, target.top)
          .add(-dialogSize.x, -dialogSize.y);
        break;
      case 'bottom':
        newLocation = new Vector2(targetCenter.x, target.bottom)
          .add(-dialogSize.x, targetSize.y * .5);
        break;
      case 'center':
        newLocation = new Vector2(window.innerWidth * .5, window.innerHeight * .5)
          .addVector2(dialogSize.clone().multiply(-.5));
        break;
      default:
        throw new Error(`DialogPosition "${dialogPosition}" does not exist`);
    }

    if (newLocation.x < 0) {
      newLocation.x = 0;
    } else if (newLocation.x + dialogSize.x >= window.innerWidth) {
      newLocation.x = window.innerWidth - dialogSize.x;
    } else if (newLocation.y < 0) {
      newLocation.y = 0;
    } else if (newLocation.y + dialogSize.y >= window.innerHeight) {
      newLocation.y = window.innerHeight - dialogSize.y;
    }

    dialog.instance.location = newLocation.add(padding);
  }

}

