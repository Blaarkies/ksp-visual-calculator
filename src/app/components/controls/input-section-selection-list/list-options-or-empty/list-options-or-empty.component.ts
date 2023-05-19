import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { BasicAnimations } from '../../../../animations/basic-animations';
import { Option } from '../domain/option';
import { SelectableListItemComponent } from '../selectable-list-item/selectable-list-item.component';

@Component({
  selector: 'cp-list-options-or-empty',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    SelectableListItemComponent,
  ],
  templateUrl: './list-options-or-empty.component.html',
  styleUrls: ['./list-options-or-empty.component.scss'],
  animations: [BasicAnimations.height],
})
export class ListOptionsOrEmptyComponent {

  @Input() list: Option[];

  @Output() selectItem = new EventEmitter<Option>();

  trackByValue(index: number, item: Option): Option['value'] {
    return item.value;
  }

}
