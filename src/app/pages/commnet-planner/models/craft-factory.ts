import { BehaviorSubject } from 'rxjs';
import { CraftDto } from '../../../common/domain/dtos/craft-dto';
import { Group } from '../../../common/domain/group';
import { Craft } from '../../../common/domain/space-objects/craft';
import { CraftType } from '../../../common/domain/space-objects/craft-type';
import { Planetoid } from '../../../common/domain/space-objects/planetoid';
import { Vector2 } from '../../../common/domain/vector2';
import { SoiManager } from '../../../services/domain/soi-manager';

export class CraftFactory {

  private readonly soiManager: SoiManager;

  constructor(planetoids$: BehaviorSubject<Planetoid[]>) {
    this.soiManager = new SoiManager(planetoids$);
  }

  makeCraft(
    id: string,
    name: string,
    craftType: CraftType,
    antennaeGroups: Group<string>[],
    location?: Vector2,
    lastAttemptLocation?: number[],
  ): Craft {
    return new Craft(
      this.soiManager,
      id,
      name,
      craftType,
      antennaeGroups,
      location,
      lastAttemptLocation,
    );
  }

  makeCraftFromJson(json: CraftDto) {
    return Craft.fromJson(json, this.soiManager);
  }
}
