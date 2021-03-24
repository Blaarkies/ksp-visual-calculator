import { CraftType } from '../../common/domain/space-objects/craft-type';
import { Group } from '../../common/domain/group';
import { Antenna } from '../../common/domain/antenna';

export class CraftDetails {

    constructor(
        public name: string,
        public craftType: CraftType,
        public antennae: Group<Antenna>[]) {
    }

}
