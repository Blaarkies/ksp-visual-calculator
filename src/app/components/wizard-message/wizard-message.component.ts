import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { Vector2 } from '../../common/domain/vector2';
import { Subject } from 'rxjs';
import { Icons } from '../../common/domain/icons';

export interface WizardMessage {
  title: string;
  messages: string[];
  icon: string;
  location: Vector2;
  stopTutorial: Subject<void>;
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
    let hostStyle = this._self.nativeElement.style;
    hostStyle.left = `${value.x}px`;
    hostStyle.top = `${value.y}px`;
  };

  @Input() stopTutorial: Subject<void>;

  icons = Icons;

  constructor(private _self: ElementRef) {
  }

  cancelWizard() {
    this.stopTutorial.next();
  }

}
