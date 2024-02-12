import { Antenna } from '../../models/antenna';
import { Group } from '../../../../common/domain/group';
import { CraftType } from '../../../../common/domain/space-objects/craft-type';
import { AdvancedPlacement } from './advanced-placement';

export class CraftDetails {

  constructor(
    public id: string,
    public name: string,
    public craftType: CraftType,
    public antennae: Group<Antenna>[],
    public advancedPlacement?: AdvancedPlacement,
  ) {
  }

}
