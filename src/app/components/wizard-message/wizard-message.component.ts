import { Component, ElementRef, Input } from '@angular/core';
import { Vector2 } from '../../common/domain/vector2';
import { map, Observable, Subject } from 'rxjs';
import { Icons } from '../../common/domain/icons';
import { StepType } from '../../services/wizard-spotlight.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { NegatePipe } from "../../common/negate.pipe";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MatButtonModule } from "@angular/material/button";

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
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    NegatePipe,
    DragDropModule,
  ],
  templateUrl: './wizard-message.component.html',
  styleUrls: ['./wizard-message.component.scss'],
})
export class WizardMessageComponent implements WizardMessage {

  @Input() title: string;
  @Input() messages: string[];
  @Input() icon: string;

  @Input() set location(value: Vector2) {
    // let hostStyle = this.self.nativeElement.style;
    // hostStyle.left = `${value.x}px`;
    // hostStyle.top = `${value.y}px`;
  }

  @Input() stopTutorial$: Subject<boolean>;
  @Input() nextButton$: Subject<void>;
  @Input() stepType: StepType;

  icons = Icons;
  isHandset$: Observable<boolean>;

  constructor(public self: ElementRef,
              breakpointObserver: BreakpointObserver) {
    this.isHandset$ = breakpointObserver.observe([
      '(max-width: 600px)',
      '(max-height: 800px)',
    ])
      .pipe(map(bp => bp.matches));
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
