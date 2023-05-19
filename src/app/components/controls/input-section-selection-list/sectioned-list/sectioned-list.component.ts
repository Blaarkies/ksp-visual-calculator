import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { BasicAnimations } from '../../../../animations/basic-animations';
import { Icons } from '../../../../common/domain/icons';
import { ExpandList } from '../domain/expand-list';
import { Option } from '../domain/option';
import { SelectableListItemComponent } from '../selectable-list-item/selectable-list-item.component';

@Component({
  selector: 'cp-sectioned-list',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatRippleModule,

    SelectableListItemComponent,
  ],
  templateUrl: './sectioned-list.component.html',
  styleUrls: ['./sectioned-list.component.scss'],
  animations: [BasicAnimations.height, BasicAnimations.flipVertical],
})
export class SectionedListComponent {

  @Input() visible = false;
  @Input() sections: ExpandList[];

  @Output() selectItem = new EventEmitter<Option>();

  icons = Icons;

  trackByValue(index: number, item: Option): Option['value'] {
    return item.value;
  }

}
