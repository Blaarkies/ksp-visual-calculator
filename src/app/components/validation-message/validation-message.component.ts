import { Component, Input, OnInit } from '@angular/core';
import { FormControlError } from '../../common/domain/input-fields/form-control-error';

export class ErrorMessageTranscriber {

  private static messageTypes = new Map<string, (name: string, meta: any) => string>([
    ['required', (name, meta) => `${name} is required`],
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
      return 'No!';
    }

    return converter(fieldName, metaData);
  }

}

@Component({
  selector: 'cp-validation-message',
  templateUrl: './validation-message.component.html',
  styleUrls: ['./validation-message.component.scss'],
})
export class ValidationMessageComponent implements OnInit {

  @Input() fieldName = 'Field';

  @Input() set errors(value: FormControlError) {
    // todo:
    this.message = this.errorMessageTranscriber.getReadableMessage(this.fieldName, value);
  }

  message: string;
  private errorMessageTranscriber = new ErrorMessageTranscriber();

  constructor() {
  }

  ngOnInit(): void {
  }

}
