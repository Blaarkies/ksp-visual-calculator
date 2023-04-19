import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnDestroy,
} from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  Subject,
  takeUntil,
} from 'rxjs';
import { Group } from '../../../../common/domain/group';
import { WithDestroy } from '../../../../common/with-destroy';
import { InputNumberComponent } from '../../../../components/controls/input-number/input-number.component';
import { CelestialBody } from '../../../../services/json-interfaces/kerbol-system-characteristics';
import { converterSortMap } from '../../domain/converter-sort-map';
import { CraftPart } from '../../domain/craft-part';
import { MiningBaseService } from '../../services/mining-base.service';
import { PlanetMoonSelectorComponent } from '../planet-moon-selector/planet-moon-selector.component';
import { EngineerSkillSelectorComponent } from './engineer-skill-selector/engineer-skill-selector.component';
import { ResourceProcessorsComponent } from './resource-processors/resource-processors.component';

export class ControlItem<T, U> {
  label?: string;
  value?: T;
  control: FormControl<U>;
}

@Component({
  selector: 'cp-mining-base-control',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PlanetMoonSelectorComponent,
    InputNumberComponent,
    EngineerSkillSelectorComponent,
    ResourceProcessorsComponent,
  ],
  templateUrl: './mining-base-control.component.html',
  styleUrls: ['./mining-base-control.component.scss'],
})
export class MiningBaseControlComponent extends WithDestroy() implements OnDestroy {

  @Input() title = 'Environment';

  @Input() set craftPartGroups(groups: Group<CraftPart>[]) {
    this.converters = groups
      ? groups
        .map(g => g.item.converters ?? [])
        .flatMap()
        .map(c => c.converterName)
        .distinct()
        .sort((a, b) => converterSortMap.get(a) - converterSortMap.get(b))
      : [];
  }

  @Input() set oreConcentration(value: number) {
    this.stopOreControl$.next();

    this.controlOreConcentration = new FormControl<number>(value);
    this.controlOreConcentration.valueChanges
      .pipe(takeUntil(this.stopOreControl$))
      .subscribe(value => this.isruService.updateOreConcentration(value * .01)); // convert to percentage
  }

  @Input() set engineerBonus(value: number) {
    this.stopEngineerControl$.next();

    this.controlEngineerBonus = new FormControl<number>(value);
    this.controlEngineerBonus.valueChanges
      .pipe(takeUntil(this.stopEngineerControl$))
      .subscribe(value => this.isruService.updateEngineerBonus(value));
  }

  converters: string[];
  controlOreConcentration: FormControl<number>;
  controlEngineerBonus: FormControl<number>;

  private stopOreControl$ = new Subject<void>();
  private stopEngineerControl$ = new Subject<void>();

  constructor(private isruService: MiningBaseService) {
    super();
  }

  ngOnDestroy() {
    super.ngOnDestroy();

    this.stopOreControl$.next();
    this.stopOreControl$.complete();

    this.stopEngineerControl$.next();
    this.stopEngineerControl$.complete();
  }

  updatePlanet(body: CelestialBody) {
    this.isruService.updatePlanet(body);
  }

  updateConverters(activeConverters: string[]) {
    this.isruService.updateConverters(activeConverters);
  }

}
