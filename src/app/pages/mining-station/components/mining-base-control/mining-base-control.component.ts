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
import { WithDestroy } from '../../../../common/with-destroy';
import { InputNumberComponent } from '../../../../components/controls/input-number/input-number.component';
import { PlanetoidAssetDto } from '../../../../common/domain/dtos/planetoid-asset.dto';
import { MiningBaseService } from '../../services/mining-base.service';
import { EngineerSkillSelectorComponent } from '../engineer-skill-selector/engineer-skill-selector.component';
import { PlanetMoonSelectorComponent } from '../planet-moon-selector/planet-moon-selector.component';
import { ResourceProcessorsComponent } from '../resource-processors/resource-processors.component';

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

  selectedPlanet: PlanetoidAssetDto;
  controlOreConcentration: FormControl<number>;
  controlEngineerBonus: FormControl<number>;

  private stopControls$ = new Subject<void>();

  constructor(private miningBaseService: MiningBaseService) {
    super();
    this.setupValues();

    miningBaseService
      .loadState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.setupValues());
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.stopControls$.next();
    this.stopControls$.complete();
  }

  private setupValues() {
    this.selectedPlanet = this.miningBaseService.planet;

    let ore = this.miningBaseService.oreConcentration;
    let scaledValue = (ore * 100).round(2);
    this.controlOreConcentration = new FormControl<number>(scaledValue);
    this.controlOreConcentration
      .valueChanges
      .pipe(takeUntil(this.stopControls$))
      .subscribe(value => this.updateOreConcentration(value));

    let bonus = this.miningBaseService.engineerBonus;
    this.controlEngineerBonus = new FormControl<number>(bonus);
    this.controlEngineerBonus
      .valueChanges
      .pipe(takeUntil(this.stopControls$))
      .subscribe(value => this.updateEngineerBonus(value));
  }

  updatePlanet(value: PlanetoidAssetDto) {
    this.miningBaseService.updatePlanet(value);
  }

  updateOreConcentration(value: number) {
    this.miningBaseService.updateOreConcentration(value * .01);
  }

  updateEngineerBonus(value: number) {
    this.miningBaseService.updateEngineerBonus(value);
  }
}
