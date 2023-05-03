import { Bytes } from '@firebase/firestore';

export interface StateBase {
  id: string;
  name: string;
  timestamp: Date;
  context: string;
  version: number[];

  state?: string | Bytes;
}
