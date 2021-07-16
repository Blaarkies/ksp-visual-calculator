import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormArray, FormControl, Validators } from '@angular/forms';
import { InputFields } from '../../common/domain/input-fields/input-fields';
import { ControlMetaNumber } from '../../common/domain/input-fields/control-meta-number';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { DifficultySetting } from './difficulty-setting';
import { WithDestroy } from '../../common/with-destroy';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'cp-difficulty-settings-dialog',
  templateUrl: './difficulty-settings-dialog.component.html',
  styleUrls: ['./difficulty-settings-dialog.component.scss'],
})
export class DifficultySettingsDialogComponent extends WithDestroy() implements OnInit {

  @ViewChild(MatButtonToggleGroup, {static: true}) buttonGroup: MatButtonToggleGroup;

  difficultySettings = DifficultySetting;

  inputFields = {
    rangeModifier: {
      label: 'Range Modifier',
      control: new FormControl(this.data.rangeModifier ?? 1, [Validators.required, Validators.min(.1), Validators.max(100)]),
      controlMeta: new ControlMetaNumber('x', 'Multiplier applied to antenna strengths'),
    },
    dsnModifier: {
      label: 'DSN Modifier',
      control: new FormControl(this.data.dsnModifier ?? 1, [Validators.required, Validators.min(0), Validators.max(100)]),
      controlMeta: new ControlMetaNumber('x', 'Multiplier applied to the strength of the DSN'),
    },
  } as InputFields;
  inputFieldsList = Object.values(this.inputFields);

  form = new FormArray(this.inputFieldsList.map(field => field.control));

  constructor(private dialogRef: MatDialogRef<DifficultySettingsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DifficultySetting) {
    super();
    // Unselect buttonGroup toggle, because a form.valueChanges means this is now a custom difficulty
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.buttonGroup.writeValue(null));
  }

  ngOnInit() {
    this.buttonGroup.writeValue(this.data);
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
