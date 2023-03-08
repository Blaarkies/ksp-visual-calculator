import { Component, Input } from '@angular/core';
import { StateGame } from '../../services/json-interfaces/state-game';
import { StateCommnetPlanner } from '../../services/json-interfaces/state-commnet-planner';
import { LabeledOption } from '../../common/domain/input-fields/labeled-option';
import { SpaceObjectType } from '../../common/domain/space-objects/space-object-type';
import { StateRow } from '../../overlays/manage-state-dialog/state-row';
import { StateDvPlanner } from '../../services/json-interfaces/state-dv-planner';
import { CommonModule } from '@angular/common';
import { GameStateType } from '../../common/domain/game-state-type';

@Component({
  selector: 'cp-state-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './state-display.component.html',
  styleUrls: ['./state-display.component.scss'],
})
export class StateDisplayComponent {

  private stateRow: StateRow;

  @Input() set state(value: StateRow) {
    this.stateRow = value;
    this.updateProperties();
  }

  private contextType: GameStateType;

  @Input() set context(value: GameStateType) {
    this.contextType = value;
    this.updateProperties();
  }

  @Input() hiddenFields: string[] = [];

  properties: LabeledOption<string>[];

  private updateProperties() {
    if (!this.stateRow || !this.contextType) {
      return;
    }

    let state = this.stateRow;
    let contents = JSON.parse(state.state) as StateGame;

    let date = new Date(state.timestamp);
    let daysSince = Math.round((Number(new Date()) - Number(date)) / (1000 * 60 * 60 * 24));
    let starName = contents.celestialBodies.find(cb => cb.type === SpaceObjectType.Star.name).draggableHandle.label;
    let properties = [
      ['Name', state.name],
      ['Last saved', `${daysSince} day${daysSince !== 1 ? 's' : ''} ago`],
      ['Star', starName],
      ['Celestial bodies', contents.celestialBodies.length.toString()],
    ];

    if (this.contextType === GameStateType.CommnetPlanner) {
      let contentsSC = contents as StateCommnetPlanner;

      let dsnPlanets = contents.celestialBodies
        .filter(cb => cb.trackingStation);
      let bestDsn = dsnPlanets
          .sort((a, b) => b.trackingStation.slice(-1).toNumber()
            - a.trackingStation.slice(-1).toNumber())
          [0]?.trackingStation
        || 'None';

      let newProperties = [
        ['Craft', contentsSC.craft.length.toString()],
        ['DSN', bestDsn],
        ['DSN at', dsnPlanets.map(b => b.draggableHandle.label).join(', ')],
      ];

      properties.push(...newProperties);
    }

    if (this.contextType === GameStateType.DvPlanner) {
      let contentsDP = contents as StateDvPlanner;

      let newProperties = [
        ['Checkpoints', contentsDP.checkpoints.length.toString()],
      ];

      if (contentsDP.checkpoints.length > 0) {
        newProperties.push(
          ['Start', contentsDP.checkpoints.first().name],
        );
      }

      if (contentsDP.checkpoints.length > 1) {
        newProperties.push(
          ['End', contentsDP.checkpoints.last().name],
        );
      }

      properties.push(...newProperties);
    }

    this.properties = properties
      .filter(([label]) => !this.hiddenFields.includes(label))
      .map(([label, value]) => new LabeledOption(label, value));
  }

}
