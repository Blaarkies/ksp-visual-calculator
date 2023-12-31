import { StateCommnetPlannerDto } from '../../common/domain/dtos/state-commnet-planner.dto';
import { StateContextualDto } from '../../common/domain/dtos/state-contextual.dto';
import { GameStateType } from '../../common/domain/game-state-type';
import { SpaceObjectType } from '../../common/domain/space-objects/space-object-type';
import { compareSemver } from '../../common/semver';
import { StateEntry } from '../../overlays/manage-state-dialog/state-entry';

export class OldStateSupporter {

  private readonly isUniverseContext: boolean;
  private parsedState: StateContextualDto;

  constructor(private state: StateEntry) {
    let universeContextTypes = [GameStateType.CommnetPlanner, GameStateType.DvPlanner];
    this.isUniverseContext = state.context.includesSome(universeContextTypes);
  }

  getRepairedState(): StateEntry {
    this.parsedState = JSON.parse(this.state.state as string);

    this.applyBaseFix(this.state);

    if (this.isUniverseContext) {
      this.applyUniverseContextFix(this.state);
    }

    return {
      ...this.state,
      state: JSON.stringify(this.parsedState),
    };
  }

  private applyBaseFix(state: StateEntry) {
    // @fix v1.2.6:webp format planet images introduced, but old savegames have .png in details
    let needsWebpFix = compareSemver(state.version, [1, 2, 6]) < 0;
    if (needsWebpFix) {
      let fixedAssetExt = (state.state as string).replace(/.png/g, '.webp');
      this.parsedState = JSON.parse(fixedAssetExt);
    }

    // @fix v1.3.0:null check for ids, old savegames used name
    if (!state.id) {
      state.id = state.name;
    }
  }

  private applyUniverseContextFix(state: StateEntry) {
    let parsedState = this.parsedState as StateCommnetPlannerDto;

    // @fix v1.3.2:renamed properties in state
    let needsRenaming = compareSemver(state.version, [1, 3, 2]) < 0;
    if (needsRenaming) {
      parsedState.planetoids = parsedState['celestialBodies'];
      parsedState.planetoids.forEach(p => {
        p.planetoidType = p.type;
        p.type = SpaceObjectType.Planetoid.name;
        p.draggable = p['draggableHandle'];
        p.orbit = p['draggableHandle'].orbit;

        p['draggableHandle'] = undefined;
        p['parameterData'] = undefined;
      });

      parsedState['celestialBodies'] = undefined;

      this.parsedState = parsedState;
    }

    if (state.context === GameStateType.CommnetPlanner) {
      this.applyCommnetContextFix(state, parsedState);
    }
  }

  private applyCommnetContextFix(state: StateEntry, parsedState: StateCommnetPlannerDto) {
    // @fix v1.3.2:renamed properties in state
    let needsRenaming = compareSemver(state.version, [1, 3, 2]) < 0;
    if (needsRenaming) {
      parsedState.planetoids
        .filter(p => p['trackingStation'])
        .forEach(p => {
          p.communication = {antennae: [[p['trackingStation'], 1]]};
          p['trackingStation'] = undefined;
        });

      parsedState.craft.forEach(c => {
        c.draggable = c['draggableHandle'];
        c.communication = {antennae: c['antennae']};

        parsedState['draggableHandle'] = undefined;
        parsedState['antennae'] = undefined;
      });

      this.parsedState = parsedState;
    }
  }

}
