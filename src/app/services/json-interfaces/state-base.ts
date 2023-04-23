import { Bytes } from '@firebase/firestore';

export interface StateBase {
  name: string;
  timestamp: Date;
  context: string;
  version: number[];

  state?: string | Bytes;
}
