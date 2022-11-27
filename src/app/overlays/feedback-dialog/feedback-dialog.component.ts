import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormArray, FormControl, Validators } from '@angular/forms';
import { ControlMetaInput } from '../../common/domain/input-fields/control-meta-input';
import { InputFields } from '../../common/domain/input-fields/input-fields';
import { ControlMetaFreeText } from '../../common/domain/input-fields/control-meta-free-text';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WithDestroy } from '../../common/with-destroy';
import { HttpClient } from '@angular/common/http';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { firstValueFrom } from 'rxjs';

export class FeedbackSubmissionForm {
  name: string;
  contact: string;
  feedback: string;
}

@Component({
  selector: 'cp-feedback-dialog',
  templateUrl: './feedback-dialog.component.html',
  styleUrls: ['./feedback-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [CustomAnimation.height],
})
export class FeedbackDialogComponent extends WithDestroy() {

  inputFields = {
    name: {
      label: 'Name (Optional)',
      control: new FormControl(),
      controlMeta: new ControlMetaInput(),
    },
    contact: {
      label: 'Contact Info (Optional)',
      control: new FormControl(),
      controlMeta: new ControlMetaInput('text', 'If the feedback needs follow-up, I will try to contact you using this detail'),
    },
    feedback: {
      label: 'Feedback Message',
      control: new FormControl(null, [Validators.required, Validators.maxLength(1000)]),
      controlMeta: new ControlMetaFreeText(),
    },
  } as InputFields;
  inputFieldsList = Object.values(this.inputFields);

  form = new FormArray(this.inputFieldsList.map(field => field.control));

  feedbackState: 'nothing' | 'waiting' | 'success' | 'failed' = 'nothing';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private snackBar: MatSnackBar,
              private http: HttpClient) {
    super();
  }

  async submitFeedback() {
    let feedbackForm: FeedbackSubmissionForm = {
      name: this.inputFields.name.control.value,
      contact: this.inputFields.contact.control.value,
      feedback: this.inputFields.feedback.control.value,
    };

    this.feedbackState = 'waiting';
    let success = await this.sendFeedback(feedbackForm);
    this.feedbackState = success === true ? 'success' : 'failed';

    if (success === true) {
      this.snackBar.open('Feedback has been submitted, thank you! I will try to reach out to you with the provided contact details.');
      this.form.reset();
    } else {
      this.snackBar.open('Could not submit feedback. Please try the GitHub link in the top-left (green) menu');
    }
  }

  /**
   * Calls functions/src/admin **captureFeedback** to save user feedback into firestore.
   * @param feedback Object
   */
  private async sendFeedback(feedback: FeedbackSubmissionForm): Promise<any> {
    let projectId = 'ksp-commnet-planner';
    let endpoint = 'captureFeedback';

    let httpResult$ = this.http
      .post(`https://us-central1-${projectId}.cloudfunctions.net/${endpoint}`,
        {...feedback});
    let result = await firstValueFrom(httpResult$)
      .catch(error => error.status === 200 ? true : error);

    return result;
  }
}
