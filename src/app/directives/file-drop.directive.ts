import { Directive, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Directive({
  selector: '[cpFileDrop]',
})
export class FileDropDirective {

  @Input() fileTypeWhitelist: string[];

  @Output() fileDrop = new EventEmitter<any>();

  private mimeStringMap = {
    'application/json': 'JSON',
  };

  constructor(private snackBar: MatSnackBar) {
  }

  // tslint:disable:no-unused-variable
  @HostBinding('class.file-drop') private classMain = true;
  @HostBinding('class.file-drop-over') private classOver = false;
  @HostBinding('class.file-drop-leave') private classLeave = false;
  @HostBinding('class.file-drop-event') private classEvent = false;

  @HostListener('dragover', ['$event'])
  private onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.classOver = true;
    this.classLeave = false;
    this.classEvent = false;
  }

  @HostListener('dragleave', ['$event'])
  private onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.classOver = false;
    this.classLeave = true;
    this.classEvent = false;
    setTimeout(() => this.classLeave = false, 300);
  }

  @HostListener('drop', ['$event'])
  private onDrop(event: DragEvent) {
    this.classEvent = false;
    this.classOver = false;
    this.classLeave = false;

    event.preventDefault();
    event.stopPropagation();

    let files = event.dataTransfer.files;
    let isValid = !this.fileTypeWhitelist
      || Array.from(files).every((f: File) => this.fileTypeWhitelist.includes(f.type));
    if (!isValid || files.length === 0) {
      this.classLeave = true;
      setTimeout(() => this.classLeave = false, 300);

      let allowedTypes = this.fileTypeWhitelist
        ?.map(w => this.mimeStringMap[w] ?? `"${w}"`)
        ?.join(', ');
      this.snackBar.open(allowedTypes
        ? `Only ${allowedTypes} files are allowed`
        : `No valid files detected`);
      return;
    }

    this.fileDrop.emit(files);

    this.classEvent = true;
  }

}
