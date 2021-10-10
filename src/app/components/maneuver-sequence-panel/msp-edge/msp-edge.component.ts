import { Component, Input } from '@angular/core';
import { Icons } from '../../../common/domain/icons';
import { animate, group, state, style, transition, trigger } from '@angular/animations';
import { CustomAnimation } from '../../../common/domain/custom-animation';
import { MissionEdge } from '../maneuver-sequence-panel.component';
import { PathDetailsReader } from './path-details-reader';

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

  missionEdge: MissionEdge;

  @Input() set details(value: MissionEdge) {
    this.missionEdge = value;
    this.path = value.pathDetails
      .map(details => {
        let {startNode, startCondition, combinationNode, endNode, endCondition, value} = details;
        return ({
          cost: value,
          description: PathDetailsReader.makeDescription(
            startNode, startCondition, combinationNode, endNode, endCondition)
        });
      });
  }

  icons = Icons;
  isPanelOpen = false;

  path: { cost, description }[];

  toggleSidePanel() {
    this.isPanelOpen = !this.isPanelOpen;
  }

}
