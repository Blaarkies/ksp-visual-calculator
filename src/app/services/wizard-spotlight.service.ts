import { ApplicationRef, ComponentFactoryResolver, ComponentRef, EmbeddedViewRef, Injectable, Injector } from '@angular/core';
import { Vector2 } from '../common/domain/vector2';
import { WizardMessage, WizardMessageComponent } from '../components/wizard-message/wizard-message.component';
import { WizardMarker, WizardMarkerComponent } from '../components/wizard-marker/wizard-marker.component';
import { concat, from, Observable, of, Subject } from 'rxjs';
import { concatMap, delay, finalize, reduce, takeUntil, tap } from 'rxjs/operators';

export class StepDetails {
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

  private stopTutorial$ = new Subject();

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

    let targetDimensions = dialogTarget.getBoundingClientRect();
    let popupScreenLocation = this.getValidPopupScreenLocation(targetDimensions);

    let wizardMarker = stepDetails.markerTargetCallback
      && this.createPopup(WizardMarkerComponent, markerTarget, {
        type: stepDetails.markerType,
      } as WizardMarker);
    let wizardMessage = this.createPopup(WizardMessageComponent, document.body, {
      title: stepDetails.dialogTitle,
      messages: stepDetails.dialogMessages,
      icon: stepDetails.dialogIcon,
      location: popupScreenLocation,
      stopTutorial: this.stopTutorial$,
    } as WizardMessage);
    return [wizardMarker, wizardMessage].filter(comp => comp);
  }

  private getValidPopupScreenLocation(targetDimensions: DOMRect) {
    let topRight = new Vector2(targetDimensions.right, targetDimensions.top)
      .add(75, -150);

    if (topRight.x + 400 > document.body.offsetWidth
      || topRight.y + 400 > document.body.offsetHeight) {
      return new Vector2(document.body.offsetWidth, document.body.offsetWidth)
        .multiply(.25)
        .add(50, -150);
    }

    return topRight;
  }

  runSteps(steps: Observable<any>[]): Observable<void> {
    return concat(...steps)
      .pipe(takeUntil(this.stopTutorial$));
  }

}

