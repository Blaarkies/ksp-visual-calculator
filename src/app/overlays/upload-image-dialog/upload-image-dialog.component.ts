import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { Icons } from '../../common/domain/icons';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { FormArray, FormControl, Validators } from '@angular/forms';
import { MatHorizontalStepper } from '@angular/material/stepper';

export class UploadImageDialogData {

}

@Component({
  selector: 'cp-upload-image',
  templateUrl: './upload-image-dialog.component.html',
  styleUrls: ['./upload-image-dialog.component.scss'],
  animations: [CustomAnimation.fade],
})
export class UploadImageDialogComponent {

  buttonLoaders = {
    import$: new Subject<boolean>(),
  };
  icons = Icons;

  controlSelect = new FormControl(null, [Validators.required]);
  controlCrop = new FormControl(null, [Validators.required]);

  formArrayStepper = new FormArray([
    this.controlSelect,
    this.controlCrop,
  ]);

  @ViewChild('fileUploadInput') fileUploadInput: ElementRef<HTMLInputElement>;
  @ViewChild('stepper') stepper: MatHorizontalStepper;

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
