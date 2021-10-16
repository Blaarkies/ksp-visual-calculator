import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MissionNode } from '../maneuver-sequence-panel.component';
import { Icons } from '../../../common/domain/icons';
import { MatSelectChange } from '@angular/material/select';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { PathDetailsReader } from '../msp-edge/path-details-reader';

@Component({
  selector: 'cp-msp-node',
  templateUrl: './msp-node.component.html',
  styleUrls: ['./msp-node.component.scss'],
  animations: [
    trigger('animateSelected', [
      state('false', style({opacity: .3})),
      state('true', style({opacity: 1, backgroundColor: '#fff2'})),
      transition('false => true', [
        animate('.2s ease-in', style({opacity: 1, backgroundColor: '#fff2'})),
      ]),
      transition('true => false', [
        animate('.2s ease-out', style({opacity: .3})),
      ]),
    ]),
  ],
})
export class MspNodeComponent {

  @Input() details: MissionNode;

  @Output() remove = new EventEmitter();
  @Output() update = new EventEmitter();

  icons = Icons;
  conditionReadableMap = PathDetailsReader.conditionMap;
  isPopoverOpen = false;

  setCondition(event: MatSelectChange) {
    this.details.condition = event.value;
    this.update.emit();
  }

  toggleAerobraking() {
    this.details.aerobraking = !this.details.aerobraking;
    this.update.emit();
  }

  toggleGravityAssist() {
    this.details.gravityAssist = !this.details.gravityAssist;
    this.update.emit();
  }

}
