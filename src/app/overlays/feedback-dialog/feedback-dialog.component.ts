import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { BasicAnimations } from '../../animations/basic-animations';
import { ControlMetaFreeText } from '../../common/domain/input-fields/control-meta-free-text';
import { ControlMetaInput } from '../../common/domain/input-fields/control-meta-input';
import { InputFields } from '../../common/domain/input-fields/input-fields';
import { WithDestroy } from '../../common/with-destroy';
import { InputFieldListComponent } from '../../components/controls/input-field-list/input-field-list.component';

export class FeedbackSubmissionForm {
  name: string;
  contact: string;
  feedback: string;
}

@Component({
  selector: 'cp-feedback-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    InputFieldListComponent,
    MatProgressBarModule,
    MatButtonModule,
  ],
  templateUrl: './feedback-dialog.component.html',
  styleUrls: ['./feedback-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [BasicAnimations.height],
})
export class FeedbackDialogComponent extends WithDestroy() {

  inputFields = {
    name: {
      label: 'Name (Optional)',
      control: new FormControl<string>(null),
      controlMeta: new ControlMetaInput(),
    },
    contact: {
      label: 'Contact Info (Optional)',
      control: new FormControl<string>(null),
      controlMeta: new ControlMetaInput('text'),
    },
    feedback: {
      label: 'Feedback Message',
      control: new FormControl<string>(null, [Validators.required, Validators.maxLength(1000)]),
      controlMeta: new ControlMetaFreeText(),
    },
  } as InputFields;
  inputFieldsList = Object.values(this.inputFields);

  form = new FormArray(this.inputFieldsList.map(field => field.control));

  feedbackState: 'nothing' | 'waiting' | 'success' | 'failed' = 'nothing';

  constructor(private snackBar: MatSnackBar,
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
