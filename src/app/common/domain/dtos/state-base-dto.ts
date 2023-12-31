import { Bytes } from '@firebase/firestore';
import { VersionValue } from '../../semver';

export interface StateBaseDto {
  id: string;
  name: string;
  timestamp: Date;
  context: string;
  version: VersionValue;

  state?: string | Bytes;
}
