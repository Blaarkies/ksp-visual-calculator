import { PlanetoidAssetDto } from './planetoid-asset.dto';

export interface StarSystemDto {
  name: string;
  dsnIds: string[];
  planetoids: PlanetoidAssetDto[];
}
