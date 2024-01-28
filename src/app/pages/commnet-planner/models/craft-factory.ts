import { CraftDto } from '../../../common/domain/dtos/craft-dto';
import { Group } from '../../../common/domain/group';
import { AntennaeManager } from '../../../common/domain/space-objects/antennae-manager';
import { Craft } from '../../../common/domain/space-objects/craft';
import { CraftType } from '../../../common/domain/space-objects/craft-type';
import { Vector2 } from '../../../common/domain/vector2';
import { SoiManager } from '../../../services/domain/soi-manager';
import { AbstractSpaceObjectFactory } from '../../../services/domain/space-object-factory.abstract';

export class CraftFactory extends AbstractSpaceObjectFactory {

  constructor(protected soiManager: SoiManager,
              protected antennaeManager: AntennaeManager) {
    super();
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
      this.antennaeManager,
      id,
      name,
      craftType,
      antennaeGroups,
      location,
      lastAttemptLocation,
    );
  }

  makeCraftFromJson(json: CraftDto) {
    return Craft.fromJson(json, this.soiManager, this.antennaeManager);
  }
}
