import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';
import { GameStateType } from '../../common/domain/game-state-type';
import { LabeledOption } from '../../common/domain/input-fields/labeled-option';
import { SpaceObjectType } from '../../common/domain/space-objects/space-object-type';
import { StateRow } from '../../overlays/manage-state-dialog/state-row';
import { StateIsru } from '../../pages/mining-station/domain/state-isru';
import { StateBase } from '../../services/json-interfaces/state-base';
import { StateCommnetPlanner } from '../../services/json-interfaces/state-commnet-planner';
import { StateDvPlanner } from '../../services/json-interfaces/state-dv-planner';
import { StateUniverse } from '../../services/json-interfaces/state-universe';

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
    let contents = JSON.parse(state.state) as StateBase;

    let date = new Date(state.timestamp);
    let daysSince = Math.round((Number(new Date()) - Number(date)) / (1000 * 60 * 60 * 24));

    let properties = [];
    properties.push(['Name', state.name]);
    properties.push(['Last saved', `${daysSince} day${daysSince !== 1 ? 's' : ''} ago`]);

    let isUniverseType = [GameStateType.CommnetPlanner, GameStateType.DvPlanner].includes(this.contextType);
    if (isUniverseType) {
      let universeContents = contents as unknown as StateUniverse;
      let starName = universeContents.celestialBodies.find(cb => cb.type === SpaceObjectType.Star.name).draggableHandle.label;
      properties.push(['Star', starName]);
      properties.push(['Celestial bodies', universeContents.celestialBodies.length.toString()]);
    }

    if (this.contextType === GameStateType.CommnetPlanner) {
      let commnetContents = contents as unknown as StateCommnetPlanner;

      let dsnPlanets = commnetContents.celestialBodies
        .filter(cb => cb.trackingStation);
      let bestDsn = dsnPlanets
          .sort((a, b) => b.trackingStation.slice(-1).toNumber()
            - a.trackingStation.slice(-1).toNumber())
          [0]?.trackingStation
        || 'None';

      let newProperties = [
        ['Craft', commnetContents.craft.length.toString()],
        ['DSN', bestDsn],
        ['DSN at', dsnPlanets.map(b => b.draggableHandle.label).join(', ')],
      ];

      properties.push(...newProperties);
    }

    if (this.contextType === GameStateType.DvPlanner) {
      let dvContents = contents as unknown as StateDvPlanner;

      let newProperties = [
        ['Checkpoints', dvContents.checkpoints.length.toString()],
      ];

      if (dvContents.checkpoints.length > 0) {
        newProperties.push(
          ['Start', dvContents.checkpoints.first().name],
        );
      }

      if (dvContents.checkpoints.length > 1) {
        newProperties.push(
          ['End', dvContents.checkpoints.last().name],
        );
      }

      properties.push(...newProperties);
    }

    if (this.contextType === GameStateType.Isru) {
      let isruContents = contents as unknown as StateIsru;

      properties.push(['Location', isruContents.planet.toTitleCase()]);
      properties.push(['Ore Concentration', isruContents.oreConcentration * 100 + '%']);
      properties.push(['Engineer Bonus', `+${isruContents.engineerBonus * 100}%`]);
      properties.push(['Part Count', isruContents.craftPartGroups.map(g => g.count).sum()]);
    }

    this.properties = properties
      .filter(([label]) => !this.hiddenFields.includes(label))
      .map(([label, value]) => new LabeledOption(label, value));
  }

}
