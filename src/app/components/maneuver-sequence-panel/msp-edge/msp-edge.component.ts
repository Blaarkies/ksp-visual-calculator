import { Component, Input } from '@angular/core';
import { Icons } from '../../../common/domain/icons';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { PathDetailsReader } from './path-details-reader';
import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { BehaviorSubject } from 'rxjs';
import { CheckpointEdge } from '../../../common/data-structures/delta-v-map/checkpoint-edge';

@Component({
  selector: 'cp-msp-edge',
  templateUrl: './msp-edge.component.html',
  styleUrls: ['./msp-edge.component.scss'],
  animations: [
    trigger('animateSlidePanel', [
      state('*', style({transform: 'translateX(-100%) scaleY(1)'})),
      transition(':enter', [
        style({transform: 'translateX(0) scaleY(0)'}),
        animate('.3s ease-out', style({transform: 'translateX(-100%) scaleY(1)'})),
      ]),
      transition(':leave', [
        style({transform: 'translateX(-100%) scaleY(1)'}),
        animate('.3s ease-in', style({transform: 'translateX(0) scaleY(0)'})),
      ]),
    ]),
  ],
})
export class MspEdgeComponent {

  missionEdge: CheckpointEdge;

  @Input() set details(edge: CheckpointEdge) {
    this.missionEdge = edge;
    this.path = edge.pathDetails
      .map(details => {
        let {startNode, startCondition, combinationNode, endNode, endCondition, value, aerobraking} = details;
        return ({
          cost: value,
          description: PathDetailsReader.makeDescription(
            startNode, startCondition, combinationNode, endNode, endCondition, aerobraking)
        });
      });
  }

  icons = Icons;
  isPanelOpen = false;
  isPanelOpenAnimate = new BehaviorSubject(false);

  path: { cost, description }[];

  positionLeftCenter = [new ConnectionPositionPair(
    {originX: 'start', originY: 'center'}, {overlayX: 'start', overlayY: 'center'})];

  toggleSidePanel() {
    this.isPanelOpen = !this.isPanelOpen;
  }

}
