import { ControlMeta } from './control-meta';
import { ControlMetaType } from './control-meta-type';

export class ControlMetaNumber extends ControlMeta {

  constructor(public min?: number,
              public max?: number,
              public factor?: number,
              public suffix?: string,
              public hint?: string) {
    super(ControlMetaType.Number, hint);
  }

}
