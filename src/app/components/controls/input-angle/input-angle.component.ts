import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  EventEmitter,
  forwardRef,
  Injector,
  Input,
  OnInit,
  Output,
  Signal,
  signal,
  ViewChild,
} from '@angular/core';
import {
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';
import {
  FormControl,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  finalize,
  fromEvent,
  map,
  mergeWith,
  startWith,
  Subject,
  takeUntil,
  takeWhile,
  throttleTime,
} from 'rxjs';
import { BasicAnimations } from '../../../animations/basic-animations';
import {
  degreesToRadians,
  radiansToDegrees,
} from '../../../common/common';
import { BasicValueAccessor } from '../../../common/domain/input-fields/basic-value-accessor';
import { FormControlError } from '../../../common/domain/input-fields/form-control-error';
import { Vector2 } from '../../../common/domain/vector2';
import {
  CpColors,
  InputFieldComponent,
} from '../input-field/input-field.component';
import { ValidationMessageComponent } from '../validation-message/validation-message.component';

@Component({
  selector: 'cp-input-angle',
  standalone: true,
  imports: [InputFieldComponent, ValidationMessageComponent, AsyncPipe, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, NgIf],
  templateUrl: './input-angle.component.html',
  styleUrls: ['./input-angle.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputAngleComponent),
    multi: true,
  }],
  animations: [BasicAnimations.fade],
})
export class InputAngleComponent extends BasicValueAccessor implements OnInit {

  @Input() color: CpColors = 'primary';
  @Input() label: string;
  @Input() hint: string;
  @Input({transform: (s: string) => '°' + s}) suffix = '°';
  @Input() errors: FormControlError;

  @Input() set formControl(value: FormControl<number>) {
    this.setDisabledState(value?.disabled);
  }

  @Output() output = new EventEmitter<number>();

  @ViewChild('input', {static: true})
  private inputRef: ElementRef<HTMLInputElement>;

  @ViewChild('dragContainer', {static: true})
  private dragContainerRef: ElementRef<HTMLDivElement>;

  angleSig = signal(0);
  pathSig = computed(() => this.calculatePath(this.angleSig()));
  isGrabbingSig = signal(false);

  private stopDrag$ = new Subject<void>();

  inputFocusedSig: Signal<boolean>;
  dialFocusedSig: Signal<boolean>;
  componentFocusedSig: Signal<boolean>;

  constructor(
    private self: ElementRef,
    private destroyRef: DestroyRef,
    private document: Document,
    private injector: Injector,
  ) {
    super();

    destroyRef.onDestroy(() => this.stopDrag$.complete());
  }

  ngOnInit() {
    let input = this.inputRef.nativeElement;
    this.inputFocusedSig = toSignal(
      fromEvent(input, 'focus').pipe(
        map(() => true),
        mergeWith(
          fromEvent(input, 'blur').pipe(map(() => false))),
      ), {injector: this.injector});

    let dial = this.dragContainerRef.nativeElement;
    this.dialFocusedSig = toSignal(
      fromEvent(dial, 'focus').pipe(
        map(() => true),
        mergeWith(
          fromEvent(dial, 'blur').pipe(map(() => false))),
      ), {injector: this.injector});

    this.componentFocusedSig = computed(() => this.inputFocusedSig() || this.isGrabbingSig());
  }

  writeValue(value: number) {
    this.value = value;
    if (!value) {
      return;
    }
    this.angleSig.set(-value);
    this.inputRef.nativeElement.value = (value.toInt())?.toString();
  }

  registerOnChange(fn: (value: any) => any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => any) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
    this.inputRef.nativeElement.disabled = isDisabled;

    this.self.nativeElement.style.pointerEvents = isDisabled ? 'none' : 'auto';
  }

  userChange(value: number) {
    this.writeValue(value);
    this.onChange?.(value);
    this.output.emit(value);
  }

  userDialChange(value: number) {
    this.userChange(value);
  }

  userInputChange(value: string) {
    let safeValue = value.toNumber();
    if (safeValue.isNaN()) {
      return;
    }
    let modulated = safeValue % 360;
    let normalized = modulated < 0 ? modulated + 360 : modulated;
    this.angleSig.set(-normalized);
    this.userChange(normalized);
  }

  focus() {
    if (this.disabled) {
      return;
    }
    this.inputRef.nativeElement.focus();
  }

  dragHand(event: PointerEvent, container: HTMLDivElement) {
    if (this.disabled) {
      return;
    }
    this.stopDrag$.next();
    let viewport = this.document.body;
    let target = event.target as HTMLElement;
    this.isGrabbingSig.set(true);
    viewport.style.setProperty('cursor', 'grabbing', 'important');
    target.style.setProperty('cursor', 'grabbing', 'important');

    let bRect = container.getBoundingClientRect();
    let centerOffset = new Vector2(bRect.width, bRect.height)
      .multiply(.5);
    let center = new Vector2(bRect.x, bRect.y)
      .addVector2(centerOffset);

    fromEvent(viewport, 'pointermove').pipe(
      throttleTime(17),
      takeWhile((m: PointerEvent) =>
        (m.pointerType === 'mouse' && m.buttons.bitwiseIncludes(1))
        || (m.pointerType !== 'mouse')),
      map((m: PointerEvent) => new Vector2(m.pageX, m.pageY)),
      startWith(new Vector2(event.pageX, event.pageY)),
      map(l => -radiansToDegrees(center.direction(l)).toInt()),
      map(a => a < 0 ? a + 360 : a),
      finalize(() => {
        this.isGrabbingSig.set(false);
        viewport.style.removeProperty('cursor');
        target.style.removeProperty('cursor');
      }),
      takeUntil(this.stopDrag$),
      takeUntil(fromEvent(target, 'pointerup')),
      takeUntil(fromEvent(viewport, 'pointerup')),
      takeUntilDestroyed(this.destroyRef))
      .subscribe((angle: number) => {
        this.angleSig.set(-angle);
        this.userDialChange(angle);
      });
  }

  private calculatePath(endAngle: number) {
    let largeArc = endAngle
      .let(it => it < 0 ? it + 360 : it)
      .between(180, 360) ? '0' : '1';

    let offset = 20;
    let r = 9;
    let endDeg = degreesToRadians(endAngle);

    let x1 = offset + r * Math.cos(0);
    let y1 = offset + r * Math.sin(0);
    let x2 = offset + r * Math.cos(endDeg);
    let y2 = offset + r * Math.sin(endDeg);

    return `M${x1},${y1} A${r},${r} 0 ${largeArc},0 ${x2},${y2}`;
  }

}
