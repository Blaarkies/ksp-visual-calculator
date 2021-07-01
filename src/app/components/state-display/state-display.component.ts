import { Component, Input } from '@angular/core';
import { StateGame } from '../../services/json-interfaces/state-game';
import { UsableRoutes } from '../../usable-routes';
import { StateSignalCheck } from '../../services/json-interfaces/state-signal-check';
import { LabeledOption } from '../../common/domain/input-fields/labeled-option';
import { StateRow } from '../../dialogs/manage-state-dialog/manage-state-dialog.component';
import { SpaceObjectType } from '../../common/domain/space-objects/space-object-type';

@Component({
  selector: 'cp-state-display',
  templateUrl: './state-display.component.html',
  styleUrls: ['./state-display.component.scss'],
})
export class StateDisplayComponent {

  private _state: StateRow;
  @Input() set state(value: StateRow) {
    this._state = value;
    this.updateProperties();
  }

  private _context: UsableRoutes;
  @Input() set context(value: UsableRoutes) {
    this._context = value;
    this.updateProperties();
  }

  properties: LabeledOption<string>[];

  private updateProperties() {
    if (!this._state || !this._context) {
      return;
    }

    let state = this._state;
    let contents = JSON.parse(state.state) as StateGame;

    let date = new Date(state.timestamp);
    // @ts-ignore
    let daysSince = Math.round((new Date() - date) / (1000 * 60 * 60 * 24));
    let starName = contents.celestialBodies.find(cb => cb.type === SpaceObjectType.Star.name).draggableHandle.label;
    let properties = [
      ['Name', state.name.slice(0, 10)],
      ['Age', `${daysSince} day${daysSince !== 1 ? 's' : ''}`],
      ['Star', starName],
      ['Celestial bodies', contents.celestialBodies.length.toString()],
    ];

    if (this._context === UsableRoutes.SignalCheck) {
      let contentsSC = contents as StateSignalCheck;

      let dsnPlanets = contents.celestialBodies
        .filter(cb => cb.trackingStation);
      let bestDsn = dsnPlanets
          .sort((a, b) => a.trackingStation.slice(-1).toNumber()
            - b.trackingStation.slice(-1).toNumber())
          [0]?.trackingStation
        || 'None';

      let newProperties = [
        ['Craft', contentsSC.craft.length.toString()],
        ['DSN', bestDsn],
        ['DSN at', dsnPlanets.map(b => b.draggableHandle.label).join(', ').slice(0, 20)],
      ];

      properties.push(...newProperties);
    }

    this.properties = properties.map(([label, value]) => new LabeledOption(label, value));
  }

}
