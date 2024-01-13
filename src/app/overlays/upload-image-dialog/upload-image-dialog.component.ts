import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatStepper,
  MatStepperModule,
} from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ImageCroppedEvent,
  ImageCropperModule,
} from 'ngx-image-cropper';
import {
  finalize,
  fromEvent,
  Subject,
  take,
} from 'rxjs';
import { BasicAnimations } from '../../animations/basic-animations';
import { Icons } from '../../common/domain/icons';
import { FileDropDirective } from '../../directives/file-drop.directive';

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
  @ViewChild(FileDropDirective) importer: FileDropDirective;

  constructor(private snackBar: MatSnackBar, private destroyRef: DestroyRef) {
  }

  async importFile(files: any) {
    if (files.length === 1) {
      this.buttonLoaders.import$.next(true);

      const file: File = files[0];
      const reader = new FileReader();

      fromEvent(reader, 'load').pipe(
        finalize(() => {
          this.buttonLoaders.import$.next(false);
          this.importer.showSuccess();
        }),
        take(1),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe((event: ProgressEvent<FileReader>) => {
        let imageData = event.target.result as string;

        this.controlSelect.setValue(imageData);
        this.stepper.steps.get(1).select();
      });

      reader.readAsDataURL(file);
    }
  }

  async uploadFileSelected(event: Event & {target: {files: unknown}}) {
    await this.importFile(event.target.files);
  }

  loadImageFailed() {
    this.snackBar.open('Could not load image. Please try a different file/format');
  }

  updateCrop(event: ImageCroppedEvent) {
    this.controlCrop.setValue(event.base64);
  }
}
