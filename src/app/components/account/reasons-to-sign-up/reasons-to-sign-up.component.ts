import {
  animate,
  AnimationEvent,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  ConnectionPositionPair,
  OverlayModule,
} from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BasicAnimations } from '../../../animations/basic-animations';
import { Common } from '../../../common/common';
import { Icons } from '../../../common/domain/icons';

@Component({
  selector: 'cp-reasons-to-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    OverlayModule,
    MatIconModule,
  ],
  templateUrl: './reasons-to-sign-up.component.html',
  styleUrls: ['./reasons-to-sign-up.component.scss'],
  animations: [
    trigger('slideOutVertical', [
      state('null, true', style({translate: '0 0'})),
      state('void, false', style({translate: '0 100%', opacity: 0})),
      transition(':enter, * => true', [animate('.3s ease-in')]),
      transition(':leave, * => false', [animate('.2s ease-in')]),
    ]),
  ],
})
export class ReasonsToSignUpComponent {

  isOverlayOpen = false;
  isWindowOpen = false;
  icons = Icons;

  // Overlay is shifted upwards by button's height to maintain click region
  // Position strategies are set to function on this new offset origin
  position = [Common.createConnectionPair('↘')[0],
    Common.createConnectionPair('↘', '↗')[0]];

  closeOverlay(event: AnimationEvent) {
    if (event.fromState !== null) {
      // do nothing on :enter transition
      return;
    }
    // overlay is kept open, until window animation is done
    this.isOverlayOpen = false;
  }

  toggleOverlay() {
    if (this.isOverlayOpen && !this.isWindowOpen) {
      // busy closing overlay
      return;
    }

    if (this.isOverlayOpen && this.isWindowOpen) {
      this.isWindowOpen = false;
      return;
    }

    this.isOverlayOpen = true;
    this.isWindowOpen = true;
  }
}
