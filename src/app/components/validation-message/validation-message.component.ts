import { Component, Input } from '@angular/core';
import { FormControlError } from '../../common/domain/input-fields/form-control-error';

export class ErrorMessageTranscriber {

  private static messageTypes = new Map<string, (name: string, meta: any) => string>([
    ['required', (name, meta) => `${name} is required`],
    ['min', (name, meta) => `${name} must be at least ${meta.min}`],
    ['max', (name, meta) => `${name} must be less than ${meta.max}`],
    ['maxlength', (name, meta) => `${name} must be shorter than ${meta.requiredLength} characters`],
    ['duplicateString', (name, meta) => `${name} must be unique`],
    ['email', (name, meta) => `${name} is not valid`],
  ]);

  getReadableMessage(fieldName: string, value: FormControlError): string {
    if (!value) {
      return;
    }

    let error = Object.entries(value).first();
    let errorType = error.first();
    let metaData = error.last();
    let converter = ErrorMessageTranscriber.messageTypes.get(errorType);
    if (!converter) {
      return `${fieldName} is not correct`;
    }

    return converter(fieldName, metaData);
  }

}

@Component({
  selector: 'cp-validation-message',
  templateUrl: './validation-message.component.html',
  styleUrls: ['./validation-message.component.scss'],
})
export class ValidationMessageComponent {

  @Input() fieldName = 'Field';

  @Input() set errors(value: FormControlError) {
    // todo: add proper styling
    this.message = this.errorMessageTranscriber.getReadableMessage(this.fieldName, value);
  }

  message: string;
  private errorMessageTranscriber = new ErrorMessageTranscriber();


}
