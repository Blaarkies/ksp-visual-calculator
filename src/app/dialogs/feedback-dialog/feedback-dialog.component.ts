import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormArray, FormControl, Validators } from '@angular/forms';
import { ControlMetaInput } from '../../common/domain/input-fields/control-meta-input';
import { InputFields } from '../../common/domain/input-fields/input-fields';
import { ControlMetaFreeText } from '../../common/domain/input-fields/control-meta-free-text';

export class FeedbackSubmissionForm {

  constructor(
    public name: string,
    public contact: string,
    public feedback: string) {
  }

}

@Component({
  selector: 'cp-feedback-dialog',
  templateUrl: './feedback-dialog.component.html',
  styleUrls: ['./feedback-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FeedbackDialogComponent {

  inputFields = {
    name: {
      label: 'Name (Optional)',
      control: new FormControl(),
      controlMeta: new ControlMetaInput(),
    },
    contact: {
      label: 'Contact Info (Optional)',
      control: new FormControl(),
      controlMeta: new ControlMetaInput(),
    },
    feedback: {
      label: 'Feedback Message',
      control: new FormControl(null, [Validators.required, Validators.maxLength(1000)]),
      controlMeta: new ControlMetaFreeText(),
    },
  } as InputFields;
  inputFieldsList = Object.values(this.inputFields);

  form = new FormArray(this.inputFieldsList.map(field => field.control));

  constructor(private dialogRef: MatDialogRef<FeedbackDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  submitFeedback() {
    let feedbackForm = new FeedbackSubmissionForm(
      this.inputFields.name.control.value,
      this.inputFields.contact.control.value,
      this.inputFields.feedback.control.value);
    this.dialogRef.close(feedbackForm);
  }
}
