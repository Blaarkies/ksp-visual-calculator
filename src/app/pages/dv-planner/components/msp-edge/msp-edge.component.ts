import {
  animate,
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
import {
  Component,
  Input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Icons } from '../../../../common/domain/icons';
import { AnalyticsService } from '../../../../services/analytics.service';
import { EventLogs } from '../../../../services/domain/event-logs';
import { CheckpointEdge } from '../../domain/checkpoint-edge';
import { PathDetailsReader } from '../../domain/path-details-reader';

@Component({
  selector: 'cp-msp-edge',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    OverlayModule,
  ],
  templateUrl: './msp-edge.component.html',
  styleUrls: ['./msp-edge.component.scss'],
  animations: [
    // custom shrink animation
    trigger('animateSlidePanel', [
      state('*', style({transform: 'translateX(-90%) scaleY(1)'})),
      transition(':enter', [
        style({transform: 'translateX(0) scaleY(0)'}),
        animate('.3s ease-out', style({transform: 'translateX(-90%) scaleY(1)'})),
      ]),
      transition(':leave', [
        style({transform: 'translateX(-90%) scaleY(1)'}),
        animate('.3s ease-in', style({transform: 'translateX(0) scaleY(0)'})),
      ]),
    ]),
  ],
})
export class MspEdgeComponent {

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

  missionEdge: CheckpointEdge;
  icons = Icons;
  isPanelOpen = false;
  path: { cost, description }[];

  positionLeftCenter = [new ConnectionPositionPair(
    {originX: 'start', originY: 'center'}, {overlayX: 'start', overlayY: 'center'})];

  constructor(private analyticsService: AnalyticsService) {
  }

  toggleSidePanel() {
    this.isPanelOpen = !this.isPanelOpen;

    if (this.isPanelOpen) {
      this.analyticsService.logEvent('View trip details', {
        category: EventLogs.Category.DeltaV,
      });
    }
  }

}
