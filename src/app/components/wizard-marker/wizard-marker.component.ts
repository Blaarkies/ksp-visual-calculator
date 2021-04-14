import { Component, HostBinding, Input, ViewEncapsulation } from '@angular/core';

export interface WizardMarker {
  type: 'ring' | 'pane';
}

@Component({
  selector: 'cp-wizard-marker',
  templateUrl: './wizard-marker.component.html',
  styleUrls: ['./wizard-marker.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WizardMarkerComponent implements WizardMarker {

  _type: 'ring' | 'pane' = 'pane';
  @Input() set type(value: 'ring' | 'pane') {
    this._type = value;
    this.ringHost = this._type === 'ring';
  }


  @HostBinding('class.ring-host') ringHost: boolean;

}
