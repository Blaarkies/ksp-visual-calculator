import {
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  fromEvent,
  takeUntil,
} from 'rxjs';
import { WithDestroy } from '../common/with-destroy';

@Directive({
  selector: '[cpFileDrop]',
  standalone: true,
})
export class FileDropDirective extends WithDestroy() {

  @Input() fileTypeWhitelist: string[];

  @Output() fileDrop = new EventEmitter<any>();

  private mimeStringMap = {
    'application/json': 'JSON',
  };

  constructor(private snackBar: MatSnackBar,
              private self: ElementRef) {
    super();
  }

  // tslint:disable:no-unused-variable
  @HostBinding('class.file-drop') private classMain = true;
  @HostBinding('class.file-drop-over') private classOver = false;
  @HostBinding('class.file-drop-leave') private classLeave = false;
  @HostBinding('class.file-drop-event') private classEvent = false;
  @HostBinding('class.file-drop-error') private classError = false;

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
  }

  showSuccess() {
    this.classEvent = true;
  }

  showError() {
    this.classError = true;

    let target: HTMLElement = this.self.nativeElement;
    fromEvent(target, 'animationEnd')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.classError = false;
        target
          .getAnimations()
          .forEach((a: Animation) => a.cancel());
      });

    target.animate(
      [
        {offset: 0, translate: '0'},
        {offset: .3, translate: '5px'},
        {offset: 1, translate: '-5px'},
      ],
      {
        duration: 200,
        iterations: 3,
        direction: 'alternate-reverse',
        easing: 'ease-in-out',
      },
    );
  }

}
