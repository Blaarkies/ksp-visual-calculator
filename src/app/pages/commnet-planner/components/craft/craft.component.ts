import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BasicAnimations } from '../../../../animations/basic-animations';
import { Icons } from '../../../../common/domain/icons';
import { Craft } from '../../../../common/domain/space-objects/craft';
import { NegatePipe } from '../../../../common/negate.pipe';
import { DraggableSpaceObjectComponent } from '../../../../components/draggable-space-object/draggable-space-object.component';

@Component({
  selector: 'cp-craft',
  standalone: true,
  imports: [CommonModule, DraggableSpaceObjectComponent, MatIconModule, MatTooltipModule, NegatePipe],
  templateUrl: './craft.component.html',
  styleUrls: ['./craft.component.scss'],
  animations: [BasicAnimations.fade],
})
export class CraftComponent {

  @Input() craft: Craft;

  @Output() dragStart = new EventEmitter<PointerEvent>();
  @Output() focus = new EventEmitter<PointerEvent>();
  @Output() edit = new EventEmitter();

  icons = Icons;

}
