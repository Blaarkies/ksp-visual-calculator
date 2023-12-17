import { PlanetoidDto } from '../../common/domain/dtos/planetoid-dto';
import { Planetoid } from '../../common/domain/space-objects/planetoid';

export interface PlanetoidWithDto {
    planetoid: Planetoid;
    dto: PlanetoidDto;
}
