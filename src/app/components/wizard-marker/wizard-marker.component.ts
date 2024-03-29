import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from "@angular/common";

export interface WizardMarker {
  type: 'ring' | 'pane';
}

type MarkerType = 'ring' | 'pane';

@Component({
  selector: 'cp-wizard-marker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wizard-marker.component.html',
  styleUrls: ['./wizard-marker.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WizardMarkerComponent implements WizardMarker {

  markerType: MarkerType = 'pane';

  @Input() set type(value: MarkerType) {
    this.markerType = value;
  }

  @Input() target: HTMLDivElement;

}
