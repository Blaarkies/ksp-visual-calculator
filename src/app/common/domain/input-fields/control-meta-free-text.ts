import { ControlMeta } from './control-meta';
import { ControlMetaType } from './control-meta-type';

export class ControlMetaFreeText<T> extends ControlMeta {

  constructor(public hint?: string) {
    super(ControlMetaType.FreeText, hint);
  }

}
