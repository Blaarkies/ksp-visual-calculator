import { Bytes } from '@firebase/firestore';

export interface StateBaseDto {
  id: string;
  name: string;
  timestamp: Date;
  context: string;
  version: number[];

  state?: string | Bytes;
}
