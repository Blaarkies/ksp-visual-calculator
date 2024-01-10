import { PlanetoidDto } from '../../common/domain/dtos/planetoid-dto';
import { StateUniverseDto } from '../../common/domain/dtos/state-universe.dto';
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

}
