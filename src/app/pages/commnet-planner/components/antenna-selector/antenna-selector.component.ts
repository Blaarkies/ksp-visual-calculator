import { CommonModule } from '@angular/common';
import {
  Component,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  UntypedFormControl,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  Subject,
  takeUntil,
} from 'rxjs';
import { BasicAnimations } from '../../../../animations/basic-animations';
import { Antenna } from '../../../../common/domain/antenna';
import { Group } from '../../../../common/domain/group';
import { Icons } from '../../../../common/domain/icons';
import { BasicValueAccessor } from '../../../../common/domain/input-fields/basic-value-accessor';
import { FormControlError } from '../../../../common/domain/input-fields/form-control-error';
import { LabeledOption } from '../../../../common/domain/input-fields/labeled-option';
import { InputFieldComponent } from '../../../../components/controls/input-field/input-field.component';
import { InputNumberComponent } from '../../../../components/controls/input-number/input-number.component';
import { InputSelectComponent } from '../../../../components/controls/input-select/input-select.component';
import { AntennaStatsComponent } from '../antenna-stats/antenna-stats.component';
import { AntennaInput } from './antenna-input';

@Component({
  selector: 'cp-antenna-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,

    InputFieldComponent,
    InputNumberComponent,
    InputSelectComponent,
    AntennaStatsComponent,
  ],
  templateUrl: './antenna-selector.component.html',
  styleUrls: ['./antenna-selector.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AntennaSelectorComponent),
    multi: true,
  }],
  animations: [BasicAnimations.height],
})
export class AntennaSelectorComponent extends BasicValueAccessor implements OnInit, OnDestroy {

  private selectionOptions: LabeledOption<Antenna>[];

  @Input() set options(value: LabeledOption<Antenna>[]) {
    let safeValue = value ?? [];
    this.selectionOptions = safeValue;
    this.refreshAvailableOptions();
    this.mapIcons = new Map<Antenna, string>(safeValue.map(a => [a.value, a.value.icon]));
  }

  @Input() label: string;
  @Input() errors: FormControlError;

  @ViewChild(AntennaStatsComponent, {static: true}) antennaStats: AntennaStatsComponent;

  isActive: boolean;
  icons = Icons;

  availableOptions: LabeledOption<Antenna>[];
  finalControl = new UntypedFormControl();
  antennaInputs: AntennaInput[] = [];
  mapIcons: Map<Antenna, string>;

  private unsubscribe$ = new Subject<void>();

  constructor() {
    super();
    this.finalControl.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((value: Antenna) => {
        this.antennaInputs.push(new AntennaInput(value));
        this.userInputChange();
        this.finalControl.reset(null, {emitEvent: false, onlySelf: true});
        this.refreshAvailableOptions();
      });
  }

  writeValue(value: Group<Antenna>[]) {
    this.value = value;
    if (!this.antennaInputs.length && value) {
      this.antennaInputs = value.map(({item, count}) => new AntennaInput(item, count));
      this.refreshAvailableOptions();
    }
    this.updateCollectionStats(this.antennaInputs);
  }

  registerOnChange(fn: (value: any) => any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => any) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
    this.antennaInputs
      .map(ai => ai.countControl)
      .forEach(control => isDisabled
        ? control.disable({emitEvent: false})
        : control.enable());
  }

  userInputChange() {
    this.updateCollectionStats(this.antennaInputs);
    let value = this.antennaInputs
      .map(({selectedAntenna, countControl}) => new Group(selectedAntenna, countControl.value));
    this.writeValue(value);
    this.onChange && this.onChange(value);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit() {
    this.refreshAvailableOptions();
  }

  private refreshAvailableOptions() {
    let queryableInputs = this.antennaInputs
      .map(ai => ({label: undefined, value: ai.selectedAntenna}));
    this.availableOptions = this.selectionOptions
      .except(queryableInputs, lo => lo.value);
  }

  removeAntenna(antennaInput: AntennaInput) {
    this.antennaInputs.remove(antennaInput);
    this.refreshAvailableOptions();
    this.userInputChange();
  }

  private updateCollectionStats(antennaInputs: AntennaInput[]) {
    this.antennaStats.updateStats(antennaInputs);
  }
}
