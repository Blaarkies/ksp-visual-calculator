import { Component, ElementRef, Input } from '@angular/core';
import { Vector2 } from '../../common/domain/vector2';
import { Subject } from 'rxjs';
import { Icons } from '../../common/domain/icons';
import { StepType } from '../../services/wizard-spotlight.service';

export interface WizardMessage {
  title: string;
  messages: string[];
  icon: string;
  location: Vector2;
  stopTutorial$: Subject<boolean>;
  nextButton$: Subject<void>;
  stepType: StepType;
}

@Component({
  selector: 'cp-wizard-message',
  templateUrl: './wizard-message.component.html',
  styleUrls: ['./wizard-message.component.scss'],
})
export class WizardMessageComponent implements WizardMessage {

  @Input() title: string;
  @Input() messages: string[];
  @Input() icon: string;

  @Input() set location(value: Vector2) {
    let hostStyle = this.self.nativeElement.style;
    hostStyle.left = `${value.x}px`;
    hostStyle.top = `${value.y}px`;
  }

  @Input() stopTutorial$: Subject<boolean>;
  @Input() nextButton$: Subject<void>;
  @Input() stepType: StepType;

  icons = Icons;

  constructor(public self: ElementRef) {
  }

  cancelWizard() {
    this.stopTutorial$.next(false);
  }

  finishWizard() {
    this.stopTutorial$.next(true);
  }

  continueWizard() {
    this.nextButton$.next();
  }

}
