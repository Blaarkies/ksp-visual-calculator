import { Component } from '@angular/core';
import { AntennaInput } from '../antenna-selector/antenna-input';
import { Antenna } from '../../common/domain/antenna';
import { Group } from '../../common/domain/group';
import { LabeledOption } from '../../common/domain/input-fields/labeled-option';

export interface AntennaStats {
  totalPowerRating: number
  totalCost: number
  totalMass: number
  totalElectricityPMit: number
  totalElectricityPS: number
  totalTransmissionSpeed: number
  relayBias: number
  averageCombinabilityExponent: number
}

@Component({
  selector: 'cp-antenna-stats',
  templateUrl: './antenna-stats.component.html',
  styleUrls: ['./antenna-stats.component.scss'],
})
export class AntennaStatsComponent {

  open: boolean;
  stats: AntennaStats;
  displayStats: LabeledOption<number | string>[];

  toggle() {
    this.open = !this.open;
  }

  updateStats(antennaInputs: AntennaInput[]) {
    let relayPower = Antenna.combinedPower(antennaInputs.filter(a => a.selectedAntenna.relay)
      .map(a => new Group<Antenna>(a.selectedAntenna, a.countControl.value)));
    let directPower = Antenna.combinedPower(antennaInputs.filter(a => !a.selectedAntenna.relay)
      .map(a => new Group<Antenna>(a.selectedAntenna, a.countControl.value)));
    let relayBias = relayPower / (relayPower + directPower);

    let {averageCombinabilityExponent} = Antenna.getAverageCombinabilityExponent(
      antennaInputs.map(a => new Group<Antenna>(a.selectedAntenna, a.countControl.value)));

    this.stats = {
      totalPowerRating: Antenna.combinedPower(antennaInputs.map(a => new Group<Antenna>(a.selectedAntenna, a.countControl.value))),
      totalCost: antennaInputs.map(a => a.selectedAntenna.cost * a.countControl.value).sum(),
      totalMass: antennaInputs.map(a => a.selectedAntenna.mass * a.countControl.value).sum(),
      totalElectricityPMit: antennaInputs.map(a => a.selectedAntenna.electricityPMit * a.countControl.value).sum(),
      totalElectricityPS: antennaInputs.map(a => a.selectedAntenna.electricityPS * a.countControl.value).sum(),
      totalTransmissionSpeed: antennaInputs.map(a => a.selectedAntenna.transmissionSpeed * a.countControl.value).sum(),
      relayBias,
      averageCombinabilityExponent,
    } as AntennaStats;

    this.displayStats = [
      new LabeledOption('Total Power Rating', this.stats.totalPowerRating.toSi() + 'm'),
      new LabeledOption('Total Cost', this.stats.totalCost + ' √'),
      new LabeledOption('Total Mass', this.stats.totalMass.toFixed(2) + ' t'),
      new LabeledOption('Total Electricity/Mit', this.stats.totalElectricityPMit.toFixed(2) + ' E/Mits'),
      new LabeledOption('Total Electricity/s', this.stats.totalElectricityPS.toFixed(2) + ' E/s'),
      new LabeledOption('Total Transmission Speed', this.stats.totalTransmissionSpeed.toFixed(2) + ' Mits/s'),
    ];
  }

}
