import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import {
  MatSelectChange,
  MatSelectModule,
} from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Icons } from '../../../../common/domain/icons';
import { CheckpointNode } from '../../domain/checkpoint-node';
import { PathDetailsReader } from '../../domain/path-details-reader';

@Component({
  selector: 'cp-msp-node',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: './msp-node.component.html',
  styleUrls: ['./msp-node.component.scss'],
  animations: [
    // custom animation to accompany icon styling
    trigger('animateSelected', [
      state('false', style({opacity: .6, color: '#fff'})),
      state('true', style({opacity: 1, backgroundColor: '#fff2', color: '#7f7'})),
      transition('false => true', [
        animate('.2s ease-in', style({opacity: 1, backgroundColor: '#fff2', color: '#7f7'})),
      ]),
      transition('true => false', [
        animate('.2s ease-out', style({opacity: .4, color: '#fff'})),
      ]),
    ]),
  ],
})
export class MspNodeComponent {

  @Input() details: CheckpointNode;
  @Input() dragModeActive: boolean;

  @Output() remove = new EventEmitter();
  @Output() update = new EventEmitter();

  icons = Icons;
  conditionReadableMap = PathDetailsReader.conditionMap;

  setCondition(event: MatSelectChange) {
    this.details.condition = event.value;
    this.update.emit();
  }

  toggleAerobraking() {
    this.details.aerobraking = !this.details.aerobraking;
    this.update.emit();
  }

}
