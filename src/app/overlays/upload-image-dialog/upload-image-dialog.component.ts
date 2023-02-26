import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { Icons } from '../../common/domain/icons';
import { BasicAnimations } from '../../common/animations/basic-animations';
import {
  FormArray,
  FormControl,
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormControl,
  Validators
} from '@angular/forms';
import {MatStepper, MatStepperModule} from '@angular/material/stepper';
import {CommonModule} from "@angular/common";
import {MatDialogModule} from "@angular/material/dialog";
import {MatTooltipModule} from "@angular/material/tooltip";
import {FileDropDirective} from "../../directives/file-drop.directive";
import {MatIconModule} from "@angular/material/icon";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {ImageCropperModule} from "ngx-image-cropper";
import {MatButtonModule} from "@angular/material/button";

export class UploadImageDialogData {

}

@Component({
  selector: 'cp-upload-image',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatStepperModule,
    ReactiveFormsModule,
    MatTooltipModule,
    FileDropDirective,
    MatIconModule,
    MatProgressBarModule,
    ImageCropperModule,
    MatButtonModule,
  ],
  templateUrl: './upload-image-dialog.component.html',
  styleUrls: ['./upload-image-dialog.component.scss'],
  animations: [BasicAnimations.fade],
})
export class UploadImageDialogComponent {

  buttonLoaders = {
    import$: new Subject<boolean>(),
  };
  icons = Icons;

  controlSelect = new FormControl<string>(null, [Validators.required]);
  controlCrop = new FormControl<string>(null, [Validators.required]);

  formArrayStepper = new FormArray([
    this.controlSelect,
    this.controlCrop,
  ]);

  @ViewChild('fileUploadInput') fileUploadInput: ElementRef<HTMLInputElement>;
  @ViewChild('stepper') stepper: MatStepper;

  constructor(private snackBar: MatSnackBar) {
  }

  async importFile(files: any) {
    if (files.length === 1) {
      this.buttonLoaders.import$.next(true);

      const file: File = files[0];
      const reader = new FileReader();

      reader.addEventListener('load', event => {
        let imageData = event.target.result as string;

        this.controlSelect.setValue(imageData);
        this.stepper.steps.get(1).select();

        this.buttonLoaders.import$.next(false);
      });

      reader.readAsDataURL(file);
    }
  }

  async uploadFileSelected(event: any) {
    await this.importFile(event.target.files);
  }

  loadImageFailed() {
    this.snackBar.open('Could not load image. Please try a different file/format');
  }

}
