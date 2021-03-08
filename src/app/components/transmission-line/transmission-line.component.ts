import { Component, Input } from '@angular/core';
import { TransmissionLine } from '../../common/domain/transmission-line';

@Component({
  selector: 'cp-transmission-line',
  templateUrl: './transmission-line.component.html',
  styleUrls: ['./transmission-line.component.scss'],
})
export class TransmissionLineComponent {

  @Input() transmissionLine: TransmissionLine;

}
