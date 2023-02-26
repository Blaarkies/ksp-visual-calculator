import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Icons } from '../../../common/domain/icons';
import {ReactiveFormsModule, UntypedFormControl} from '@angular/forms';
import { InputFieldComponent } from '../../../components/controls/input-field/input-field.component';
import { StateRow } from '../state-row';
import {CommonModule} from "@angular/common";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'cp-state-edit-name-row',
  standalone: true,
  imports: [
    CommonModule,
    InputFieldComponent,
    ReactiveFormsModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './state-edit-name-row.component.html',
  styleUrls: ['./state-edit-name-row.component.scss'],
})
export class StateEditNameRowComponent {

  @Input() state: StateRow;
  @Input() control: UntypedFormControl;

  @ViewChild(InputFieldComponent, {static: false}) inputField: InputFieldComponent;

  @Output() editStart = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{ oldName, state }>();

  icons = Icons;
  isEditMode: boolean;

  startEdit(state: StateRow) {
    this.editStart.emit();

    this.isEditMode = true;
    this.control.setValue(state.name);
    setTimeout(() => this.inputField.focus());
  }

  confirmEdit(state: StateRow) {
    this.isEditMode = false;

    if (state.name.like(this.control.value)) {
      return;
    }

    let oldName = state.name;
    state.name = this.control.value;
    this.confirm.emit({oldName, state});
  }

  cancelEdit() {
    this.isEditMode = false;
  }

}
