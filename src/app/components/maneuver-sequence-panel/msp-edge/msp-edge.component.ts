import { Component, Input } from '@angular/core';
import { Icons } from '../../../common/domain/icons';
import { animate, group, state, style, transition, trigger } from '@angular/animations';
import { CustomAnimation } from '../../../common/domain/custom-animation';

@Component({
  selector: 'cp-msp-edge',
  templateUrl: './msp-edge.component.html',
  styleUrls: ['./msp-edge.component.scss'],
  animations: [
    trigger('animateSlidePanel', [
      state('false', style({transform: 'translateX(0) scaleY(0)'})),
      state('true', style({transform: 'translateX(-100%) scaleY(1)'})),
      transition('false => true', [
        group([
          animate('.3s ease-out', style({transform: 'translateX(-100%) scaleY(1)'})),
        ]),
      ]),
      transition('true => false', [
        group([
          animate('.3s ease-in', style({transform: 'translateX(0) scaleY(0)'})),
        ]),
      ]),
    ]),
    CustomAnimation.animateScaleY,
  ],
})
export class MspEdgeComponent {

  @Input() details: { dv, twr };

  icons = Icons;
  isPanelOpen = false;

  path = [
    [950, 'From a Kerbin low orbit to a Kerbin elliptical orbit'],
    [10, 'To match orbital planes from Kerbin to Duna'],
    [130, 'To reach an intercept with Duna'],
    [300, 'To capture into an elliptical Duna orbit'],
    [360, 'From a Duna elliptical orbit to a Duna low orbit'],
    [1450, 'From a Duna low orbit to a Duna landing'],
  ].map(([cost, description]) => ({cost, description}));

  constructor() {
  }

  toggleSidePanel() {
    this.isPanelOpen = !this.isPanelOpen;
  }

}
