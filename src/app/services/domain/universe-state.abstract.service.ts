import {
  Observable,
  of,
} from 'rxjs';
import { PlanetoidDto } from '../../common/domain/dtos/planetoid-dto';
import { StateCommnetPlannerDto } from '../../common/domain/dtos/state-commnet-planner.dto';
import { StateUniverseDto } from '../../common/domain/dtos/state-universe.dto';
import { SpaceObjectType } from '../../common/domain/space-objects/space-object-type';
import {
  compareSemver,
  VersionValue,
} from '../../common/semver';
import { CameraService } from '../camera.service';
import { AbstractBaseStateService } from './base-state.abstract.service';
import { AbstractUniverseBuilderService } from './universe-builder.abstract.service';

export abstract class AbstractUniverseStateService extends AbstractBaseStateService {

  protected abstract universeBuilderService: AbstractUniverseBuilderService;
  protected abstract cameraService: CameraService;

  get stateContextual(): StateUniverseDto {
    let planetoids = this.universeBuilderService.planetoids$.value;

    return {
      planetoids: planetoids?.map(b => b.toJson()) as PlanetoidDto[],
      camera: this.cameraService.toJson(),
    };
  }

  protected buildExistingState(state: string, version: VersionValue): Observable<any> {
    // @fix v1.3.1:renamed properties in state
    let needsRenaming = compareSemver(version, [1, 3, 1]) < 0;
    if (needsRenaming) {
      let parsedState: StateCommnetPlannerDto = JSON.parse(state);

      parsedState.planetoids = parsedState['celestialBodies'];
      parsedState.planetoids.forEach(p => {
        p.planetoidType = p.type;
        p.type = SpaceObjectType.Planetoid.name;
        p.draggable = p['draggableHandle'];
      });

      return of(JSON.stringify(parsedState));
    }

    return of(state);
  }

}
