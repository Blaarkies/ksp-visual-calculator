import { OverlayContainer } from '@angular/cdk/overlay';
import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injectable,
  Injector,
} from '@angular/core';
import {
  concat,
  concatMap,
  delay,
  finalize,
  from,
  Observable,
  of,
  reduce,
  Subject,
  takeUntil,
  tap,
  timer,
} from 'rxjs';
import { Vector2 } from '../common/domain/vector2';
import {
  WizardMarker,
  WizardMarkerComponent,
} from '../components/wizard-marker/wizard-marker.component';
import {
  WizardMessage,
  WizardMessageComponent,
} from '../components/wizard-message/wizard-message.component';

export type StepType = 'waitForNext' | 'end';
export type Position = 'left' | 'right' | 'top' | 'bottom' | 'center';

export class StepDetails {
  stepType?: StepType;
  nextButton$?: Subject<void>;

  dialogPosition?: Position;
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

@Injectable({providedIn: 'root'})
export class WizardSpotlightService {

  stopTutorial$ = new Subject<boolean>();

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private applicationRef: ApplicationRef,
              private injector: Injector,
              private overlayContainer: OverlayContainer,
              private window: Window) {
  }

  createPopup<T>(componentClass: any, target: HTMLElement, inputs?: any): ComponentRef<T> {
    const componentRef = this.componentFactoryResolver
      .resolveComponentFactory(componentClass)
      .create(this.injector) as ComponentRef<T>;

    // populate component inputs
    Object.assign(componentRef.instance, inputs);

    // attach component to the appRef so that it will be dirty checked.
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

    let container = this.overlayContainer.getContainerElement();
    let wizardMarker;
    if (stepDetails.markerTargetCallback) {
      wizardMarker = this.createPopup(WizardMarkerComponent, container,
        {type: stepDetails.markerType, target: markerTarget} as WizardMarker);
    }

    let wizardMessage: ComponentRef<WizardMessageComponent> = this.createPopup(
      WizardMessageComponent,
      container,
      {
        title: stepDetails.dialogTitle,
        messages: stepDetails.dialogMessages,
        icon: stepDetails.dialogIcon,
        location: new Vector2(targetDimensions.left, targetDimensions.top).subtract(50, 50),
        stopTutorial$: this.stopTutorial$,
        nextButton$: stepDetails.nextButton$,
        stepType: stepDetails.stepType,
      } as WizardMessage);

    timer(0).subscribe(() => wizardMessage.instance.location = new Vector2(8));

    return [wizardMarker, wizardMessage].filter(comp => comp);
  }

  runSteps(steps: Observable<any>[]): Observable<boolean> {
    return concat(...steps)
      .pipe(takeUntil(this.stopTutorial$));
  }

}
