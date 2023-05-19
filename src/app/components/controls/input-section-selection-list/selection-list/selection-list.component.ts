import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { ExpandList } from '../domain/expand-list';
import { Option } from '../domain/option';
import { ListOptionsOrEmptyComponent } from '../list-options-or-empty/list-options-or-empty.component';
import { SectionedListComponent } from '../sectioned-list/sectioned-list.component';

@Component({
  selector: 'cp-selection-list',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    ReactiveFormsModule,

    ListOptionsOrEmptyComponent,
    SectionedListComponent,
  ],
  templateUrl: './selection-list.component.html',
  styleUrls: ['./selection-list.component.scss'],
})
export class SelectionListComponent {

  @Input() minWidthPx = 200;
  @Input() filtered: Option[] = null;
  @Input() sections: ExpandList[];

  @Output() selectItem = new EventEmitter<Option>();

}
