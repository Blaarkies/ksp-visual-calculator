import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  combineLatest,
  delay,
  EMPTY,
  filter,
  map,
  Observable,
  Subject,
  switchMap,
} from 'rxjs';
import { BasicAnimations } from '../../animations/basic-animations';
import { Icons } from '../../common/domain/icons';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { NegatePipe } from '../../common/negate.pipe';
import { DoublePointerActionDirective } from '../../directives/double-pointer-action.directive';
import { MouseHoverDirective } from '../../directives/mouse-hover.directive';
import { CameraService } from '../../services/camera.service';

@Component({
  selector: 'cp-draggable-space-object',
  standalone: true,
  imports: [
    CommonModule,
    MouseHoverDirective,
    DoublePointerActionDirective,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    NegatePipe,
  ],
  templateUrl: './draggable-space-object.component.html',
  styleUrls: ['./draggable-space-object.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [BasicAnimations.fade],
})
export class DraggableSpaceObjectComponent implements OnInit {

  @Input() spaceObject: SpaceObject;
  @Input() showEdit: boolean;

  @Output() dragSpaceObject = new EventEmitter<PointerEvent>();
  @Output() focusObject = new EventEmitter<PointerEvent>();
  @Output() editSpaceObject = new EventEmitter<void>();

  normalizedScale = 100 * CameraService.normalizedScale;
  icons = Icons;

  buttonHover$ = new Subject<boolean>();
  triggerEdit$ = new Subject<void>();
  showEdit$: Observable<boolean>;
  isIdle$: Observable<boolean>;

  constructor(cameraService: CameraService, private destroyRef: DestroyRef) {
    // set this object as the focal point to CameraService.zoomAt()
    this.buttonHover$.pipe(
      filter(hoverOn => {
        let mustSetNewObject = !cameraService.currentHoverObject || hoverOn;
        let mustRemoveSelf = cameraService.currentHoverObject === this.spaceObject.draggable && !hoverOn;
        return mustSetNewObject || mustRemoveSelf;
      }),
      takeUntilDestroyed())
      .subscribe(hoverOn => cameraService.currentHoverObject = hoverOn ? this.spaceObject.draggable : null);

    destroyRef.onDestroy(() => {
      this.buttonHover$.next(false);
      this.buttonHover$.complete();
      this.triggerEdit$.complete();
    });
  }

  ngOnInit() {
    this.isIdle$ = this.spaceObject.draggable.isGrabbing$.stream$
      .pipe(map(grabbed => !grabbed));

    this.showEdit$ = combineLatest([
      this.buttonHover$,
      this.isIdle$,
    ]).pipe(
      map(([hovered, idled]) => this.showEdit && hovered && idled));

    this.showEdit$.pipe(
      delay(300), // prevents accidental clicks/taps on the transparent button
      switchMap(allow => allow ? this.triggerEdit$ : EMPTY),
      takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.editSpaceObject.emit());
  }

  handleHover(isHover: boolean) {
    this.buttonHover$.next(isHover);
    this.spaceObject.draggable.isHover$.next(isHover);
  }

}
