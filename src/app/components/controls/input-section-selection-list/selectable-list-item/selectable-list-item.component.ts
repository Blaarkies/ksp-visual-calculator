import {
  Component,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { Option } from '../domain/option';

@Component({
  selector: 'cp-selectable-list-item',
  standalone: true,
  imports: [CommonModule, MatRippleModule, MatListModule, MatCheckboxModule],
  templateUrl: './selectable-list-item.component.html',
  styleUrls: ['./selectable-list-item.component.scss']
})
export class SelectableListItemComponent {

  @Input() item: Option;

}
