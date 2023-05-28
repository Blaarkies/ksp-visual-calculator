import { AnimationEvent } from '@angular/animations';
import { BreakpointObserver } from '@angular/cdk/layout';
import {
  Overlay,
  OverlayConfig,
  OverlayContainer,
  OverlayModule,
  OverlayRef,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnDestroy,
  Renderer2,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import {
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  distinctUntilChanged,
  filter,
  firstValueFrom,
  map,
  mergeWith,
  Observable,
  sampleTime,
  shareReplay,
  skip,
  Subject,
  take,
  takeUntil,
  timer,
} from 'rxjs';
import { BasicAnimations } from '../../../animations/basic-animations';
import { Common } from '../../../common/common';
import { Icons } from '../../../common/domain/icons';
import { BasicValueAccessor } from '../../../common/domain/input-fields/basic-value-accessor';
import { GlobalStyleClass } from '../../../common/global-style-class';
import { ExpandList } from './domain/expand-list';
import { Option } from './domain/option';
import { SelectionListComponent } from './selection-list/selection-list.component';

@Component({
  selector: 'cp-input-section-selection-list',
  standalone: true,
  imports: [
    CommonModule,
    OverlayModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,

    SelectionListComponent,
  ],
  templateUrl: './input-section-selection-list.component.html',
  styleUrls: ['./input-section-selection-list.component.scss'],
  animations: [
    BasicAnimations.width,
    BasicAnimations.height,
    BasicAnimations.flipVertical,
    BasicAnimations.fade,
    BasicAnimations.scaleY,
  ],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputSectionSelectionListComponent),
    multi: true,
  }],
})
export class InputSectionSelectionListComponent
  extends BasicValueAccessor<Option[]>
  implements AfterViewInit, OnDestroy {

  @Input() label: string;
  @Input() hint: string;
  @Input() clearable = false;
  @Input() preOpenSectionThreshold = 0;

  @Input() set sectionIcons(value: Map<string, string>) {
    if (!value) {
      this.iconsMap = null;
      return;
    }
    this.iconsMap = value;
    this.sections.forEach(s => s.icon = value.get(s.label));
  }

  @Input() set options(value: Option[]) {
    this.itemsList = value;
    this.checkSelectedItems();
    if (!value) {
      this.sections = [];
      return;
    }
    this.sections = this.createSections(value);
  }

  @ViewChild('input') input: ElementRef<HTMLInputElement>;
  @ViewChild('handset', {static: true}) handset: TemplateRef<any>;

  textFieldContainer: HTMLElement;
  minWidthPx: number;
  controlSearch = new FormControl('', {});
  sections: ExpandList[] = [];
  filtered$: Observable<Option[]>;
  positionLeftCenter = Common.createConnectionPair('↙', '↖');
  isOpenOverlay = false;
  isOpenDesktop = false;
  isOpenHandsetOverlay = false;
  icons = Icons;
  isHandset$: Observable<boolean>;
  overlayRef: OverlayRef;
  stopCurrentOverlayRef$ = new Subject<void>();
  handsetAnimationDone$ = new Subject<void>();

  private get isAnyMenuOpen(): boolean {
    return this.isOpenDesktop || this.isOpenOverlay || this.isOpenHandsetOverlay;
  }

  private itemsList: Option[] = null;
  private iconsMap: Map<string, string>;
  private destroy$ = new Subject<void>();
  private unsubscribeClickTextField: () => void;

  constructor(private renderer: Renderer2,
              breakpointObserver: BreakpointObserver,
              private overlay: Overlay,
              private overlayContainer: OverlayContainer,
              private viewContainerRef: ViewContainerRef) {
    super();

    this.isHandset$ = breakpointObserver.observe([
      '(max-width: 600px)',
      '(max-height: 800px)',
    ]).pipe(map(bp => bp.matches));

    let searchQuery$ = this.controlSearch
      .valueChanges
      .pipe(
        skip(1),
        filter(() => this.isAnyMenuOpen),
        sampleTime(300),
        shareReplay(1));

    this.filtered$ = searchQuery$
      .pipe(
        distinctUntilChanged(),
        map(query => !query
          ? null
          : this.itemsList.sortByRelevance(item =>
            item.label.relevanceScore(query), 1)));
  }

  ngAfterViewInit() {
    this.setClickListenerOnTextField();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopCurrentOverlayRef$.next();
    this.stopCurrentOverlayRef$.complete();
    this.unsubscribeClickTextField();
  }

  writeValue(value: Option[]) {
    this.value = value;
    this.checkSelectedItems();
  }

  private checkSelectedItems() {
    let selectionList = this.value?.map(o => o.value);
    this.itemsList
      ?.forEach(item => {
        let isSelectedItem = selectionList?.includes(item.value);
        item.checked = isSelectedItem;
      });
  }

  registerOnChange(fn: (value: Option[]) => Option[]) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
    isDisabled ? this.controlSearch.disable() : this.controlSearch.enable();
  }

  userInputChange(option: Option) {
    option.checked = !option.checked;

    let newValue = this.itemsList.filter(item => item.checked);

    this.writeValue(newValue);
    this.onChange && this.onChange(newValue);
  }

  close(event: MouseEvent) {
    let pathInsideTextField = event
      .composedPath()
      .includes(this.textFieldContainer);
    if (pathInsideTextField || !this.isAnyMenuOpen) {
      // clicking the text field should not close the menu
      return;
    }
    this.isOpenDesktop = false;
  }

  closeOverlay(event: AnimationEvent) {
    if (event.toState.toString() === 'false') {
      this.isOpenOverlay = false;
    }
  }

  /** Access outline element of <mat-form-field> to apply (click)="open()" */
  private setClickListenerOnTextField() {
    this.textFieldContainer = this.input.nativeElement.closest('div.mdc-text-field');

    let elementToListen: HTMLElement = !this.textFieldContainer
      ? this.input.nativeElement
      : this.textFieldContainer;

    this.unsubscribeClickTextField = this.renderer
      .listen(elementToListen, 'click', (e: PointerEvent) => {
        if (!e.pointerType) {
          return;
        }
        this.open();
      });

    this.minWidthPx = this.textFieldContainer.clientWidth;
  }

  private async open() {
    if (this.isAnyMenuOpen) {
      return;
    }

    let isTiny = await firstValueFrom(this.isHandset$);
    if (!isTiny) {
      this.isOpenOverlay = true;
      this.isOpenDesktop = true;
      return;
    } else {
      this.openHandsetMenu();
    }
  }

  private openHandsetMenu() {
    if (this.overlayRef) {
      this.disposeOverlay();
      return;
    }

    const overlayConfig = new OverlayConfig({
      hasBackdrop: true,
      panelClass: [GlobalStyleClass.fullscreenPanelClass],
    });

    this.overlayRef = this.overlay.create(overlayConfig);
    let templatePortal = new TemplatePortal(this.handset, this.viewContainerRef);
    this.overlayRef.attach(templatePortal);

    this.stopCurrentOverlayRef$.next();
    this.overlayRef
      .backdropClick()
      .pipe(takeUntil(this.stopCurrentOverlayRef$))
      .subscribe(() => this.disposeOverlay());
    this.isOpenHandsetOverlay = true;

    setTimeout(() => {
      this.overlayRef.overlayElement.querySelector('input').focus();
    });
  }

  private disposeOverlay() {
    this.controlSearch.setValue('');
    this.closeAll();
    this.handsetAnimationDone$
      .pipe(
        mergeWith(timer(500)),
        take(1),
        takeUntil(this.stopCurrentOverlayRef$))
      .subscribe(() => {
        this.overlayRef?.dispose();
        this.overlayRef = null;
      });
  }

  private closeAll() {
    this.isOpenDesktop = false;
    this.isOpenOverlay = false;
    this.isOpenHandsetOverlay = false;
  }

  private createSections(value: Option[]): ExpandList[] {
    let entries = value
      .reduce<Map<string, Option[]>>((sum, c) => {
        let category = sum.get(c.section) ?? [];
        category.push(c);
        sum.set(c.section, category);
        return sum;
      }, new Map())
      .entries();
    return Array.from(entries)
      .map(([k, v]) => new ExpandList(
        k,
        v,
        v.length <= this.preOpenSectionThreshold,
        this.iconsMap?.get(k)));
  }

}
