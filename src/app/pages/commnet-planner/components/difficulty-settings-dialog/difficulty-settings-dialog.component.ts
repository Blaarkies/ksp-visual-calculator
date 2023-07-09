import { CommonModule } from '@angular/common';
import {
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatButtonToggleGroup,
  MatButtonToggleModule,
} from '@angular/material/button-toggle';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { takeUntil } from 'rxjs';
import { ControlMetaNumber } from '../../../../common/domain/input-fields/control-meta-number';
import { InputFields } from '../../../../common/domain/input-fields/input-fields';
import { WithDestroy } from '../../../../common/with-destroy';
import { InputFieldListComponent } from '../../../../components/controls/input-field-list/input-field-list.component';
import { DifficultySetting } from './difficulty-setting';

@Component({
  selector: 'cp-difficulty-settings-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonToggleModule,
    InputFieldListComponent,
    MatTooltipModule,
    MatButtonModule,
  ],
  templateUrl: './difficulty-settings-dialog.component.html',
  styleUrls: ['./difficulty-settings-dialog.component.scss'],
})
export class DifficultySettingsDialogComponent extends WithDestroy() implements OnInit {

  @ViewChild(MatButtonToggleGroup, {static: true}) buttonGroup: MatButtonToggleGroup;

  difficultySettings = DifficultySetting;

  inputFields = {
    rangeModifier: {
      label: 'Range Modifier',
      control: new FormControl<number>(this.data.rangeModifier ?? 1, [
        Validators.required,
        Validators.min(.1),
        Validators.max(100)]),
      controlMeta: new ControlMetaNumber(0.1, 100, 5, 'x',
        'Multiplier applied to antenna strengths'),
    },
    dsnModifier: {
      label: 'DSN Modifier',
      control: new FormControl<number>(this.data.dsnModifier ?? 1, [
        Validators.required,
        Validators.min(0),
        Validators.max(100)]),
      controlMeta: new ControlMetaNumber(0, 100, 5, 'x',
        'Multiplier applied to the strength of the DSN'),
    },
  } as InputFields;
  inputFieldsList = Object.values(this.inputFields);

  form = new FormArray(this.inputFieldsList.map(field => field.control));

  constructor(private dialogRef: MatDialogRef<DifficultySettingsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DifficultySetting) {
    super();
    // Unselect buttonGroup toggle, because a form.valueChanges means this is now a custom difficulty
    this.form
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.buttonGroup.writeValue(null));
  }

  ngOnInit() {
    let match = DifficultySetting.matchObject(this.data);
    if (!match) {
      return;
    }
    this.buttonGroup.writeValue(match);
  }

  submitDetails() {
    let details = this.buttonGroup.value
      ?? new DifficultySetting(
        'Custom',
        this.inputFields.rangeModifier.control.value,
        this.inputFields.dsnModifier.control.value);

    this.dialogRef.close(details);
  }

  buttonGroupChange(value: DifficultySetting) {
    this.inputFields.rangeModifier.control.setValue(value.rangeModifier, {emitEvent: false});
    this.inputFields.dsnModifier.control.setValue(value.dsnModifier, {emitEvent: false});
  }
}
