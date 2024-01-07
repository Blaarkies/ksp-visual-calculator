import { Bytes } from '@firebase/firestore';
import { VersionValue } from '../../semver';

export interface StateBaseDto {
  id: string;
  name: string;
  context: string;
  timestamp: Date;
  version: VersionValue;
  deletedAt?: Date;
  state?: string | Bytes;
}
