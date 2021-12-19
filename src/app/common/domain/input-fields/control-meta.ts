import { ControlMetaType } from './control-meta-type';

export class ControlMeta {

  constructor(public type: ControlMetaType,
              public hint?: string) {
  }

}
